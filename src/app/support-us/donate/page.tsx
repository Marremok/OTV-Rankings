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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden selection:bg-primary/30">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-125 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-75 h-75 bg-zinc-800/20 blur-[100px] rounded-full pointer-events-none" />

      <section className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-lg w-full">
          {/* Back link */}
          <Link
            href="/support-us"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors text-sm mb-6 pl-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>

          {/* Main Card */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Gratitude & Header Section */}
            <div className="pt-8 pb-6 px-8 text-center border-b border-zinc-800/50">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse group-hover:bg-primary/60 transition-all duration-500" />
                  <div className="relative p-4 bg-zinc-900 border border-zinc-700/50 rounded-full shadow-lg">
                    <Heart className="h-8 w-8 text-primary fill-primary/20" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-3 tracking-tight text-white">
                Make a Donation
              </h1>
              
              {/* Highlighted Gratitude Message */}
              <div className="mt-4 bg-linear-to-b from-primary/10 to-transparent border border-primary/20 rounded-xl p-4">
                <p className="text-primary-foreground/90 font-medium text-sm leading-relaxed">
                  "Every contribution directly supports our independence. We are deeply grateful for your generosity and belief in our mission."
                </p>
              </div>
            </div>

            {/* Donation Form Section */}
            <div className="p-8 bg-zinc-900/20">
              <form onSubmit={handleSubmit}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  Select Amount
                </label>
                
                {/* Preset amount buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {PRESET_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handlePresetClick(amount)}
                      className={cn(
                        "py-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm",
                        "border active:scale-95",
                        selectedPreset === amount
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20"
                          : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white"
                      )}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Custom amount input */}
                <div className="mb-8 relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                    Or Enter Custom Amount
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-lg group-focus-within:text-primary transition-colors">
                      $
                    </span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="0.00"
                      className={cn(
                        "pl-9 h-14 bg-zinc-950/50 border-zinc-800 text-zinc-100 text-lg font-medium rounded-xl",
                        "focus:border-primary focus:ring-1 focus:ring-primary/50",
                        "placeholder:text-zinc-700 transition-all"
                      )}
                    />
                  </div>
                  {customAmount && !isValidAmount && (
                    <p className="text-xs text-red-400 mt-2 pl-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      <span className="w-1 h-1 rounded-full bg-red-400" />
                      Minimum donation is $1
                    </p>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <p className="text-red-400 text-sm leading-tight">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={!isValidAmount || isSubmitting}
                  className={cn(
                    "w-full h-14 text-lg font-bold rounded-xl",
                    "bg-white text-zinc-950 hover:bg-zinc-200", // High contrast button
                    "shadow-lg shadow-white/5 hover:shadow-white/10",
                    "transition-all duration-300 transform hover:-translate-y-0.5",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                       <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                       Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Donate ${customAmount || "0"}
                    </span>
                  )}
                </Button>

                {/* Security note */}
                <div className="flex items-center justify-center gap-2 mt-6 text-zinc-600 opacity-80">
                  <div className="h-3 w-3 bg-green-500/20 rounded-full flex items-center justify-center">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  </div>
                  <p className="text-xs font-medium">Secure SSL Payment powered by Stripe</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
