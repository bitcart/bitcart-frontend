import { createVikeConfig } from "@bitcart/vike-kit/config"
import vikeReactQuery from "vike-react-query/config"
import vikeReact from "vike-react/config"

export default createVikeConfig({
  extends: [vikeReact, vikeReactQuery],
  ssr: true,
})
