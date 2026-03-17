import { FieldGroup, InputGroupText } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { AtSign, ExternalLink } from "lucide-react"
import { useMemo } from "react"

import { directoryClient } from "@/common/data/bitcart/directory"

import { FORM_CONFIG } from "../constants"
import { useCatalogSubmissionForm } from "../hooks/form"

export const CatalogSubmissionForm = () => {
  const { t } = useLingui()
  const directoryCategories = directoryClient.getCategories()
  const { form, handleSubmit } = useCatalogSubmissionForm()

  const categoryOptions = useMemo(
    () => directoryCategories.map(({ id, name }) => ({ value: id, label: name })) ?? [],
    [directoryCategories],
  )

  const merchantSubcategoryOptions = useMemo(
    () =>
      directoryCategories
        .find(({ id }) => id === "merchant")
        ?.subcategories?.map(({ id, name }) => ({ value: id, label: name })) ?? [],

    [directoryCategories],
  )

  return (
    <form onSubmit={handleSubmit} className="gap-6 flex flex-col">
      <FieldGroup>
        <div className="md:grid-cols-2 gap-6 grid grid-cols-1">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                required
                label={t`Name`}
                placeholder={t`Enter the name`}
                type="text"
              />
            )}
          </form.AppField>

          <form.AppField name="url">
            {(field) => (
              <field.TextField
                required
                label={t`Website`}
                placeholder="https://example.com"
                type="url"
              />
            )}
          </form.AppField>
        </div>

        <div className="md:grid-cols-2 gap-6 grid grid-cols-1">
          <form.AppField name="twitter">
            {(field) => (
              <field.TextField
                label="Twitter"
                placeholder="twitter_handle"
                type="text"
                inputAddons={[{ align: "inline-start", children: <AtSign className="size-4" /> }]}
              />
            )}
          </form.AppField>

          <form.AppField name="github">
            {(field) => (
              <field.TextField
                label="GitHub"
                placeholder="username[/repo]"
                type="text"
                inputAddons={[
                  {
                    align: "inline-start",
                    children: <InputGroupText className="text-base">github.com/</InputGroupText>,
                  },
                ]}
                classNames={{ input: "pl-0" }}
              />
            )}
          </form.AppField>
        </div>

        <div className="md:grid-cols-2 gap-6 grid grid-cols-1">
          <form.AppField name="type.category">
            {(field) => (
              <field.SelectField
                required
                label={t`Category`}
                placeholder={t`Select category`}
                options={categoryOptions}
              />
            )}
          </form.AppField>

          <form.Subscribe selector={({ values }) => values.type}>
            {({ category }) =>
              category === "merchant" && (
                <form.AppField name="type.subcategory">
                  {(field) => (
                    <field.SelectField
                      required
                      label={t`Merchant Type`}
                      placeholder={t`Select subcategory`}
                      options={merchantSubcategoryOptions}
                    />
                  )}
                </form.AppField>
              )
            }
          </form.Subscribe>
        </div>

        <form.AppField name="description">
          {(field) => (
            <field.TextareaField
              required
              label={t`Description`}
              placeholder={t`Brief description of your entry and how it uses Bitcart`}
              rows={4}
              inputAddons={[
                {
                  align: "block-end",

                  children: (
                    <InputGroupText className="text-xs">
                      {t`${field.state.value?.length ?? 0} / ${
                        FORM_CONFIG.fields.description.maxLength
                      } characters`}
                    </InputGroupText>
                  ),
                },
              ]}
            />
          )}
        </form.AppField>
      </FieldGroup>

      <div className="md:flex-row-reverse gap-3 pt-2 md:justify-center flex flex-col">
        <form.AppForm>
          <form.SubmitButton
            icon={<ExternalLink className="size-4" />}
            label={t`Submit via GitHub`}
          />
        </form.AppForm>
      </div>
    </form>
  )
}
