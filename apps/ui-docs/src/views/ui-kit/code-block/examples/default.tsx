import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@bitcart/ui-kit/components"

const CODE = `:root {
  --brand-color: #162d50;
  --primary: var(--brand-color) !important;
}`

export const DefaultCodeBlockExample: React.FC = () => (
  <CodeBlock className="max-w-md">
    <CodeBlockHeader>
      <CodeBlockTitle>css</CodeBlockTitle>

      <CodeBlockActions>
        <CodeBlockCopyButton value={CODE} />
      </CodeBlockActions>
    </CodeBlockHeader>

    <CodeBlockContent>
      <code>{CODE}</code>
    </CodeBlockContent>
  </CodeBlock>
)
