export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70">Legal</span>
          <h1 className="text-4xl font-bold tracking-tight mt-3 mb-3">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Last updated: February 2026</p>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using OTV-Rankings, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Use of the Platform</h2>
            <p>OTV-Rankings is a community platform for rating and discussing TV series and characters. You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others.</p>
            <p>You must not:</p>
            <ul className="list-disc list-outside pl-5 space-y-2 text-zinc-400">
              <li>Use the platform to distribute spam, malware, or other harmful content.</li>
              <li>Attempt to gain unauthorized access to other user accounts or platform systems.</li>
              <li>Scrape or harvest data from the platform without prior written permission.</li>
              <li>Impersonate another person or misrepresent your identity.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account credentials. You are responsible for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior on the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. User-Generated Content</h2>
            <p>
              Ratings, reviews, and other content you submit to OTV-Rankings remain your responsibility. By submitting content, you grant OTV-Rankings a non-exclusive, worldwide, royalty-free license to use, display, and aggregate that content for the purposes of operating the platform (e.g., computing community scores).
            </p>
            <p>
              You agree not to submit content that is defamatory, hateful, or otherwise unlawful.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Intellectual Property</h2>
            <p>
              The OTV-Rankings platform, including its design, code, and branding, is the intellectual property of OTV-Rankings. Unauthorized reproduction or redistribution of platform assets is prohibited.
            </p>
            <p>
              TV series titles, character names, and related media are the property of their respective owners. OTV-Rankings does not claim ownership of any third-party intellectual property referenced on the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Disclaimer of Warranties</h2>
            <p>
              OTV-Rankings is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee that the platform will be available at all times or free of errors. Community scores and rankings are based on user-submitted data and do not represent an official or objective assessment of any media.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, OTV-Rankings shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms. We will update the "Last updated" date above with each revision.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Governing Law</h2>
            <p>
              These terms are governed by applicable law. Any disputes arising from use of OTV-Rankings will be resolved in accordance with the jurisdiction in which the platform operates.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
