export class BitcartApiConfig {
  static #baseUrl: string = ""

  static get baseUrl(): string {
    return BitcartApiConfig.#baseUrl
  }

  /**
   * Points the SDK at an API instance.
   *
   * Must be assigned once in the app's initialization layer.
   */
  static set baseUrl(value: string) {
    BitcartApiConfig.#baseUrl = value.replace(/\/+$/, "")
  }

  static get websocketBaseUrl(): string {
    return BitcartApiConfig.#baseUrl.replace(/^http/, "ws")
  }
}
