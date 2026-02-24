import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        break;
      }
      default:
        // Unhandled event type - log but don't fail
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error processing webhook:", message);
    return NextResponse.json(
      { error: `Webhook handler failed: ${message}` },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  // Skip if not a completed payment
  if (session.payment_status !== "paid") {
    console.log("Session not paid, skipping:", session.id);
    return;
  }

  // Check if we already processed this session (idempotency)
  const existingDonation = await prisma.donation.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existingDonation) {
    console.log("Donation already processed:", session.id);
    return;
  }

  // Extract payment intent ID if available
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  // Create the donation record
  await prisma.donation.create({
    data: {
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "completed",
      email: session.customer_email ?? session.customer_details?.email ?? "",
      metadata: session.metadata ?? undefined,
    },
  });

  console.log("Donation recorded:", {
    sessionId: session.id,
    amount: session.amount_total,
    email: session.customer_email ?? session.customer_details?.email,
  });
}
