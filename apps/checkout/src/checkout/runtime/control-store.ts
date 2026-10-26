import { createStore, shallow } from "@tanstack/store"

export type CheckoutUiState = {
  chosenMethodId: string | null
  isChangingMethod: boolean
  isRedirectCancelled: boolean
  isShowingEthPluginOffer: boolean
}

export const INITIAL_CHECKOUT_UI_STATE: CheckoutUiState = {
  chosenMethodId: null,
  isChangingMethod: false,
  isRedirectCancelled: false,
  isShowingEthPluginOffer: false,
}

export type CheckoutUiActions = {
  selectMethod: (methodId: string) => void
  changeMethod: () => void
  cancelChange: () => void
  cancelRedirect: () => void
  showEthPluginOffer: () => void
  hideEthPluginOffer: () => void
  reset: () => void
}

/**
 * The checkout's own UI state, held outside React so a host can drive it from anywhere, such as a
 * terminal event handler. Server data never enters it.
 */
export const createCheckoutControl = () =>
  createStore(INITIAL_CHECKOUT_UI_STATE, ({ setState }): CheckoutUiActions => {
    //* Keeps the current state object when nothing changes, so no subscriber hears a no-op.
    const update = (patch: Partial<CheckoutUiState>) =>
      setState((state) => {
        const next = { ...state, ...patch }

        return shallow(state, next) ? state : next
      })

    return {
      selectMethod: (methodId) =>
        update({
          chosenMethodId: methodId,
          isChangingMethod: false,
          isShowingEthPluginOffer: false,
        }),

      changeMethod: () => update({ isChangingMethod: true, isShowingEthPluginOffer: false }),
      cancelChange: () => update({ isChangingMethod: false }),
      cancelRedirect: () => update({ isRedirectCancelled: true }),
      showEthPluginOffer: () => update({ isShowingEthPluginOffer: true }),
      hideEthPluginOffer: () => update({ isShowingEthPluginOffer: false }),
      reset: () => update(INITIAL_CHECKOUT_UI_STATE),
    }
  })

export type CheckoutControl = ReturnType<typeof createCheckoutControl>
