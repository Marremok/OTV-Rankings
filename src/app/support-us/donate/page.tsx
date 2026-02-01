"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

const PRESET_AMOUNTS = [5, 10, 25, 50];

export default function DonatePage() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState<string>("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount(amount.toString());
    setError(null);
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, "");
    setCustomAmount(sanitized);
    setError(null);
    // Clear preset selection when typing custom amount
    const numValue = parseFloat(sanitized);
    if (PRESET_AMOUNTS.includes(numValue)) {
      setSelectedPreset(numValue);
    } else {
      setSelectedPreset(null);
    }
  };

  const getAmountInCents = (): number => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 1) return 0;
    return Math.round(amount * 100);
  };

  const isValidAmount = getAmountInCents() >= 100; // Minimum $1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("amount", getAmountInCents().toString());

      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md mx-auto w-full">
          {/* Back link */}
          <Link
            href="/support-us"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-3 bg-zinc-900/80 border border-zinc-800 rounded-full">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              <span className="bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Make a Donation
              </span>
            </h1>
            <p className="text-zinc-500 text-sm">
              Every contribution helps us stay independent and ad-free, thank you very much.
            </p>
          </div>

          {/* Donation form */}
          <form onSubmit={handleSubmit}>
            {/* Preset amount buttons */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handlePresetClick(amount)}
                  className={cn(
                    "py-3 px-4 rounded-lg font-medium text-sm transition-all",
                    "border",
                    selectedPreset === amount
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom amount input */}
            <div className="mb-6">
              <label className="block text-xs text-zinc-500 mb-2">
                Or enter a custom amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  $
                </span>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="0.00"
                  className={cn(
                    "pl-7 bg-zinc-900/60 border-zinc-800 text-zinc-100",
                    "focus:border-primary focus:ring-primary/20",
                    "placeholder:text-zinc-600"
                  )}
                />
              </div>
              {customAmount && !isValidAmount && (
                <p className="text-xs text-zinc-500 mt-1">
                  Minimum donation is $1
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={!isValidAmount || isSubmitting}
              className={cn(
                "w-full py-6 text-base font-semibold rounded-xl",
                "bg-linear-to-r from-primary to-primary/80",
                "hover:from-primary/90 hover:to-primary",
                "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
                "transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <span className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Donate ${customAmount || "0"}
                </span>
              )}
            </Button>

            {/* Security note */}
            <p className="text-center text-xs text-zinc-600 mt-4">
              Secure payment powered by Stripe
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
