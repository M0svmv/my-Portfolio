import skillsJson from "../content/skills.json";
import { icon } from "./icons";

/** Card frame colour for each skill group (unknown groups get a neutral frame). */
const groups = {
  Frontend: "azure",
  Backend: "emerald",
  Database: "amber",
  Tools: "slate",
};

/** Skills come from src/content/skills.json (editable at /admin). */
export const skills = skillsJson.skills.map(({ title, group, icon: iconName, color, text }, i) => ({
  id: `skill-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  title,
  type: `Skill · ${group}`,
  variant: groups[group] || "obsidian",
  art: icon(iconName, color),
  text,
  desc: `${text}\n\nPart of my ${group.toLowerCase()} toolkit.`,
  serial: `SK-${String(i + 1).padStart(3, "0")}`,
}));
