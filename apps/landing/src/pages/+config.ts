import { createVikeConfig } from "@bitcart/vike-kit/config"
import vikeReact from "vike-react/config"
import vikeReactQuery from "vike-react-query/config"

export default createVikeConfig({
  extends: [vikeReact, vikeReactQuery],
  passToClient: ["web3icons"],
  ssr: true,
})
