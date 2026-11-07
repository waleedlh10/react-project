import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <nav className="flex h-14 items-center gap-1 px-4" aria-label="Main">
          <a
            href="/"
            className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground bg-accent"
            aria-current="page"
          >
            Dashboard
          </a>
        </nav>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  )
}

export default App
