import { libDependencyCruiserConfig } from "@bitcart/configs/by-package-type/lib-dependency-cruiser"
import type { IConfiguration } from "dependency-cruiser"

export default {
  ...libDependencyCruiserConfig,

  options: {
    ...libDependencyCruiserConfig.options,

    tsConfig: {
      fileName: "tsconfig.json",
    },
  },
} satisfies IConfiguration
