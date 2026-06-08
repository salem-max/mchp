export default function JobsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Jobs
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Explore service requests and find the next job faster.
          </h1>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
            Browse available jobs, compare scope and budget, and choose the work that matches your skills and location.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Electrical repairs', description: 'Lighting, outlets, wiring troubleshooting, and safety checks.' },
            { title: 'Plumbing service', description: 'Leak repair, pipe maintenance, drain clearing, and fixture installs.' },
            { title: 'HVAC maintenance', description: 'Filter replacement, tune-ups, and emergency climate service.' },
          ].map((item) => (
            <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/90">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>

        <section className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/90">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">What you will see</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <li>• Job title and service type</li>
            <li>• Estimated budget and customer availability</li>
            <li>• Service location and property details</li>
            <li>• Technician rating and customer expectations</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

