import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"

export default function Page() {
  const { t } = useLingui()

  return (
    <div
      className={cn(`
        px-4 py-16
        md:min-h-[calc(100dvh-4rem)]
        flex min-h-dvh items-center justify-center
      `)}
    >
      <h1 className="text-4xl font-bold sm:text-6xl text-center">{t`Hello, World!`}</h1>
    </div>
  )
}
