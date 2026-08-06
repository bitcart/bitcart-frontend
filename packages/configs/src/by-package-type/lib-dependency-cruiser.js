import { baseDependencyCruiserConfig } from "../base/dependency-cruiser.js"

/** @type {import('dependency-cruiser').IConfiguration} */
export const libDependencyCruiserConfig = {
  ...baseDependencyCruiserConfig,

  forbidden: [
    {
      name: "no-external-dev-dep",
      severity: "error",

      comment:
        "Emitted dist code references a devDependency. Because deps.skipNodeModulesBundle keeps node_modules imports external, this becomes a broken import for consumers (devDependencies aren't installed in production). Declare it in `dependencies` or `peerDependencies`.",

      from: { path: "(^|/)dist/.+\\.(?:js|cjs|mjs)$" },

      to: {
        dependencyTypes: ["npm-dev"],
        dependencyTypesNot: ["npm", "npm-peer", "npm-optional", "type-only"],
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
}
