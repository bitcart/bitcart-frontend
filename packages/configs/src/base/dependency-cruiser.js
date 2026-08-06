/** @type {import('dependency-cruiser').IConfiguration} */
export const baseDependencyCruiserConfig = {
  options: {
    reporterOptions: {
      dot: {
        //* Collapse each external package to a single block instead of projecting its
        //* internals: the pnpm virtual-store dir (`.pnpm/<name>@<version>_<peers>`) for resolved
        //* node_modules, and any scoped package referenced by bare specifier (workspace
        //* `@bitcart/*` deps and packages like `@web3icons/react` that resolve to `@scope/name`).
        //* The verbose pnpm store key is rewritten to the bare package name by
        //* scripts/graphviz-postprocess.js.
        collapsePattern: "node_modules/[.]pnpm/[^/]+|@[^/]+/[^/]+",

        theme: {
          edge: {
            arrowhead: "vee",
            arrowsize: "2",
            color: "#66666675",
            penwidth: "2",
          },

          graph: {
            compound: true,
            fontsize: 16,
            newrank: true,
            nodesep: 0.15,
            ranksep: 1,
            splines: "ortho",
          },

          node: {
            fontsize: 16,
            height: 0.75,
          },
        },
      },
    },
  },
}
