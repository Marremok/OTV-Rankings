"use client";

import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
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
    <html>
      <body className="bg-zinc-950 text-zinc-100">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-zinc-400 mb-6">
              We encountered an unexpected error. Our team has been notified and
              is working to fix the issue.
            </p>
            {error.digest && (
              <p className="text-xs text-zinc-600 mb-6 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} variant="default">
                Try again
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
              >
                Go home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
