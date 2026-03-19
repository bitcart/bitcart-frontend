/** @type {import('dependency-cruiser').IConfiguration} */
export const baseDependencyCruiserConfig = {
  options: {
    includeOnly: ["^src/", "^dist/"],

    reporterOptions: {
      dot: {
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
            nodesep: 0.3,
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
