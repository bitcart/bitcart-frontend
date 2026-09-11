//* Vike's client runtime loads twice when `@bitcart/vike-kit` resolves a different peer variant
//* of Vike than the app integrating it.
export const vikeViteDedupedPackages = ["vike", "vike-react"] as const
