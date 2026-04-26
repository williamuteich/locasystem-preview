import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  vite: {
    base: "/locasystem-preview/",
  },
  tanstackStart: {
    server: {
      preset: "static",
    },
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
  },
});
