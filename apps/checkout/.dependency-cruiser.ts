import { appDependencyCruiserConfig } from "@bitcart/configs/by-package-type/app-dependency-cruiser"
import type { IConfiguration } from "dependency-cruiser"

export default {
  ...appDependencyCruiserConfig,
} satisfies IConfiguration
