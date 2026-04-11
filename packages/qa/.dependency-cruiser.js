import { libDependencyCruiserConfig } from "@bitcart/configs/by-package-type/lib-dependency-cruiser"

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  ...libDependencyCruiserConfig,

  options: {
    ...libDependencyCruiserConfig.options,

    tsConfig: {
      fileName: "tsconfig.json",
    },
  },
}
