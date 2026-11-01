# Bitcart UnoCSS Kit

UnoCSS preset and tools for applications and websites under the Bitcart umbrella.

## Preset

Just import and use the preset in your `uno.config.ts` file, listing it at the first position of the `presets` array.

> ⚠️ The preset already incorporates the [Wind4](https://unocss.dev/presets/wind4), [Typography](https://unocss.dev/presets/typography), and [Animations](https://unocss-preset-animations.aelita.me/) presets, and reimplements [Shadcn](https://github.com/unocss-community/unocss-preset-shadcn). Do not add them manually.

```typescript
import { presetBitcart } from "@bitcart/unocss-kit/preset"
import { defineConfig } from "unocss"

export default defineConfig({
  presets: [
    presetBitcart(),

    /*
      Other UnoCSS presets...
    */
  ],
})
```

## Architecture

### Dependency graph

![Dependency graph visualization](graphviz.svg "Dependency graph visualization")
