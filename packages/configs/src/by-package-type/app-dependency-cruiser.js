import { baseDependencyCruiserConfig } from "../base/dependency-cruiser.js"

/** @type {import('dependency-cruiser').IConfiguration} */
export const appDependencyCruiserConfig = {
  ...baseDependencyCruiserConfig,

  options: {
    ...baseDependencyCruiserConfig.options,

    tsConfig: {
      fileName: "tsconfig.app.json",
    },
  },
}
