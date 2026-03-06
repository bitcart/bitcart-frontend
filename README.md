# Bitcart Frontend

This monorepo hosts all bitcart frontend applications in one place for convenience.
You can find them in apps/\* folders.

Current list:

- apps/landing - Bitcart Website https://bitcart.ai
- apps/directory - Bitcart Merchants Directory https://directory.bitcart.ai

## Development

### Prerequisites

1. First, [install uv](https://github.com/astral-sh/uv?tab=readme-ov-file#installation) unless it's already present in your system.

2. Then, use it to install the essential development tools, such as [prek](https://prek.j178.dev) and [just](https://just.systems/man/en):

   ```bash
   uv tool install prek && uv tool install rust-just
   ```

   And follow the shell integration instructions:
   - [for just](https://just.systems/man/en/shell-completion-scripts.html)
   - [for prek](https://prek.j178.dev/installation/#shell-completion)

3. After that, install pre-commit hooks:

   ```bash
   prek install
   ```

4. Finally, [install fnm](https://github.com/Schniz/fnm?tab=readme-ov-file#installation) Node.js version manager or make sure it's already present in your system.
   Once it's done, run the following command to install the [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io) versions required by this project along with npm dependencies:

   ```bash
   fnm install && fnm use && corepack enable pnpm && pnpm i
   ```

#### Optional

You'll need to install [Graphviz](https://www.graphviz.org/download) to keep dependency graph visualizations up to date.

### Commands

Show list of available commands:

```bash
just
```

To execute a specific command, prefix it with `just`. For example, to start the development server, run:

```bash
just dev
```

You can also open the command menu to select a command from the list:

```bash
just run
```
