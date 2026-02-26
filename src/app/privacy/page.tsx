export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70">Legal</span>
          <h1 className="text-4xl font-bold tracking-tight mt-3 mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: February 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-10 text-zinc-300 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Who We Are</h2>
            <p>
              OTV-Rankings is a community-driven platform for rating and ranking TV series and characters. We are committed to being transparent about what data we collect and how we use it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. What We Collect</h2>
            <p>When you create an account and use OTV-Rankings, we collect the following:</p>
            <ul className="list-disc list-outside pl-5 space-y-2 text-zinc-400">
              <li><span className="text-zinc-300 font-medium">Account information</span> — your display name, email address, and profile picture (from Google if you sign in via Google OAuth).</li>
              <li><span className="text-zinc-300 font-medium">Ratings and activity</span> — scores you submit for series and characters, your favorites, watchlist, and currently-watching status.</li>
              <li><span className="text-zinc-300 font-medium">Usage data</span> — pages visited, features used, and interactions with the site, collected via PostHog analytics.</li>
              <li><span className="text-zinc-300 font-medium">Session data</span> — authentication tokens stored securely in your browser to keep you signed in.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. How We Use Your Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc list-outside pl-5 space-y-2 text-zinc-400">
              <li>Provide and improve the ranking and rating features of the platform.</li>
              <li>Compute community scores from user-submitted ratings.</li>
              <li>Display your public profile and ratings to other users.</li>
              <li>Analyze usage patterns to improve the user experience.</li>
              <li>Send important account-related communications when necessary.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Data Sharing</h2>
            <p>
              We do not sell your personal data. We share data only with the third-party services necessary to operate the platform:
            </p>
            <ul className="list-disc list-outside pl-5 space-y-2 text-zinc-400">
              <li><span className="text-zinc-300 font-medium">Prisma / PostgreSQL</span> — our database provider for storing your account and rating data.</li>
              <li><span className="text-zinc-300 font-medium">Google OAuth</span> — if you choose to sign in with Google, your name, email, and profile picture are shared with us by Google.</li>
              <li><span className="text-zinc-300 font-medium">PostHog</span> — analytics provider for understanding how the platform is used. Data is anonymized where possible.</li>
              <li><span className="text-zinc-300 font-medium">Sentry</span> — error tracking to help us identify and fix bugs. Error reports may include limited technical context.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Data Retention</h2>
            <p>
              Your account data is retained for as long as your account exists. If you delete your account, your personal data and ratings are permanently removed from our systems. Anonymized or aggregated data may be retained for analytical purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-outside pl-5 space-y-2 text-zinc-400">
              <li>Access the data we hold about you.</li>
              <li>Update your account information at any time via your profile settings.</li>
              <li>Delete your account, which will permanently remove your personal data.</li>
              <li>Object to or restrict the processing of your data in certain circumstances.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your data. Passwords are hashed and never stored in plaintext. Authentication is handled via Better Auth with industry-standard security practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be reflected in the "Last updated" date above. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Contact</h2>
            <p>
              If you have questions about this policy or your data, please reach out via our social channels or the contact information listed on the site.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
