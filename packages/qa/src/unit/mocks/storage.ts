/**
 * Mocks the Storage API
 * @param {'localStorage' | 'sessionStorage'} name - The name of the storage to mock
 *
 * @example
 * mockStorage('localStorage')
 * // Then use window.localStorage as usual (it will be mocked)
 */
export const mockStorage = (name: "localStorage" | "sessionStorage"): void => {
  class StorageMock implements Storage {
    store: Record<string, string> = {}

    get length() {
      return Object.keys(this.store).length
    }

    clear() {
      this.store = {}
    }

    getItem(key: string) {
      return this.store[key] ?? null
    }

    key(index: number) {
      return Object.keys(this.store)[index] ?? null
    }

    setItem(key: string, value: unknown) {
      this.store[key] = value + ""
    }

    removeItem(key: string) {
      delete this.store[key]
    }
  }

  Object.defineProperty(window, name, {
    configurable: true,
    value: new StorageMock(),
    writable: true,
  })
}
