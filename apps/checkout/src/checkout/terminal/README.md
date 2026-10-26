# Terminal integration

Web-side adapter for the native shell that hosts the checkout on payment terminals.

The shell injects one object, `window.BitcartTerminal`, and only on the checkout's origin. It
carries the capability `manifest`, takes calls through `postMessage`, and delivers replies and
events to `message` listeners, all as JSON strings: a call `{ id, method, payload }`, a reply
`{ id, response }`, an event `{ event, payload }`.

| File          | Role                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| `protocol.ts` | the bridge object, messages, call timeout, the synchronously read manifest |
| `printer.ts`  | receipt blocks and `printer.print`                                         |
| `errors.ts`   | canonical error codes and their merchant-facing copy                       |
| `hooks.ts`    | `useTerminalEnv`, `useCanOpenExternalLinks` and `usePrinter`               |
| `fake.ts`     | in-memory shell implementing the protocol, for vitest and the preview      |

## Rules

- **Feature-detect.** No manifest means a plain browser, and everything degrades. There's no
  terminal build.
- **Never branch on vendor, model or shell version.** Gate on `features`; the device fields are for
  bug reports.
- **The manifest is read synchronously,** so capability-dependent UI is right on first paint.
- **Listen with `addEventListener`, never `onmessage`,** and before the first `postMessage`: other
  code may share the object, and nothing is queued.
- **Receipts are semantic blocks,** never HTML, CSS or bitmaps. Paper width and DPI belong to the
  shell.
- **Only baseline block kinds go out unchecked:** `text`, `qr`, `rule`, `space` and `field`. A kind
  added later is sent only to shells listing it in `capabilities.printer.blocks`.
- **Error copy and retryability are derived here from the code.** The shell sends only a canonical
  code and an opaque diagnostic. The UI shows the diagnostic under the copy only for codes whose
  copy can't name a fix, where support needs it. Unrecognised codes collapse to `UNKNOWN`.
