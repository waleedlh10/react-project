import { createContext, useContext, useEffect, useRef, useState } from "react"
import { DEFAULT_THEME } from "@/lib/themes-config"
import {
  applyCssVars,
  clearAppliedCssVars,
  mergeThemeCssVars,
  readStoredImportedTheme,
  writeStoredImportedTheme,
  type ImportedTheme,
} from "@/lib/tweakcn"

type Theme = string

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  importedTheme: ImportedTheme | null
  applyImportedTheme: (theme: ImportedTheme) => void
  clearImportedTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: DEFAULT_THEME,
  setTheme: () => null,
  importedTheme: null,
  applyImportedTheme: () => null,
  clearImportedTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function getMode(theme: string): "light" | "dark" {
  return theme.endsWith("-light") ? "light" : "dark"
}

function getColorTheme(theme: string): string {
  if (theme.endsWith("-dark")) return theme.slice(0, -"-dark".length)
  if (theme.endsWith("-light")) return theme.slice(0, -"-light".length)
  return "default"
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = "tweakcn-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () =>
      (typeof window !== "undefined"
        ? localStorage.getItem(storageKey)
        : null) || defaultTheme,
  )
  const [importedTheme, setImportedTheme] = useState<ImportedTheme | null>(
    () => (typeof window !== "undefined" ? readStoredImportedTheme() : null),
  )
  const appliedVarKeysRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const root = window.document.documentElement
    const mode = getMode(theme)
    const isImported = importedTheme !== null
    const dataTheme = isImported
      ? `imported-${mode}`
      : theme.startsWith("imported-")
        ? `default-${mode}`
        : theme

    root.setAttribute("data-theme", dataTheme)
    root.classList.toggle("dark", mode === "dark")

    if (importedTheme) {
      const vars = mergeThemeCssVars(importedTheme.cssVars, mode)
      clearAppliedCssVars(appliedVarKeysRef.current)
      applyCssVars(vars)
      appliedVarKeysRef.current = new Set(Object.keys(vars))
    } else if (appliedVarKeysRef.current.size > 0) {
      clearAppliedCssVars(appliedVarKeysRef.current)
      appliedVarKeysRef.current = new Set()
    }
  }, [theme, importedTheme])

  const setTheme = (nextTheme: Theme) => {
    if (importedTheme && !nextTheme.startsWith("imported-")) {
      const nextColor = getColorTheme(nextTheme)
      // Switching to a built-in color theme clears the import.
      if (nextColor !== "imported") {
        writeStoredImportedTheme(null)
        setImportedTheme(null)
      }
    }
    localStorage.setItem(storageKey, nextTheme)
    setThemeState(nextTheme)
  }

  const applyImportedTheme = (next: ImportedTheme) => {
    const mode = getMode(theme)
    const importedKey = `imported-${mode}`
    writeStoredImportedTheme(next)
    setImportedTheme(next)
    localStorage.setItem(storageKey, importedKey)
    setThemeState(importedKey)
  }

  const clearImportedTheme = () => {
    const mode = getMode(theme)
    writeStoredImportedTheme(null)
    setImportedTheme(null)
    const fallback = `default-${mode}`
    localStorage.setItem(storageKey, fallback)
    setThemeState(fallback)
  }

  const value: ThemeProviderState = {
    theme,
    setTheme,
    importedTheme,
    applyImportedTheme,
    clearImportedTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

export { DEFAULT_THEME }
