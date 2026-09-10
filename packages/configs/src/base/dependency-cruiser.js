/** @type {import('dependency-cruiser').IConfiguration} */
export const baseDependencyCruiserConfig = {
  options: {
    reporterOptions: {
      dot: {
        collapsePattern: [
          "node_modules/[.]pnpm/[^/]+|@[^/]+/[^/]+",
          "^(?:src|dist)/.+/_?generated(?=/)",
        ],

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

            //* Do not use `ortho`: graphviz 2.43's orthogonal router sizes its trapezoid table
            //* upfront and overflows on big graphs, while also being ~190x slower than `polyline`.
            splines: "polyline",
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
