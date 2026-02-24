"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Error message */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Oops! Something went wrong
        </h1>
        <p className="text-zinc-400 mb-2">
          We hit an unexpected error while loading this page.
        </p>
        <p className="text-zinc-500 text-sm mb-6">
          Don&apos;t worry, our team has been notified automatically.
        </p>

        {/* Error digest for support */}
        {error.digest && (
          <div className="mb-6 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Reference ID</p>
            <code className="text-xs text-zinc-400 font-mono">
              {error.digest}
            </code>
          </div>
        )}

        {/* Actions */}
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
