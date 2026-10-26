const toScriptBase = (src: string, scriptPath: string): string | null => {
  try {
    const { origin, pathname } = new URL(src)

    return pathname.endsWith(scriptPath)
      ? `${origin}${pathname.slice(0, -scriptPath.length)}`
      : null
  } catch {
    return null
  }
}

export const resolveScriptBase = (
  scriptPath: `/${string}`,
  doc: Document = document,
): string | null => {
  const current = doc.currentScript instanceof HTMLScriptElement ? [doc.currentScript.src] : []
  const sources = [...current, ...Array.from(doc.scripts, ({ src }) => src)]

  return sources.map((src) => toScriptBase(src, scriptPath)).find((base) => base !== null) ?? null
}

export const stripTrailingSlashes = (url: string): string => url.replace(/\/+$/u, "")
