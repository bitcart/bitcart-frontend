export type BitcartApiConfigOptions = { baseUrl: string }

export class BitcartApiConfig {
  static #baseUrl: string = ""

  /**
   * @throws When the base URL has not been set yet.
   */
  static get baseUrl(): string {
    if (!BitcartApiConfig.#baseUrl) {
      throw new Error(
        "BitcartApiConfig.baseUrl is unset. Call BitcartApiConfig.set() during initialization.",
      )
    }

    return BitcartApiConfig.#baseUrl
  }

  /**
   * @throws When the base URL has not been set yet.
   */
  static get websocketBaseUrl(): string {
    return BitcartApiConfig.baseUrl.replace(/^http/, "ws")
  }

  /**
   * Points the SDK at an API instance.
   *
   * Must be called once in the app's initialization layer.
   */
  static set({ baseUrl }: BitcartApiConfigOptions): void {
    BitcartApiConfig.#baseUrl = baseUrl.replace(/\/$/, "")
  }
}
