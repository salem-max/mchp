import Link from 'next/link';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Pricing
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Simple plans for customers and technicians.
          </h1>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
            Malaysia Co (Maintenance Services) is built to keep fees transparent and service adoption friction-free.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            {
              name: 'Starter',
              price: 'Free',
              description: 'Basic access to job browsing and customer requests.',
              features: ['Profile setup', 'Job alerts', 'Service history'],
            },
            {
              name: 'Growth',
              price: '$29/mo',
              description: 'Recommended for active technicians and small teams.',
              features: ['Priority matching', 'Quotes & scheduling', 'Customer messaging'],
            },
            {
              name: 'Business',
              price: '$89/mo',
              description: 'Advanced operations for teams and managed dispatch.',
              features: ['Team accounts', 'Reporting dashboard', 'Premium support'],
            },
          ].map((plan) => (
            <section key={plan.name} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/90">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">{plan.name}</p>
              <p className="mt-4 text-4xl font-bold text-slate-950 dark:text-white">{plan.price}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 inline-flex rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                Start now
              </Link>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/90">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">No surprises</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            We keep pricing clear and let you choose the plan that fits how you work: whether you’re testing the platform, growing your business, or scaling a service team.
          </p>
        </div>
      </div>
    </main>
  );
}

