import { Button } from "@bitcart/ui-kit/components"
import { useCallback } from "react"

export const InlineButtonExample: React.FC = () => {
  const retry = useCallback(() => {
    /* Do something */
  }, [])

  return (
    <div className="gap-4 flex flex-col items-center">
      <span className="text-lg">
        These aren't the droids you're looking for. Please{" "}
        <Button onClick={retry} variant="accent" size="inline">
          try again
        </Button>
        .
      </span>

      <span className="text-sm">
        If you have any questions, please{" "}
        <Button
          nativeButton={false}
          variant="link"
          size="inline"
          render={<a href="mailto:support@example.com" aria-label="contact us" />}
        >
          contact us
        </Button>
        .
      </span>
    </div>
  )
}
