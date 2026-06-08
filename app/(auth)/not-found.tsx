export default function AuthNotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground mt-2">
          The requested auth route does not exist.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href="/login"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to Login
          </a>
          <a
            href="/signup"
            className="inline-flex items-center rounded-lg border px-5 py-3 text-sm font-medium hover:bg-accent"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  )
}

