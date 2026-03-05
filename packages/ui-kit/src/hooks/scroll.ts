import { useEffect, useState } from "react"
import { useIsClient } from "usehooks-ts"

export type WindowScrollThresholdParams = {
  axis: "horizontal" | "vertical"
  value: number
}

export const useWindowScrollThreshold = ({ axis, value }: WindowScrollThresholdParams) => {
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
