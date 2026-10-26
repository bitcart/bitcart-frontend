export type SubmitErrors<TField extends string> = {
  form?: string
  fields: Partial<Record<TField, { message: string }>>
}

/**
 * The errors to show after a server rejects a submit, in the shape an `onSubmitAsync` validator
 * returns. Each rejected form field gets `describe`'s message; a rejection that names none of the
 * form's fields gets `fallback` for the whole form.
 *
 * @example
 * ```ts
 * onSubmitAsync: async ({ value }) => {
 *   try {
 *     await save(value)
 *   } catch (error) {
 *     return toSubmitErrors({
 *       rejected: getRejectedFieldNames(error),
 *       fieldNames: { email: "buyer_email" },
 *       describe: () => t`Enter a valid email address.`,
 *       fallback: t`Couldn't save. Please try again.`,
 *     })
 *   }
 * }
 * ```
 */
export const toSubmitErrors = <TField extends string>({
  rejected,
  fieldNames,
  describe,
  fallback,
}: {
  rejected: readonly string[]
  fieldNames: Partial<Record<TField, string>>
  describe: (field: TField) => string
  fallback: string
}): SubmitErrors<TField> => {
  const rejectedFields = (Object.keys(fieldNames) as TField[]).filter((field) => {
    const name = fieldNames[field]

    return name !== undefined && rejected.includes(name)
  })

  if (rejectedFields.length === 0) {
    return { form: fallback, fields: {} }
  } else
    return {
      fields: Object.fromEntries(
        rejectedFields.map((field) => [field, { message: describe(field) }]),
      ) as SubmitErrors<TField>["fields"],
    }
}
