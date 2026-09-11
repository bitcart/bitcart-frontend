import { baseDependencyCruiserConfig } from "@bitcart/configs/base/dependency-cruiser"
import type { IConfiguration } from "dependency-cruiser"

export const libDependencyCruiserConfig = {
  ...baseDependencyCruiserConfig,

  forbidden: [
    {
      name: "no-external-dev-dep",
      severity: "error",

      comment:
        "Emitted dist code references a devDependency. Because deps.neverBundle keeps node_modules imports external, this becomes a broken import for consumers (devDependencies aren't installed in production). Declare it in `dependencies` or `peerDependencies`.",

      from: { path: "(^|/)dist/.+\\.(?:js|cjs|mjs)$" },

      to: {
        dependencyTypes: ["npm-dev"],
        dependencyTypesNot: ["npm", "npm-peer", "npm-optional", "type-only"],
      },
    },

    {
      name: "no-direct-implementation-detail-exposure",
      severity: "error",

      comment:
        "Direct implementation detail exposure is prohibited. Any abstraction declared within an `_internal` subdirectory must reach consumers only through one of the package's public entrypoints as a wrapper or reexport under a conventional name. Declare a wrapper or reexport for the abstraction you want to expose within the matching entrypoint's concern-driven submodule (`constants`, `effects`, `hooks`, `types`, `utils`, etc.), and ensure the submodule is reexported whole through the `index` module, which composes entrypoint's public surface.",

      //* Any `index` module at any depth, except one inside an `_internal`.
      from: {
        path: "^(?:src|dist)/(?:index\\.[^/]+|.*/index\\.[^/]+)$",
        pathNot: "^(?:src|dist)/(?:_internal/|.*/_internal/)",
      },

      //* Any module inside an `_internal` at any depth.
      to: { path: "^(?:src|dist)/(?:_internal/|.*/_internal/)" },
    },

    {
      name: "no-cross-scope-implementation-detail-access",
      severity: "error",

      comment:
        "Cross-scope implementation detail access is prohibited. An `_internal` subdirectory serves only its own entrypoint, which may reshape it at any time. Importing from another entrypoint's `_internal` couples the consumer to a detail with no stability guarantee. Depend on the owning entrypoint's public surface, or promote the abstraction into a module shared by both entrypoints.",

      //* Any module, capturing the top-level directory under `src`/`dist` as its scope.
      from: { path: "^(?:src|dist)/([^/]+)" },

      //* Any module inside an `_internal` at any depth, outside the captured scope.
      to: {
        path: "^(?:src|dist)/(?:_internal/|.*/_internal/)",
        pathNot: "^(?:src|dist)/$1/",
      },
    },
  ],

  options: {
    ...baseDependencyCruiserConfig.options,

    tsConfig: {
      fileName: "tsconfig.lib.json",
    },

    doNotFollow: { path: "node_modules" },
  },
} satisfies IConfiguration
