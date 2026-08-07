import { useIsClient } from "@bitcart/hooks"
import { useEffect, useState } from "react"

export type WindowScrollThresholdParams = {
  axis: "horizontal" | "vertical"
  value: number
}

export const useWindowScrollThreshold = ({
  axis,
  value,
}: WindowScrollThresholdParams): { isScrolled: boolean } => {
  const isClient = useIsClient()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (isClient) {
      const handleScroll = () =>
        setIsScrolled((axis === "horizontal" ? window.scrollX : window.scrollY) > value)

      handleScroll()
      window.addEventListener("scroll", handleScroll)

      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [axis, isClient, value])

  return { isScrolled }
}
