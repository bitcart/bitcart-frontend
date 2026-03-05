import { createFormHook } from "@tanstack/react-form"

import { SelectField, SubmitButton, TextareaField, TextField } from "../components"
import { fieldContext, formContext } from "../contexts/form"

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,

  fieldComponents: {
    /**
     * Source: {@link SelectField}
     */
    SelectField,

    /**
     * Source: {@link TextField}
     */
    TextField,

    /**
     * Source: {@link TextareaField}
     */
    TextareaField,
  },

  formComponents: {
    SubmitButton,
  },
})
