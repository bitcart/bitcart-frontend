import { Component, type ErrorInfo, type ReactNode } from "react"

type ErrorBoundaryProps = {
  errorMessage: string
  fallback: ReactNode
  children: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, { hasFailed: boolean }> {
  override state = { hasFailed: false }

  static getDerivedStateFromError() {
    return { hasFailed: true }
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(this.props.errorMessage, error, info.componentStack)
  }

  override render() {
    return this.state.hasFailed ? this.props.fallback : this.props.children
  }
}
