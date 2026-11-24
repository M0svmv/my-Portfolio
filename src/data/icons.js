import {
  SiHtml5, SiCss, SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiRedux, SiTailwindcss, SiBootstrap, SiSass, SiVite,
  SiNodedotjs, SiExpress, SiNestjs, SiSocketdotio, SiJsonwebtokens, SiGraphql, SiMongodb, SiMongoose, SiMysql, SiPostgresql,
  SiFirebase, SiRedis, SiPrisma, SiGit, SiGithub, SiPostman, SiDocker, SiVercel, SiNetlify, SiRailway, SiFigma, SiJest,
  SiNpm, SiLinux, SiPython, SiCplusplus, SiPhp, SiDjango, SiAngular, SiVuedotjs, SiSvelte, SiFramer, SiSupabase, SiStripe,
  SiLeetcode, SiDevdotto,
} from "react-icons/si";
import {
  FaPlug, FaUserShield, FaCode, FaServer, FaDatabase, FaMobileScreen, FaPalette, FaRobot, FaCloud, FaGlobe, FaLinkedin,
  FaGithub, FaEnvelope, FaFacebook, FaInstagram, FaXTwitter, FaYoutube, FaWhatsapp, FaTelegram, FaBehance, FaDribbble,
  FaDiscord, FaMedium, FaLink, FaWandMagicSparkles, FaLayerGroup, FaRocket, FaBrain, FaUniversalAccess, FaGaugeHigh,
} from "react-icons/fa6";

/**
 * Icons the content editor can pick by name (see public/admin/config.yml).
 * key → [Icon component, default color]. Add a line here to make a new icon available.
 */
export const ICONS = {
  // frontend
  html: [SiHtml5, "#ff6a3d"],
  css: [SiCss, "#4d8cff"],
  javascript: [SiJavascript, "#f7df1e"],
  typescript: [SiTypescript, "#4f9cf0"],
  react: [SiReact, "#61dafb"],
  nextjs: [SiNextdotjs, "#f2f2f2"],
  redux: [SiRedux, "#9f7ae0"],
  tailwind: [SiTailwindcss, "#38bdf8"],
  bootstrap: [SiBootstrap, "#a77bff"],
  sass: [SiSass, "#e06bb0"],
  vite: [SiVite, "#a78bfa"],
  angular: [SiAngular, "#e2412f"],
  vue: [SiVuedotjs, "#42b883"],
  svelte: [SiSvelte, "#ff5f2e"],
  framer: [SiFramer, "#f2f2f2"],
  // backend
  nodejs: [SiNodedotjs, "#6cc24a"],
  express: [SiExpress, "#f2f2f2"],
  nestjs: [SiNestjs, "#e0234e"],
  socketio: [SiSocketdotio, "#f2f2f2"],
  jwt: [SiJsonwebtokens, "#ff5fa2"],
  graphql: [SiGraphql, "#e535ab"],
  rest: [FaPlug, "#ffb347"],
  auth: [FaUserShield, "#7ee0a1"],
  python: [SiPython, "#5fa8e0"],
  django: [SiDjango, "#2ba977"],
  php: [SiPhp, "#9ea3e0"],
  cpp: [SiCplusplus, "#5f9fe0"],
  stripe: [SiStripe, "#8c84ff"],
  // databases
  mongodb: [SiMongodb, "#4db33d"],
  mongoose: [SiMongoose, "#ff6b6b"],
  mysql: [SiMysql, "#5fa8d3"],
  postgresql: [SiPostgresql, "#5f93d6"],
  firebase: [SiFirebase, "#ffca28"],
  supabase: [SiSupabase, "#3ecf8e"],
  redis: [SiRedis, "#ff4438"],
  prisma: [SiPrisma, "#e7e7e7"],
  database: [FaDatabase, "#f2a65a"],
  // tools
  git: [SiGit, "#f05033"],
  github: [SiGithub, "#f2f2f2"],
  postman: [SiPostman, "#ff8a4c"],
  docker: [SiDocker, "#2496ed"],
  vercel: [SiVercel, "#f2f2f2"],
  netlify: [SiNetlify, "#32c3c3"],
  railway: [SiRailway, "#d0c4ff"],
  figma: [SiFigma, "#f24e1e"],
  jest: [SiJest, "#c63d14"],
  npm: [SiNpm, "#cb3837"],
  linux: [SiLinux, "#f7c948"],
  leetcode: [SiLeetcode, "#ffa116"],
  // generic
  code: [FaCode, "#e9c46a"],
  server: [FaServer, "#9fd3ff"],
  mobile: [FaMobileScreen, "#9fd3ff"],
  design: [FaPalette, "#ff9fc8"],
  ai: [FaRobot, "#9fd3ff"],
  brain: [FaBrain, "#ff9fc8"],
  cloud: [FaCloud, "#9fd3ff"],
  web: [FaGlobe, "#7ee0a1"],
  sparkles: [FaWandMagicSparkles, "#ffe39a"],
  layers: [FaLayerGroup, "#ffe39a"],
  rocket: [FaRocket, "#ff8a4c"],
  accessibility: [FaUniversalAccess, "#7ee0a1"],
  performance: [FaGaugeHigh, "#7ee0a1"],
  // social
  linkedin: [FaLinkedin, "#3b8fe0"],
  "github-social": [FaGithub, "#f2f2f2"],
  email: [FaEnvelope, "#f0c040"],
  facebook: [FaFacebook, "#4a8cff"],
  instagram: [FaInstagram, "#ff5f9e"],
  x: [FaXTwitter, "#f2f2f2"],
  youtube: [FaYoutube, "#ff4b4b"],
  whatsapp: [FaWhatsapp, "#3ddc84"],
  telegram: [FaTelegram, "#4bb3ff"],
  behance: [FaBehance, "#4a8cff"],
  dribbble: [FaDribbble, "#ff6fa5"],
  discord: [FaDiscord, "#8c9eff"],
  medium: [FaMedium, "#f2f2f2"],
  devto: [SiDevdotto, "#f2f2f2"],
  link: [FaLink, "#ffe39a"],
};

/** Look up an icon by name; unknown names fall back to a code icon. */
export function icon(name, color) {
  const [Icon, fallbackColor] = ICONS[name] || ICONS.code;
  return { Icon, color: color || fallbackColor };
}
