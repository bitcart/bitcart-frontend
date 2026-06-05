export const reactViteCodeSplittingGroups = [
  {
    name: "react",
    test: /node_modules[\\/](?:react|scheduler)/,
    priority: 30,
  },
  {
    name: "base-ui",
    test: /node_modules[\\/](?:@base-ui|@floating-ui)/,
    priority: 20,
  },
  {
    name: "tanstack",
    test: /node_modules[\\/]@tanstack/,
    priority: 20,
  },
  {
    name: "icons",
    test: /node_modules[\\/](?:@phosphor-icons|lucide-react)/,
    priority: 20,
  },
] as const
