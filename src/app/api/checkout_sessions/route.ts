import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { donationAmountSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    const formData = await request.formData();
    const amountRaw = formData.get("amount");
    const amountInCents = parseInt(String(amountRaw), 10);

    // Validate amount using Zod schema
    const validation = donationAmountSchema.safeParse(amountInCents);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Invalid donation amount";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Create Checkout Session with dynamic amount
    const session = await stripe.checkout.sessions.create({
      submit_type: "donate",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to OTV Rankings",
              description: "Thank you for supporting our platform!",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/support-us/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/support-us/donate?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    const statusCode = (err as { statusCode?: number })?.statusCode || 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
