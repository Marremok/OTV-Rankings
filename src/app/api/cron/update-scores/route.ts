import { NextRequest, NextResponse } from "next/server"
import { updateAllSeriesScoresAndRankings } from "@/lib/actions/scoring"

/**
 * Cron Job Endpoint: Update Series Scores and Rankings
 *
 * This endpoint updates all series pillar scores, overall scores, and rankings.
 * It should be called periodically (e.g., every hour) by a cron service.
 *
 * ## How to Run
 *
 * ### Development (Manual):
 * ```bash
 * curl -X POST http://localhost:3000/api/cron/update-scores \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 * ```
 *
 * ### Production (Vercel Cron):
 * Add to vercel.json:
 * ```json
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-scores",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 * ```
 *
 * ### Production (External Cron Service):
 * Use services like cron-job.org, Upstash, or GitHub Actions to call this endpoint.
 *
 * ## Security
 * Protected by CRON_SECRET environment variable.
 * Vercel cron jobs automatically include the correct authorization header.
 */

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    // In production, require CRON_SECRET
    if (process.env.NODE_ENV === "production") {
      if (!cronSecret) {
        console.error("[Cron] CRON_SECRET not configured")
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        )
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        console.warn("[Cron] Unauthorized request attempt")
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    console.log("[Cron] Starting score update job...")

    const result = await updateAllSeriesScoresAndRankings()

    console.log("[Cron] Score update job completed successfully")

    return NextResponse.json({
      message: "Scores and rankings updated successfully",
      ...result,
    })
  } catch (error) {
    console.error("[Cron] Score update job failed:", error)

    // Log full error stack for debugging
    if (error instanceof Error) {
      console.error("[Cron] Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update scores and rankings",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

// Also support GET for easy browser testing in development
export async function GET(request: NextRequest) {
  // Only allow GET in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Method not allowed. Use POST in production." },
      { status: 405 }
    )
  }

  return POST(request)
}
