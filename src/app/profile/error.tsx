"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { User, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-800/50 border border-zinc-700">
          <User className="w-10 h-10 text-zinc-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Couldn&apos;t load your profile
        </h1>
        <p className="text-zinc-400 mb-6">
          We had trouble loading your profile data. Please try again.
        </p>

        {error.digest && (
          <p className="text-xs text-zinc-600 mb-6 font-mono">
            Error: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
