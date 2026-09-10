import type { IsEqual } from "@bitcart/core/types"

export type EnvelopeFreePayload<TOptions extends { query?: unknown } | undefined> =
  NonNullable<NonNullable<TOptions>["query"]> extends {
    select?: (data: infer TEnvelope) => unknown
  }
    ? TEnvelope extends { data: infer TPayload }
      ? TPayload
      : never
    : never

export type QueryOptionsWithoutSelect<TOptions extends { query?: unknown } | undefined> = Omit<
  NonNullable<NonNullable<TOptions>["query"]>,
  "select"
>

export type PayloadEnvelopeFreeQueryHookOptions<
  TOptions extends { query?: unknown } | undefined,
  TData,
  TSource = EnvelopeFreePayload<TOptions>,
> = Omit<NonNullable<TOptions>, "query"> &
  (IsEqual<TData, TSource> extends true
    ? { query?: QueryOptionsWithoutSelect<TOptions> & { select?: (data: TSource) => TData } }
    : { query: QueryOptionsWithoutSelect<TOptions> & { select: (data: TSource) => TData } })

export type PayloadEnvelopeFreeQueryParams<
  TOptions extends { query?: unknown } | undefined,
  TData,
  TSource = EnvelopeFreePayload<TOptions>,
> =
  IsEqual<TData, TSource> extends true
    ? { options?: PayloadEnvelopeFreeQueryHookOptions<TOptions, TData, TSource> }
    : { options: PayloadEnvelopeFreeQueryHookOptions<TOptions, TData, TSource> }
