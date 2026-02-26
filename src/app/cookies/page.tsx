export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70">Legal</span>
          <h1 className="text-4xl font-bold tracking-tight mt-3 mb-3">Cookie Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: February 2026</p>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. What Are Cookies</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently and to provide information to site owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. How We Use Cookies</h2>
            <p>OTV-Rankings uses cookies and similar technologies for the following purposes:</p>

            <div className="space-y-4 mt-4">
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 space-y-2">
                <p className="font-semibold text-white text-sm">Essential Cookies</p>
                <p className="text-zinc-400 text-sm">
                  Required for the platform to function. These handle authentication (keeping you signed in) and session management. You cannot opt out of these without disabling core features.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 space-y-2">
                <p className="font-semibold text-white text-sm">Analytics Cookies (PostHog)</p>
                <p className="text-zinc-400 text-sm">
                  We use PostHog to understand how users interact with OTV-Rankings. PostHog collects anonymized usage data including pages visited, features used, and session recordings. This data helps us improve the platform. PostHog data is processed in the EU.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 space-y-2">
                <p className="font-semibold text-white text-sm">Error Tracking (Sentry)</p>
                <p className="text-zinc-400 text-sm">
                  Sentry uses browser storage to correlate error reports with user sessions. This helps us diagnose and fix bugs. Error data is processed in the EU.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Third-Party Cookies</h2>
            <p>
              If you sign in via Google OAuth, Google may set cookies on your device as part of their authentication flow. These are governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google&apos;s Privacy Policy</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Managing Cookies</h2>
            <p>
              You can control and delete cookies through your browser settings. Note that disabling essential cookies will prevent you from signing in or using personalized features.
            </p>
            <p>
              Most modern browsers allow you to view, delete, and block cookies on a per-site basis. Refer to your browser&apos;s help documentation for instructions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy to reflect changes in our practices or for legal reasons. The "Last updated" date above will reflect the most recent revision.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
