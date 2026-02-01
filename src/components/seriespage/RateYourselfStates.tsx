"use client";

import { AlertCircle, Star } from "lucide-react";

// ============================================
// ERROR STATE
// ============================================

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-red-500/10 mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">Unable to load pillars</h3>
      <p className="text-sm text-zinc-500 max-w-md">{message}</p>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-zinc-800/60 mb-4">
        <Star className="w-8 h-8 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">No rating categories yet</h3>
      <p className="text-sm text-zinc-500 max-w-md">
        Rating categories haven&apos;t been set up for this media type yet.
        Check back later!
      </p>
    </div>
  );
}

// ============================================
// SIGN IN PROMPT
// ============================================

export function SignInPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-primary/10 mb-4">
        <Star className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">Sign in to rate</h3>
      <p className="text-sm text-zinc-500 max-w-md">
        Create an account or sign in to submit your ratings and track your opinions.
      </p>
    </div>
  );
}
