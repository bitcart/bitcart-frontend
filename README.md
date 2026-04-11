# Bitcart Frontend

This monorepo hosts all bitcart frontend applications in one place for convenience.
You can find them in apps/\* folders.

Current list:

- apps/landing - Bitcart Website <https://bitcart.ai>
- apps/directory - Bitcart Merchants Directory <https://directory.bitcart.ai>

## Development

### Prerequisites

Assuming you have already cloned this repository and are in its root directory, follow these steps to get started:

1. First, [install uv](https://github.com/astral-sh/uv?tab=readme-ov-file#installation) unless it's already present in your system.

2. Then, install the essential development tools, such as [prek](https://prek.j178.dev) and [just](https://just.systems/man/en) via uv:

   ```bash
   uv tool install rust-just && uv tool install prek
   ```

   And follow the shell integration instructions:
   - [for just](https://just.systems/man/en/shell-completion-scripts.html)
   - [for prek](https://prek.j178.dev/installation/#shell-completion)

3. Once it's done, [install fnm](https://github.com/Schniz/fnm?tab=readme-ov-file#installation) Node.js version manager or make sure it's already present in your system.

4. Now, install pre-commit hooks, as well as the required version of [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io) along with all NPM dependencies:

   ```bash
   just get-started
   ```

5. Finally, setup end-to-end testing tools:

   ```bash
   just e2e-setup
   ```

   If you see an error message about missing system dependencies, follow the resolution instructions it provides.

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

### [See more](./DEVELOPMENT_GUIDELINES.md)
