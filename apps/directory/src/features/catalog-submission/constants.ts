export const FORM_CONFIG = {
  fields: {
    name: { minLength: 2, maxLength: 50 },
    description: { minLength: 12, maxLength: 500 },
    twitter: { minLength: 1, maxLength: 15, regex: /^[a-zA-Z0-9_]+$/ },

    github: {
      regex: /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}(\/[a-zA-Z\d][\w.-]{0,100})?$/,
    },
  },
}
