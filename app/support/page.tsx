export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Support
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Help center and support resources.
          </h1>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
            Need assistance? Find answers to common questions and reach our support team directly.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/90">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Frequently asked questions</h2>
            <dl className="mt-6 space-y-6 text-sm leading-7 text-slate-700 dark:text-slate-300">
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">How do I post a job?</dt>
                <dd className="mt-2">Create an account, open the jobs page, and submit your service request with the details and preferred dates.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">How are technicians verified?</dt>
                <dd className="mt-2">Technician profiles include past job history, skills, and customer ratings to help you choose the right professional.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">Can I manage multiple properties?</dt>
                <dd className="mt-2">Yes. Your customer dashboard keeps service requests and job history organized across locations.</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/90">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Contact support</h2>
            <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              Our support team is available to help with account setup, service questions, and technical issues.
            </p>
            <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p><strong>Email:</strong> <a href="mailto:support@fixswift.com" className="text-cyan-500 hover:text-cyan-400">support@fixswift.com</a></p>
              <p><strong>Response time:</strong> 1–2 business days</p>
              <p><strong>Hours:</strong> Monday – Friday, 9am – 6pm</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

