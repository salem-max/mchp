export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Terms of Service
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Terms of use for Malaysia Co (Maintenance Services).
          </h1>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
            These terms govern your access and use of the Malaysia Co (Maintenance Services) platform as a customer or technician.
          </p>
        </div>

        <div className="mt-12 space-y-10 text-sm leading-7 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Acceptance</h2>
            <p className="mt-4">By using Malaysia Co (Maintenance Services), you agree to comply with these terms and any updates we publish.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">User accounts</h2>
            <p className="mt-4">You are responsible for maintaining the security of your account and the accuracy of your information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Service use</h2>
            <p className="mt-4">Customers must provide honest job details. Technicians must deliver work according to agreed scope and timeline.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Fees and payments</h2>
            <p className="mt-4">Charges are based on the selected plan and individual service pricing. Refunds and disputes are handled through our support team.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Limitation of liability</h2>
            <p className="mt-4">Malaysia Co (Maintenance Services) is a platform connecting customers and technicians and is not responsible for professional advice or the results of services performed.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

