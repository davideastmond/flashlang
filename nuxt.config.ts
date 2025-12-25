import { resolve } from "path";

import { fileURLToPath } from "url";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@sidebase/nuxt-auth",
    "@nuxt/test-utils/module",
  ],
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
  alias: {
    "~/db": resolve(__dirname, "./db"),
    "~/server": fileURLToPath(new URL("./server", import.meta.url)),
  },
  runtimeConfig: {
    nuxtAuth: {
      secret: process.env.AUTH_SECRET,
    },
  },
  auth: {
    baseURL: process.env.AUTH_ORIGIN || "http://localhost:3000",
    globalAppMiddleware: false,
  },
});
