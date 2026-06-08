export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            How it works
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Match jobs, dispatch teams, and close work faster with a unified service workflow.
          </h1>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
            Malaysia Co (Maintenance Services) connects customers, technicians, and operations in one responsive system designed for field service efficiency and better communication.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/90">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Post a request</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Customers describe the job, choose preferred timing, and submit service details in one fast form.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/90">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Assign the best fit</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              The platform routes requests to available technicians with the right skills, location, and service history.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/90">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Track every job</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Monitor progress, update status, and capture completion details from dispatch to invoice.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/90">
            <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">Why customers love it</h3>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              <li>• Transparent pricing and job history in a simple dashboard.</li>
              <li>• Real-time updates when technicians accept, start, and complete work.</li>
              <li>• Fast quotes from skilled technicians without phone tag.</li>
            </ul>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/90">
            <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">Why technicians choose Malaysia Co (Maintenance Services)</h3>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              <li>• Get matched to high-value work in your specialty and region.</li>
              <li>• Manage jobs, bids, and payments from a single mobile-ready app.</li>
              <li>• Build a reputation with customer reviews and repeat bookings.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

