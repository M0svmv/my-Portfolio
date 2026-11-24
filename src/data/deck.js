import { profile, socials, img } from "./profile";
import { FaBug } from "react-icons/fa6";
import { skills } from "./skills";

/** The four cards in the player's hand. Each one "plays" a deck onto the field. */
export const hand = [
  {
    id: "hero",
    deck: "profile",
    title: profile.name,
    type: "Hero · Developer",
    variant: "gold",
    art: { src: profile.photo },
    text: `I'm ${profile.firstName}, a ${profile.role}.`,
    desc: `${profile.bio}\n\nPlay this card to reveal my CV.`,
    serial: "MO-001",
  },
  {
    id: "skills",
    deck: "skills",
    title: "My Skills",
    type: "Scroll · Arsenal",
    variant: "violet",
    art: { src: img("art-skills.webp") },
    text: "Summon every tool in my stack.",
    desc: `${skills.length} technologies across the MERN stack and beyond.\n\nPlay this card to reveal them all, then pick any one to read more.`,
    serial: "MO-002",
  },
  {
    id: "projects",
    deck: "projects",
    title: "My Projects",
    type: "Archive · Works",
    variant: "teal",
    art: { src: img("art-projects.webp") },
    text: "Pulled live from my GitHub.",
    desc: "My public repositories, fetched live from GitHub.\n\nPlay this card, then pick a project to open its live demo or source code.",
    serial: "MO-003",
  },
  {
    id: "contact",
    deck: "contact",
    title: "Contact Me",
    type: "Relic · Signal",
    variant: "crimson",
    art: { src: img("art-contact.webp") },
    text: "Let's build something together.",
    desc: "Open to work, freelance and collaboration.\n\nPlay this card to see every way to reach me.",
    serial: "MO-004",
  },
  {
    id: "duel",
    deck: "duel",
    title: "Bug Hunt",
    type: "Game · Card duel",
    variant: "obsidian",
    art: { Icon: FaBug, color: "#ff6b6b" },
    text: "A full card duel: developer vs. bugs!",
    desc: "A playable trading-card duel. You're the developer: summon your stack (React, Node.js, MongoDB…), cast fixes like Hotfix and Code Review, and set traps like Try / Catch — the bugs fight back with Memory Leaks, Race Conditions and Segfaults.\n\n8000 LP each. Play this card to start.",
    serial: "MO-005",
  },
];

const profileDeck = [
  {
    id: "cv",
    title: "My CV",
    type: "Relic · Résumé",
    variant: "gold",
    art: { src: img("art-cv.webp") },
    text: "Open or download my résumé.",
    desc: "Everything on one page: education, experience and skills.",
    href: profile.cvUrl,
    cta: "Open my CV",
    serial: "MO-101",
  },
  {
    id: "about",
    title: "About Me",
    type: "Hero · Origin",
    variant: "gold",
    art: { src: img("character.webp"), pixel: true },
    text: "Computer engineer. Builder. Curious.",
    desc: profile.bio,
    serial: "MO-102",
  },
];

const contactDeck = socials.map((s, i) => ({
  id: `contact-${s.id}`,
  title: s.title,
  type: "Relic · Signal",
  variant: "crimson",
  art: { Icon: s.Icon, color: s.color },
  text: s.text,
  desc: s.desc,
  href: s.href,
  cta: s.id === "email" ? "Send an email" : `Open ${s.title}`,
  serial: `CT-${String(i + 1).padStart(3, "0")}`,
}));

/** Static decks. "projects" is loaded from GitHub at runtime. */
export const decks = {
  profile: profileDeck,
  skills,
  contact: contactDeck,
};
