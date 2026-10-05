import { readdir, rm, rmdir } from "node:fs/promises"
import { join } from "node:path"

import type { TsdownHooks } from "tsdown"

/**
 * Deletes files and empty directories left in the output directory by earlier builds.
 *
 * Library builds run with `clean: false`: a dev server or a concurrent build may be reading the
 * output directory, and emptying it before a build leaves it incomplete until the build ends.
 * The build must be the only writer of its output directory.
 */
export const staleOutputRemovalHooks: Partial<TsdownHooks> = {
  "build:done": async ({ chunks, options }) => {
    const emittedPaths = new Set(
      chunks.flatMap((chunk) => [
        join(chunk.outDir, chunk.fileName),

        ...(chunk.type === "chunk" && chunk.sourcemapFileName
          ? [join(chunk.outDir, chunk.sourcemapFileName)]
          : []),
      ]),
    )

    const entries = await readdir(options.outDir, { recursive: true, withFileTypes: true })

    const stalePaths = entries
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name))
      .filter((path) => !emittedPaths.has(path))

    await Promise.all(stalePaths.map((path) => rm(path)))

    //* Deepest first: a parent directory empties only once its children are removed.
    const outputDirectories = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(entry.parentPath, entry.name))
      .sort((left, right) => right.length - left.length)

    for (const outputDirectory of outputDirectories) {
      if ((await readdir(outputDirectory)).length === 0) await rmdir(outputDirectory)
    }
  },
}
