export { type infer as FromSchema } from "zod"

export type RuntimeEnvTag = "testing" | "development" | "production"

export type UnionAsArray<Union, Member = Union> = [Union] extends [never]
  ? readonly []
  : Member extends Member
    ? readonly [Member, ...UnionAsArray<Exclude<Union, Member>>]
    : never

export type IsEqual<TOne, TAnother> = [TOne, TAnother] extends [TAnother, TOne] ? true : false

export type TrailingParams<TParams extends unknown[]> = TParams extends [unknown, ...infer TRest]
  ? TRest
  : never

export type AccountHandle = `@${string}`

/**
 * Connection state and controls for a socket subscription.
 */
export type SocketConnectionHandle = {
  isConnected: boolean
  isClientOnline: boolean
  isReconnecting: boolean
  isReconnectLimitReached: boolean
  reconnect: () => void
}
