import type { OklchColorTriplet } from "@bitcart/core/colors"
import { isDefined } from "remeda"

export const extractHexAnnotatedOklchTriplets = (text: string) =>
  text
    .matchAll(/"(?<triplet>[\d.% ]+)", \/\/\s+(?<hex>#[\dA-Fa-f]{6})/gu)
    .flatMap<[OklchColorTriplet, string]>(({ groups }) =>
      isDefined(groups?.triplet) && isDefined(groups.hex)
        ? [[groups.triplet as OklchColorTriplet, groups.hex]]
        : [],
    )
    .toArray()
