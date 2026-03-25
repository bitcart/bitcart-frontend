# Project code conventions

## Props type aliases

When a component's props type is a pure alias (no additional properties), intersect with `& {}` for flexibility and extensibility:

```ts
// ✅ correct
export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props & {}

// ❌ avoid — plain alias blocks future extension and is less explicit
export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props
```

Only add properties inside `{}` when the component actually introduces them.

## Early returns

Avoid standalone early returns. Instead, use `else return` to keep branches visually coupled:

```ts
// ✅ correct
if (condition) {
  return <Foo />
} else return <Bar />

// ❌ avoid — the dangling return obscures that these are two branches of the same condition
if (condition) {
  return <Foo />
}

return <Bar />
```

Only use a bare early return when it is a true guard clause (e.g. `if (!value) return null`) with no meaningful else branch.
