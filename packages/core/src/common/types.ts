export { type infer as FromSchema } from "zod"

export type RuntimeEnvTag = "testing" | "development" | "production"

export type UnionAsArray<Union, Member = Union> = [Union] extends [never]
  ? readonly []
  : Member extends Member
    ? readonly [Member, ...UnionAsArray<Exclude<Union, Member>>]
    : never

export type IsEqual<TOne, TAnother> = [TOne, TAnother] extends [TAnother, TOne] ? true : false

export type AccountHandle = `@${string}`
