---
name: tanstack-store
description: Conventions for client-side state in this workspace with TanStack Store 0.11 (`@tanstack/store`, `@tanstack/react-store`). Covers whether state belongs in a store at all, then how to scope, shape, write, read and test one. Use when adding or changing client state that distant components share or that code outside React drives or observes; when touching `createStore`, `createAtom`, `useSelector`, `useCreateStore` or `createStoreContext`; when persisting client state; or when asked where a piece of state should live or how to handle global state.
---

# TanStack Store

The workspace runs TanStack Store **0.11**. Docs and posts written before 0.9 describe `new Store`, `new Derived` and `new Effect`: 0.9 replaced them with `createStore` (plain or derived) and `subscribe`, and 0.11 deprecated `useStore` in favour of `useSelector`. When a doc, this one included, disagrees with the installed typings, the typings win. TanStack Intent ships no skill for these packages; use context7 for upstream docs.

Reference implementation, built so code outside React can drive it: the factory in `apps/checkout/src/checkout/runtime/control-store.ts` and its React bindings in `control.ts`, tested in `control-store.spec.ts` and `control.spec.tsx`. For signatures, read the installed typings of both packages.

## Adding a store

1. Run the decision list below. Most state ends before its item 5.
2. Pick the owner and its lifetime (Scope).
3. Write the `create*` factory with domain actions and no-op-safe writes (Shape).
4. Bind it with `useSelector` and slice selectors (Reading).
5. Test the store without React, then the binding (Testing).

## Does this state belong in a store?

Take the first match:

0. **Derivable from other state:** don't store it. Compute it with a pure function.
1. **Server data**, anything the API returns, router loader data included: TanStack Query. Never copy it into a store, since the copy goes stale and needs syncing. Derive from the query data.
2. **Form state:** TanStack Form through `@bitcart/form-kit`.
3. **State worth keeping in the URL**, such as filters, tabs or a selected id: router search params.
4. **State a single component owns:** `useState`. When a few nearby components need it, lift it to their common parent first. Lifted state also survives a remount below its owner, such as an error boundary fallback or a template switch. Values that never render (timers, handles, DOM nodes) go in `useRef`, and static dependencies (config, clients) in a plain context.
5. **Anything left** is a store candidate: client-only state that distant components share, or that code outside React drives or observes (a host app, a terminal event).

## Scope

- One store per owning component: `useState(createX)`. Don't pass a `create*` factory to `useCreateStore`: a function argument makes a derived store whose value is the store.
- Replace it when the entity it belongs to changes. Prefer a `key` on the owner, or in a TanStack Router app the route's `remountDeps`, when its whole subtree should reset. When the owner can't be keyed or must keep other state, use a render-time adjustment, as `useCheckoutControl(invoiceId)` does. A store for one invoice must never carry its state into the next. Anything built on the old instance, such as a derived store or a `subscribe` call, must move to the new one. A store a host passes in is the host's to replace or `reset` when the entity changes.
- No module-scope store, in any app. In an app rendered on the server it would also leak state between renders: Landing and Directory are prerendered by Vike at build and served as static files (only the dev server renders per request), and a module-level store is shared by every page that build renders. Checkout runs in SPA mode with only its shell prerendered, and its stores stay per instance all the same.
- In an app rendered on the server, the client store must hold exactly the state the server rendered until hydration finishes. `useSelector` reads the live client store as the server snapshot, and any earlier write, such as reading storage in the factory, mismatches the markup. Apply client-only values, persisted ones included, in an effect after mount.
- Hand a store to distant components through a React context: `createStoreContext` or a plain one.

## Shape

An excerpt of `control-store.ts`:

```ts
export const createCheckoutControl = () =>
  createStore(INITIAL_CHECKOUT_UI_STATE, ({ setState }): CheckoutUiActions => {
    const update = (patch: Partial<CheckoutUiState>) =>
      setState((state) => {
        const next = { ...state, ...patch }

        return shallow(state, next) ? state : next
      })

    return {
      selectMethod: (methodId) => update({ chosenMethodId: methodId, isChangingMethod: false }),
      // …
      reset: () => update(INITIAL_CHECKOUT_UI_STATE),
    }
  })

export type CheckoutControl = ReturnType<typeof createCheckoutControl>
```

- A `create*` factory plus a `ReturnType` type, over plain and small state, like the checkout control's. No class, no module-level instance.
- Actions come from the actions factory, annotated with an actions type. The annotation checks the returned object and types each action's parameters.
- Name actions after the domain event (`selectMethod`), and make each one keep the state's invariants. Never add a generic setter action, and never call `setState` outside the factory: callers would bypass those invariants.
- A write that changes nothing returns the current state object, since a fresh equal one notifies every subscriber, React or not (Gotchas). Pass `update` only defined values: without `exactOptionalPropertyTypes`, `Partial<State>` lets an optional action parameter write `undefined` into a non-optional field.
- Add `reset` when something outside the store has to clear it, such as a host or a logout.
- Import `createStore` from `@tanstack/store`, and keep a factory that non-React code uses in a module without React imports.

## Reading

- `useSelector(store, selector)`. Never `useStore` from `@tanstack/react-store`: it's a deprecated alias, and the 0.11 source marks the experimental tuple hook `_useStore` as its replacement in the next major. Leave `_useStore` alone too. Don't confuse either with `bitcartStores.useStore` from `@bitcart/api-sdk/endpoints`, an unrelated query hook for the Store entity, nor `useCreateStore` with `bitcartStores.useCreateStore`, the mutation that creates a Store entity.
- Select the slice a component renders, with `{ compare: shallow }` when the selector builds an object or array. Pass `shallow` itself, not a wrapper arrow. Read the whole state only when every field is used, as `useCheckoutModel` does.
- A selector subscribes only to its own store. Reading another store inside it never schedules a render: the component keeps showing that store's old value until its own store changes or, for an inline selector, until it re-renders for another reason. Compose the two in a derived store built next to its sources and replaced with them: `useMemo(() => createStore(() => …), [a, b])`. `useCreateStore` or `useState` would keep reading the first instances after a reset.
- When any input lives in React (query data, theme, props), derive with a pure function and `useMemo`. A derived store, `createStore(() => …)`, fits only when every input is a store or atom.

## Gotchas

- Stores take no `compare` option, unlike atoms. Every `setState` that returns a new object notifies, even an equal one, and returning the current object stays silent. A derived store whose getter builds an object therefore notifies on every upstream notification, related field or not: use `createAtom(() => …, { compare: shallow })`, or return the previous value when it's shallow-equal.
- While an atom's or store's value is `undefined`, every write or recompute counts as a change and notifies, `compare` or not, even one returning the current value. `atom.set(undefined)` is silently ignored: use `set(() => undefined)`.
- Inside a `batch`, `compare` still runs per write: A to B to A notifies the store's own subscribers once, with A, though nothing changed overall. A derived store or atom recomputes once at the end and stays silent if its result is equal.
- `useSelector` compares selections with `===` by default.
- `useSetValue`, `useStoreActions` and `StoreActionsApi` don't exist in 0.11, whatever a doc page says.

## Testing

- Test the store without React: call `store.actions.*`, assert on `store.state`, and pass `vi.fn()` to `store.subscribe` to prove a no-op stays silent.
- Test the React binding with `renderHook`: identity across rerenders with equal inputs, and an update after an action.
- Break each guard once and watch its test fail.

## Persistence

TanStack Store has no persistence. Most persisted state needs no store anyway:

- **Cookie:** what the server must read for the first paint, such as auth (ideally httpOnly) or a pinned sidebar.
- **URL:** table search, filters, sort and page.
- **localStorage**, through `useLocalStorage` from `@mantine/hooks`: single preferences that don't change the first paint.

When a store's state must persist as a versioned object, write one shared helper the first time it's needed: read, migrate, merge, write on `subscribe`, and sync across tabs. Its rules: prefix keys per app (`admin:`), since the admin and the storefront can share an origin; never store tokens; clear the key on logout. If it outgrows about 60 lines or needs async storage such as IndexedDB, raise switching to Zustand's `persist` before extending it. A logout reset for app-wide stores has no convention yet: settle it when an app first needs one.
