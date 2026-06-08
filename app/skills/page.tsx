export default function SkillsPage() {
  const categories = [
    { title: 'Plumbing', items: ['Leak repair', 'Pipe replacement', 'Fixture installation'] },
    { title: 'Electrical', items: ['Outlet wiring', 'Panel upgrades', 'Lighting repair'] },
    { title: 'HVAC', items: ['Filter service', 'System maintenance', 'Thermostat setup'] },
    { title: 'Carpentry', items: ['Cabinet work', 'Door repair', 'Finish carpentry'] },
    { title: 'Cleaning', items: ['Deep cleaning', 'Move-in/out cleaning', 'Pressure washing'] },
    { title: 'Smart home', items: ['Device setup', 'Network troubleshooting', 'Automation'] },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Skills
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Browse technician skills and service specialties.
          </h1>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
            Malaysia Co (Maintenance Services) helps customers find qualified technicians based on the services they need most.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <section key={category.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/90">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{category.title}</h2>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {category.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

