import profileJson from "../content/profile.json";
import socialsJson from "../content/socials.json";
import { icon } from "./icons";

/**
 * Everything here comes from src/content/*.json, which you edit through the
 * content admin at /admin (Decap CMS) — no code changes needed.
 */

/** Prefix a file in /public/img with the deploy base path. */
export const img = (name) => `${import.meta.env.BASE_URL}img/${name}`;

/** Paths saved by the CMS start with "/" — make them respect the base path too. */
export const asset = (path) => (!path ? "" : /^https?:/.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`);

const emailSocial = socialsJson.socials.find((s) => s.url?.startsWith("mailto:"));

export const profile = {
  ...profileJson,
  photo: asset(profileJson.photo || "/img/photo.webp"),
  intro: profileJson.gameIntro,
  email: emailSocial ? emailSocial.url.replace("mailto:", "") : "",
};

export const socials = socialsJson.socials.map((s) => {
  const { Icon, color } = icon(s.icon, s.color);
  return { ...s, href: s.url, Icon, color };
});
