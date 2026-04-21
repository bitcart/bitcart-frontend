const UI_KIT_UTILS_SUBPATH = "@bitcart/ui-kit/utils"

//! In-package imports use the `@/utils` alias to avoid a self-reference.
const UI_KIT_INTERNAL_MARKER = "/packages/ui-kit/src/"
const UI_KIT_INTERNAL_SPECIFIER = "@/utils"

const MESSAGE =
  "Raw template literals used as `className` leak source-code whitespace into the rendered DOM. " +
  "Wrap with `cn()` so whitespace is normalized at runtime. " +
  "Run `just fix` to autofix."

// TODO: use plugin type exports when available https://github.com/oxc-project/oxc/issues/19918
type Ranged = { range?: [number, number] }
type Fixer = {
  insertTextBefore: (node: Ranged, text: string) => unknown
  insertTextAfter: (node: Ranged, text: string) => unknown
  insertTextBeforeRange: (range: [number, number], text: string) => unknown
}
type ImportSpecifierNode = Ranged & {
  type?: string
  imported?: { name?: string }
  local?: { name?: string }
}
type ImportDeclarationNode = Ranged & {
  source?: { value?: string }
  specifiers?: ImportSpecifierNode[]
  importKind?: "value" | "type"
}

const resolveCnImport = (filename: string): string => {
  const normalized = filename.replace(/\\/g, "/")

  return normalized.includes(UI_KIT_INTERNAL_MARKER)
    ? UI_KIT_INTERNAL_SPECIFIER
    : UI_KIT_UTILS_SUBPATH
}

export default {
  meta: { name: "classname-hygiene" },
  rules: {
    "no-template-literal-classname": {
      meta: { type: "problem", fixable: "code" },
      create(context: {
        filename?: string
        physicalFilename?: string
        report: (diagnostic: {
          message: string
          node: unknown
          fix?: (fixer: Fixer) => unknown
        }) => void
      }) {
        const cnSpecifier = resolveCnImport(context.filename ?? context.physicalFilename ?? "")
        const cnImportStatement = `import { cn } from "${cnSpecifier}"`

        let matchingValueImport: ImportDeclarationNode | null = null
        let hasCnSpecifier = false
        let lastImport: ImportDeclarationNode | null = null
        let importEditClaimed = false

        return {
          ImportDeclaration(node: ImportDeclarationNode) {
            lastImport = node

            if (node.source?.value !== cnSpecifier || node.importKind === "type") {
              return
            }

            matchingValueImport = node

            for (const specifier of node.specifiers ?? []) {
              if (
                specifier.type === "ImportSpecifier" &&
                (specifier.imported?.name === "cn" || specifier.local?.name === "cn")
              ) {
                hasCnSpecifier = true
              }
            }
          },

          JSXAttribute(node: {
            name?: { type?: string; name?: string }
            value?: { type?: string; expression?: Ranged & { type?: string } } | null
          }) {
            if (node.name?.type !== "JSXIdentifier" || node.name.name !== "className") {
              return
            }

            const expression =
              node.value?.type === "JSXExpressionContainer" ? node.value.expression : null

            if (expression?.type !== "TemplateLiteral") return

            //! Only the first violation carries the import edit; otherwise sibling
            //! reports collide on the same range and oxlint drops all but the first fix.
            const needsImportEdit = !hasCnSpecifier && !importEditClaimed
            if (needsImportEdit) importEditClaimed = true

            context.report({
              message: MESSAGE,
              node: expression,
              fix: (fixer) => {
                const edits: unknown[] = [
                  fixer.insertTextBefore(expression, "cn("),
                  fixer.insertTextAfter(expression, ")"),
                ]

                if (!needsImportEdit) return edits

                if (matchingValueImport?.specifiers?.length) {
                  const specifiers = matchingValueImport.specifiers
                  const lastSpec = specifiers[specifiers.length - 1]
                  if (lastSpec) edits.push(fixer.insertTextAfter(lastSpec, ", cn"))
                } else if (lastImport) {
                  edits.push(fixer.insertTextAfter(lastImport, `\n${cnImportStatement}`))
                } else {
                  edits.push(fixer.insertTextBeforeRange([0, 0], `${cnImportStatement}\n\n`))
                }

                return edits
              },
            })
          },
        }
      },
    },
  },
}
