import { libDependencyCruiserConfig } from "@bitcart/configs/by-package-type/lib-dependency-cruiser"
import type { IConfiguration } from "dependency-cruiser"

export default {
  ...libDependencyCruiserConfig,
} satisfies IConfiguration
