export { type infer as FromSchema } from "zod"

export type IsEqual<TOne, TAnother> = [TOne, TAnother] extends [TAnother, TOne] ? true : false

/**
 * Resolves to `true` when the `as const` tuple `List` holds every member of `Union` exactly once.
 */
export type IsUnionMemberList<
  Union,
  List extends readonly unknown[],
  Listed = never,
> = List extends readonly [infer Head, ...infer Tail]
  ? [Head] extends [Listed]
    ? false
    : IsUnionMemberList<Union, Tail, Listed | Head>
  : IsEqual<Union, Listed>

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
