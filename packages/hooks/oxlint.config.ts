import { baseOxlintConfig } from "@bitcart/configs/base/oxlint"
import { reactOxlintConfig } from "@bitcart/configs/by-view-layer/react-oxlint"
import { defineConfig } from "oxlint"

export default defineConfig({
  extends: [baseOxlintConfig, reactOxlintConfig],
})
