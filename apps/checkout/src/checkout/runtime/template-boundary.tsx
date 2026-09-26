import { Component, type ErrorInfo, type ReactNode } from "react"

type TemplateBoundaryProps = {
  templateId: string
  fallback: ReactNode
  children: ReactNode
}

/**
 * Replaces a crashed checkout template with the fallback. A broken template must never leave a
 * customer without a way to pay.
 */
export class TemplateBoundary extends Component<TemplateBoundaryProps, { hasFailed: boolean }> {
  override state = { hasFailed: false }

  static getDerivedStateFromError() {
    return { hasFailed: true }
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(
      `Checkout template "${this.props.templateId}" crashed, falling back to the default`,
      error,
      info.componentStack,
    )
  }

  override render() {
    return this.state.hasFailed ? this.props.fallback : this.props.children
  }
}
