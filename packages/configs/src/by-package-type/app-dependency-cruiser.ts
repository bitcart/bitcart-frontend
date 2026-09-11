import { baseDependencyCruiserConfig } from "@bitcart/configs/base/dependency-cruiser"
import type { IConfiguration } from "dependency-cruiser"

export const appDependencyCruiserConfig = {
  ...baseDependencyCruiserConfig,

  options: {
    ...baseDependencyCruiserConfig.options,

    tsConfig: {
      fileName: "tsconfig.json",
    },
  },
} satisfies IConfiguration
