import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/theme-provider"
import { fetchTweakcnTheme, parseTweakcnThemeId } from "@/lib/tweakcn"

export function ThemeUrlApply() {
  const { applyImportedTheme } = useTheme()
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleApply() {
    setError(null)
    setLoading(true)
    try {
      const id = parseTweakcnThemeId(url)
      const theme = await fetchTweakcnTheme(id)
      applyImportedTheme(theme)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply theme")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className="flex min-w-0 flex-1 items-center justify-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        void handleApply()
      }}
    >
      <div className="flex min-w-0 max-w-md flex-1 flex-col gap-1">
        <Input
          value={url}
          onChange={(event) => {
            setUrl(event.target.value)
            if (error) setError(null)
          }}
          placeholder="https://tweakcn.com/editor/theme?theme=claude"
          aria-label="tweakcn theme URL"
          aria-invalid={error ? true : undefined}
          disabled={loading}
          className="h-9"
        />
        {error ? (
          <p className="truncate text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="submit" size="sm" className="h-9 shrink-0" disabled={loading || !url.trim()}>
        {loading ? "Applying…" : "Apply"}
      </Button>
    </form>
  )
}
