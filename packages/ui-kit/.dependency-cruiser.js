import { libDependencyCruiserConfig } from "@bitcart/configs/by-package-type/lib-dependency-cruiser"

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  ...libDependencyCruiserConfig,

  options: {
    ...libDependencyCruiserConfig.options,

    reporterOptions: {
      dot: {
        ...libDependencyCruiserConfig.options.reporterOptions.dot,

        theme: {
          ...libDependencyCruiserConfig.options.reporterOptions.dot.theme,

          modules: [
            {
              criteria: { source: "^src/components/atoms" },
              attributes: { fillcolor: "#e05c5c", shape: "oval" },
            },

            {
              criteria: { source: "^src/components/molecules" },
              attributes: { fillcolor: "#e8952e" },
            },

            {
              criteria: { source: "^src/components/organisms" },
              attributes: { fontcolor: "#ffffff", fillcolor: "#5cb85c" },
            },

            {
              criteria: { source: "^src/components/templates" },
              attributes: { fontcolor: "#ffffff", fillcolor: "#8e6bbf" },
            },

            {
              criteria: { source: "^src/contexts" },
              attributes: { fontcolor: "#ffffff", fillcolor: "#4a90d9" },
            },

            {
              criteria: { source: "^src/hooks" },
              attributes: { fontcolor: "#ffffff", fillcolor: "#2abfbf" },
            },

            {
              criteria: { source: "^src/providers" },
              attributes: { fontcolor: "#ffffff", fillcolor: "#c96cb5" },
            },

            {
              criteria: { source: "^src/styles" },
              attributes: { fillcolor: "#c8963c" },
            },

            {
              criteria: { source: "^src/utils" },
              attributes: { fontcolor: "#ffffff", fillcolor: "#6c8ebf" },
            },
          ],
        },
      },
    },
  },
}
