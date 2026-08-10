import { createVikeConfig } from "@bitcart/vike-kit/config"
import vikeReact from "vike-react/config"

export default createVikeConfig({
  extends: [vikeReact],
  ssr: true,
})
