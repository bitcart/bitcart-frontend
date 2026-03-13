import { useAppForm } from "@bitcart/form-kit/hooks"
import { toast } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import { useMemo } from "react"
import { capitalize, isNonNull } from "remeda"

import { getCatalogSubmissionSchema, type CatalogSubmissionInputs } from "../model/schemas"

export const useCatalogSubmissionForm = () => {
  const validationSchema = useMemo(() => getCatalogSubmissionSchema(), [])

  const self = useAppForm({
    defaultValues: {
      type: { category: "app" },
    } as CatalogSubmissionInputs,

    validators: {
      onSubmit: validationSchema,
      onChange: validationSchema,
    },

    onSubmit: async ({ value: fieldValues }) => {
      const baseUrl = "https://github.com/bitcart/bitcart-directory/issues/new"
      const title = `New entry submission - ${fieldValues.name}`

      const body = [
        "# New submission\n",
        `Name: ${fieldValues.name}`,
        `URL: ${fieldValues.url}`,
        fieldValues.twitter ? `Twitter: @${fieldValues.twitter}` : null,
        fieldValues.github ? `GitHub: https://github.com/${fieldValues.github}` : null,

        `Type: ${capitalize(fieldValues.type.category)}${
          "subcategory" in fieldValues.type ? ` - ${capitalize(fieldValues.type.subcategory)}` : ""
        }`,

        `Description: ${fieldValues.description}`,
      ]
        .filter(isNonNull)
        .join("\n")

      const githubIssueUrlParams = new URLSearchParams({ title, body })
      const githubIssueUrl = `${baseUrl}?${githubIssueUrlParams.toString()}`

      return new Promise((resolve) => {
        const toastId = toast.loading(t`Opening GitHub...`)

        window.open(githubIssueUrl, "_blank")

        setTimeout(() => {
          toast.dismiss(toastId)
          resolve(true)
        }, 3000)
      })
    },
  })

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault()
    void self.handleSubmit()
  }

  return {
    form: self,
    handleSubmit,
  }
}
