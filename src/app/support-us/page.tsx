"use client";

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * SupportPage - Focused, minimal "Support Us" page
 * Donate button visible immediately without scrolling
 */
export default function SupportPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Main Content - Centered vertically */}
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl mx-auto text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 bg-zinc-900/80 border border-zinc-800 rounded-full">
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Support OTV Rankings
            </span>
          </h1>

          {/* Description */}
          <p className="text-zinc-400 leading-relaxed mb-8 max-w-md mx-auto">
            We're building a platform where quality storytelling is recognized and celebrated.
            But running a website is unfortunately not free, so your support helps keep us independent and ad-free.
          </p>

          {/* Donate Button - Immediately visible */}
          <Link href={"/support-us/donate"}>
            <Button
              size="lg"
              className={cn(
                "relative group px-10 py-6 text-lg font-semibold rounded-xl",
                "bg-linear-to-r from-primary to-primary/80",
                "hover:from-primary/90 hover:to-primary",
                "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
                "transition-all duration-300"
              )}
            >
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Donate
            </span>
          </Button>
          </Link>

          <p className="text-sm text-zinc-600 mt-4">
            Secure payment powered by Stripe
          </p>

          {/* Divider */}
          <div className="my-10 h-px w-full bg-linear-to-r from-transparent via-zinc-800 to-transparent" />

          {/* Alternative Support */}
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-4">
              Not ready to donate? You can still help:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <SupportOption>Rate your favorite shows</SupportOption>
              <SupportOption>Share with friends</SupportOption>
              <SupportOption>Give us feedback</SupportOption>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-10">
            <Link
              href="/"
              className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * SupportOption - Small pill for alternative support options
 */
function SupportOption({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1.5 bg-zinc-900/60 border border-zinc-800/50 rounded-full text-xs text-zinc-400">
      {children}
    </span>
  );
}
