import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/modules/**/domain/**/*.ts", "src/modules/**/application/**/*.ts"],
      provider: "v8",
      reporter: ["text", "html"],
    },
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
