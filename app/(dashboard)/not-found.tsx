export default function DashboardNotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground mt-2">
          The requested dashboard route does not exist.
        </p>
        <div className="mt-6">
          <a
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}

