import { baseDependencyCruiserConfig } from "../base/dependency-cruiser.js"

/** @type {import('dependency-cruiser').IConfiguration} */
export const libDependencyCruiserConfig = {
  ...baseDependencyCruiserConfig,

  options: {
    ...baseDependencyCruiserConfig.options,

    tsConfig: {
      fileName: "tsconfig.lib.json",
    },
  },
}
