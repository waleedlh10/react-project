import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom"
import { ThemeToggle } from "./components/ThemeToggle"
import Dashboard from "./pages/Dashboard"

function DashboardLayout() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <nav className="flex items-center gap-1" aria-label="Main">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                [
                  "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                ].join(" ")
              }
            >
              Dashboard
            </NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
