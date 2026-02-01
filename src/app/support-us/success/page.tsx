import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, CheckCircle, ArrowRight } from "lucide-react";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/support-us");
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });
  } catch {
    redirect("/support-us");
  }

  const status = session.status;

  if (status === "open") {
    redirect("/support-us/donate");
  }

  if (status !== "complete") {
    redirect("/support-us");
  }

  // Get donation amount for display
  const amountInCents = session.amount_total || 0;
  const amountFormatted = (amountInCents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* Success animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Animated glow */}
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 animate-pulse" style={{ animationDelay: "0.5s" }} />

              {/* Icon container */}
              <div className="relative p-5 bg-zinc-900/80 border border-primary/30 rounded-full">
                <div className="relative">
                  <Heart className="h-10 w-10 text-primary fill-primary" />
                  <CheckCircle className="h-5 w-5 text-zinc-950 fill-primary absolute -bottom-1 -right-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Thank you message */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Thank You!
            </span>
          </h1>

          {/* Amount */}
          <p className="text-lg text-zinc-300 mb-2">
            Your donation of <span className="text-primary font-semibold">${amountFormatted}</span> has been received.
          </p>

          {/* Gratitude message */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-6 my-8">
            <p className="text-zinc-400 leading-relaxed">
              Your generosity helps us keep OTV Rankings running and improving.
              Because of supporters like you, we can continue to celebrate quality
              storytelling without ads or compromises.
            </p>
            <p className="text-zinc-500 text-sm mt-4">
              We truly appreciate your support.
            </p>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg transition-colors font-medium"
            >
              Explore Rankings
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/support-us"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Back to Support
            </Link>
          </div>

          {/* Subtle footer */}
          <p className="text-xs text-zinc-600 mt-10">
            A confirmation has been sent to your email.
          </p>
        </div>
      </section>
    </div>
  );
}
