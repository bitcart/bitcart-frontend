/**
 * The parts of the OpenAPI document read or rewritten by the generation scripts.
 */
export type OpenApiSpec = {
  components?: {
    schemas?: Record<
      string,
      {
        additionalProperties?: unknown
        properties?: Record<string, { enum?: string[] }>
      }
    >
  }
}

/**
 * Enum members keyed by schema name and property name.
 */
export type SchemaEnumOverrides = Record<string, Record<string, string[]>>
