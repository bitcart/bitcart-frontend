import { APP_CONTENT_ROOT_ROUTE } from "../constants"

export function markdownPathToSlugs(segments: string[]) {
  if (segments.length === 0) return []

  const out = [...segments]

  out[out.length - 1] = out[out.length - 1].replace(/\.md$/, "")
  if (out.length === 1 && out[0] === "index") out.pop()

  return out
}

export function slugsToMarkdownPath(slugs: string[]) {
  const segments = [...slugs]

  if (segments.length === 0) {
    segments.push("index.md")
  } else {
    segments[segments.length - 1] += ".md"
  }

  return {
    segments,
    url: `${APP_CONTENT_ROOT_ROUTE}${segments.join("/")}`,
  }
}
