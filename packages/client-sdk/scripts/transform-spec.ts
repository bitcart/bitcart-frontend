import { SCHEMA_ENUM_OVERRIDES } from "./constants"
import type { OpenApiSpec } from "./types"

/**
 * Closes open strings before Orval reads the spec.
 */
export default (spec: OpenApiSpec): OpenApiSpec => {
  for (const [schemaName, properties] of Object.entries(SCHEMA_ENUM_OVERRIDES)) {
    for (const [propertyName, members] of Object.entries(properties)) {
      const property = spec.components?.schemas?.[schemaName]?.properties?.[propertyName]

      if (!property) {
        throw new Error(
          `transform-spec: ${
            schemaName
          }.${propertyName} is not in the spec anymore; retarget the override or drop it.`,
        )
      }

      property.enum = members
    }
  }

  return spec
}
