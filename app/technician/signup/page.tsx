import Link from 'next/link';

export default function TechnicianSignupPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Technician Signup
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Join Malaysia Co (Maintenance Services) and grow your service business.
          </h1>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
            Create your profile, showcase expertise, and start receiving job requests from customers in your area.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            { title: 'Verified profiles', description: 'Build trust with customers through ratings, reviews, and credentials.' },
            { title: 'Automatic matching', description: 'Get notified about jobs that fit your skills, availability, and location.' },
            { title: 'Flexible work', description: 'Choose when you want to accept jobs and manage your schedule from one dashboard.' },
          ].map((item) => (
            <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/90">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/90">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Ready to get started?</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Complete your sign-up in minutes and begin receiving service requests from customers nearby.
          </p>
          <Link href="/signup" className="mt-8 inline-flex rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Create your account
          </Link>
        </div>
      </div>
    </main>
  );
}

