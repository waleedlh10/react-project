export const IMPORTED_THEME_STORAGE_KEY = "tweakcn-imported-theme"

export type TweakcnCssVars = {
  theme?: Record<string, string>
  light: Record<string, string>
  dark: Record<string, string>
}

export type ImportedTheme = {
  id: string
  name: string
  cssVars: TweakcnCssVars
}

type TweakcnRegistryItem = {
  name?: string
  cssVars?: {
    theme?: Record<string, string>
    light?: Record<string, string>
    dark?: Record<string, string>
  }
}

const THEME_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/

function isTweakcnHost(hostname: string) {
  return hostname === "tweakcn.com" || hostname === "www.tweakcn.com"
}

function normalizeThemeId(raw: string) {
  const id = raw.trim().replace(/\.json$/i, "")
  if (!THEME_ID_RE.test(id)) {
    throw new Error("Invalid theme id")
  }
  return id
}

/** Extract a tweakcn theme id from an editor URL, registry URL, or bare id. */
export function parseTweakcnThemeId(input: string): string {
  const value = input.trim()
  if (!value) throw new Error("Enter a tweakcn theme URL")

  if (!value.includes("://") && !value.includes("/")) {
    return normalizeThemeId(value)
  }

  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error("Invalid tweakcn theme URL")
  }

  if (!isTweakcnHost(url.hostname)) {
    throw new Error("URL must be from tweakcn.com")
  }

  const themeParam = url.searchParams.get("theme")
  if (themeParam) {
    return normalizeThemeId(themeParam)
  }

  const registryMatch = url.pathname.match(/\/r\/themes\/([^/]+)\/?$/i)
  if (registryMatch?.[1]) {
    return normalizeThemeId(decodeURIComponent(registryMatch[1]))
  }

  throw new Error("Unsupported tweakcn link. Expected a theme editor or registry URL.")
}

export async function fetchTweakcnTheme(id: string): Promise<ImportedTheme> {
  const themeId = normalizeThemeId(id)
  const response = await fetch(`https://tweakcn.com/r/themes/${encodeURIComponent(themeId)}.json`)

  if (!response.ok) {
    throw new Error(`Theme not found: ${themeId}`)
  }

  const data = (await response.json()) as TweakcnRegistryItem
  const light = data.cssVars?.light
  const dark = data.cssVars?.dark

  if (!light || !dark) {
    throw new Error("Theme response is missing light/dark CSS variables")
  }

  return {
    id: themeId,
    name: data.name || themeId,
    cssVars: {
      theme: data.cssVars?.theme,
      light,
      dark,
    },
  }
}

export function mergeThemeCssVars(
  cssVars: TweakcnCssVars,
  mode: "light" | "dark",
): Record<string, string> {
  return {
    ...(cssVars.theme ?? {}),
    ...cssVars[mode],
  }
}

export function applyCssVars(vars: Record<string, string>) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value)
  }
}

export function clearAppliedCssVars(keys: Iterable<string>) {
  const root = document.documentElement
  for (const key of keys) {
    root.style.removeProperty(`--${key}`)
  }
}

export function readStoredImportedTheme(): ImportedTheme | null {
  try {
    const raw = localStorage.getItem(IMPORTED_THEME_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ImportedTheme
    if (!parsed?.cssVars?.light || !parsed?.cssVars?.dark) return null
    return parsed
  } catch {
    return null
  }
}

export function writeStoredImportedTheme(theme: ImportedTheme | null) {
  if (!theme) {
    localStorage.removeItem(IMPORTED_THEME_STORAGE_KEY)
    return
  }
  localStorage.setItem(IMPORTED_THEME_STORAGE_KEY, JSON.stringify(theme))
}
