import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * The public address of the site, used for social-sharing previews and the canonical link.
 * On Vercel it follows the project's production domain automatically, so changing the
 * domain in Vercel is enough. Set SITE_URL to override it anywhere else.
 */
const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "")
).replace(/\/$/, "");

export default defineConfig({
  plugins: [
    react(),
    {
      name: "site-url",
      transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", siteUrl),
    },
  ],
});
