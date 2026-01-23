import { defineVitestProject } from "@nuxt/test-utils/config";
import * as path from "path";
import { defineConfig } from "vitest/config";
const r = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "**/*.config.ts",
        "dist/**",
        "test/**",
        "node_modules/**",
        ".nuxt",
        "**virtual:nuxt**",
      ],
    },
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/{e2e,unit}/**/*.{test,spec}.ts"],
          environment: "node",
        },
        resolve: {
          alias: {
            "~~/shared": r("./shared"),
            "~": r("./server"),
            "~~/db": r("./db"),
          },
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.{test,spec}.ts"],
          environment: "nuxt",
        },
      }),
    ],
  },
});
