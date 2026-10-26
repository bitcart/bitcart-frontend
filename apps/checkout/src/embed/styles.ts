//! Colors are pinned: this chrome shows on the merchant's page before the checkout reports which
//! theme it renders in, so it can follow neither.
//! The frame's `color-scheme` stays `normal`: the checkout sets `light` or `dark` by its theme, and
//! a frame set to the other one is painted opaque, hiding the page. `normal` stays transparent over
//! both.
export const CHECKOUT_DIALOG_STYLES = `
  :host {
    all: initial;
  }

  dialog {
    position: fixed;
    inset: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    border: 0;
    background: transparent;
    color-scheme: normal;
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 0.5);
  }

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    color-scheme: normal;
    visibility: hidden;
  }

  dialog[data-state="shown"] iframe {
    visibility: visible;
  }

  dialog[open] {
    display: grid;
    place-items: center;
  }

  dialog[data-state="shown"] .card {
    display: none;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(340px, 100% - 32px);
    box-sizing: border-box;
    padding: 32px 24px;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 24px 64px rgb(0 0 0 / 0.25);
    color: #18181b;
    font: 14px/1.5 system-ui, sans-serif;
    text-align: center;
  }

  .status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    box-sizing: border-box;
    border: 3px solid rgb(24 24 27 / 0.15);
    border-top-color: #18181b;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 2.4s;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }

  .fallback {
    margin: 0;
  }

  .fallback[hidden] {
    display: none;
  }

  .fallback a {
    color: inherit;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .close {
    position: absolute;
    top: 12px;
    right: 12px;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #52525b;
    cursor: pointer;
  }

  .close:hover {
    background: rgb(24 24 27 / 0.06);
  }

  .fallback a:focus-visible,
  .close:focus-visible {
    outline: 2px solid #18181b;
    outline-offset: 2px;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`
