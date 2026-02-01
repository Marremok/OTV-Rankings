/**
 * Manual Score Update Script
 *
 * Run this script during development to manually update all series scores and rankings.
 *
 * Usage:
 *   npx tsx scripts/update-scores.ts
 *
 * Or via the API endpoint (recommended):
 *   curl http://localhost:3000/api/cron/update-scores
 *
 * Note: Make sure your dev server is running (npm run dev) before using the API method.
 */

const API_URL = process.env.API_URL || "http://localhost:3000"

async function updateScores() {
  console.log("🚀 Starting score update via API...")
  console.log(`📡 Calling ${API_URL}/api/cron/update-scores`)

  try {
    const response = await fetch(`${API_URL}/api/cron/update-scores`, {
      method: "GET", // GET is allowed in development
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("❌ Server error:", result)
      throw new Error(`HTTP error! status: ${response.status} - ${result.message || "Unknown error"}`)
    }

    if (result.success) {
      console.log("\n✨ Score update completed successfully!")
      console.log(`📊 Updated ${result.scores?.updatedCount || 0} series`)
      console.log(`🏆 Ranked ${result.rankings?.rankedCount || 0} series`)
      console.log(`⏱️  Total time: ${result.totalDurationMs}ms`)

      if (result.scores?.results) {
        console.log("\n📈 Top 10 Series:")
        const sorted = [...result.scores.results]
          .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
          .slice(0, 10)

        sorted.forEach((s: { slug: string; score: number }, i: number) => {
          console.log(`  ${i + 1}. ${s.slug || "no-slug"} - ${s.score}`)
        })
      }
    } else {
      console.error("❌ Update failed:", result.error || result.message)
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      console.error("\n❌ Connection refused!")
      console.error("Make sure your dev server is running: npm run dev")
    } else {
      console.error("\n❌ Error:", error)
    }
    process.exit(1)
  }
}

// Run the script
updateScores()
