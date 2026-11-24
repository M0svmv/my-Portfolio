import { useEffect, useState } from "react";
import { SiJavascript, SiTypescript, SiHtml5, SiCss, SiPython, SiCplusplus, SiPhp } from "react-icons/si";
import { FaCode } from "react-icons/fa6";
import { profile, asset } from "../data/profile";
import settings from "../content/projects.json";

const CACHE_KEY = "gh-projects-v3";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour — keeps us well under GitHub's anonymous rate limit
const MAX_PROJECTS = settings.maxProjects || 60; // the field pages through anything over 20

const languages = {
  JavaScript: [SiJavascript, "#f7df1e"],
  TypeScript: [SiTypescript, "#4f9cf0"],
  HTML: [SiHtml5, "#ff6a3d"],
  CSS: [SiCss, "#4d8cff"],
  SCSS: [SiCss, "#e06bb0"],
  Python: [SiPython, "#5fa8e0"],
  "C++": [SiCplusplus, "#5f9fe0"],
  PHP: [SiPhp, "#9ea3e0"],
};

const prettyName = (name) =>
  name
    .replace(/[-_.]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const monthYear = (iso) =>
  new Date(iso).toLocaleDateString("en", { month: "short", year: "numeric" });

function toCard(repo, i) {
  const [Icon, color] = languages[repo.language] || [FaCode, "#e9c46a"];
  const lang = repo.language || "Code";
  const live = repo.homepage && /^https?:\/\//.test(repo.homepage) ? repo.homepage : null;
  // Repo descriptions on this account hold a thumbnail URL, so use it as the card art.
  const raw = (repo.description || "").trim();
  const thumb = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|svg)(\?\S*)?$/i.test(raw) ? raw : null;
  const description = thumb || !raw ? `A ${lang} project${live ? " with a live demo" : ""}.` : raw;
  return {
    id: `repo-${repo.id}`,
    title: prettyName(repo.name),
    type: `Project · ${lang}`,
    variant: "teal",
    art: thumb ? { src: thumb, contain: true, fallback: { Icon, color } } : { Icon, color },
    text: description,
    desc: `${description}\n\n${lang} · ★ ${repo.stargazers_count} · updated ${monthYear(repo.pushed_at)}`,
    href: live || repo.html_url,
    cta: live ? "Open live demo" : "View on GitHub",
    source: live ? repo.html_url : null,
    stat: repo.stargazers_count ? `★ ${repo.stargazers_count}` : null,
    serial: `PR-${String(i + 1).padStart(3, "0")}`,
    repo: repo.name,
    // plain fields for the professional view
    lang,
    stars: repo.stargazers_count,
    updated: monthYear(repo.pushed_at),
    live,
    repoUrl: repo.html_url,
  };
}

/* ───── CMS controls (src/content/projects.json) ───── */

const norm = (name) => String(name || "").trim().toLowerCase();

/** A project you added by hand in the CMS. */
function manualCard(p, i) {
  const [Icon, color] = languages[p.language] || [FaCode, "#e9c46a"];
  const lang = p.language || "Code";
  const live = p.liveUrl || null;
  const text = p.description || `A ${lang} project.`;
  return {
    id: `manual-${i}-${norm(p.title).replace(/[^a-z0-9]+/g, "-")}`,
    title: p.title,
    type: `Project · ${lang}`,
    variant: "teal",
    art: p.image ? { src: asset(p.image), contain: true, fallback: { Icon, color } } : { Icon, color },
    text,
    desc: `${text}\n\n${lang}`,
    href: live || p.repoUrl || "#",
    cta: live ? "Open live demo" : "View the code",
    source: live && p.repoUrl ? p.repoUrl : null,
    stat: null,
    serial: `PR-M${String(i + 1).padStart(2, "0")}`,
    lang,
    stars: 0,
    updated: p.date || "",
    live,
    repoUrl: p.repoUrl || null,
    repo: null,
  };
}

/** Apply hide / pin / overrides and add manual projects. */
function applySettings(repos) {
  const hidden = new Set((settings.hide || []).map(norm));
  const pins = (settings.pin || []).map(norm);
  const overrides = new Map((settings.overrides || []).map((o) => [norm(o.repo), o]));

  let cards = settings.showGithub === false ? [] : repos.filter((r) => !hidden.has(norm(r.name))).map(toCard);
  cards = cards.map((c) => {
    const o = overrides.get(norm(c.repo));
    if (!o) return c;
    const text = o.description || c.text;
    const live = o.liveUrl || c.live;
    return {
      ...c,
      title: o.title || c.title,
      text,
      desc: c.desc.replace(c.text, text),
      art: o.image ? { src: asset(o.image), contain: true, fallback: c.art.fallback || c.art } : c.art,
      live,
      href: live || c.href,
      cta: live ? "Open live demo" : c.cta,
      source: live ? c.repoUrl : c.source,
    };
  });
  // pinned repos first, in the order you listed them
  const rank = (c) => {
    const i = pins.indexOf(norm(c.repo));
    return i === -1 ? Infinity : i;
  };
  cards = cards.map((c, i) => ({ c, i })).sort((a, b) => rank(a.c) - rank(b.c) || a.i - b.i).map(({ c }) => c);

  const extra = (settings.extra || []).filter((p) => p.title).map(manualCard);
  const extraFirst = extra.filter((_, i) => settings.extra[i]?.featured);
  const extraLast = extra.filter((_, i) => !settings.extra[i]?.featured);
  return [...extraFirst, ...cards, ...extraLast];
}

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.at < CACHE_TTL) return cached.repos;
  } catch {
    /* ignore broken cache */
  }
  return null;
}

/**
 * Loads public, non-fork repositories once `enabled` turns true.
 * Returns { status: "idle" | "loading" | "ready" | "error", cards }.
 */
export default function useGithubProjects(enabled) {
  const [state, setState] = useState({ status: "idle", cards: [] });

  useEffect(() => {
    if (!enabled || state.status !== "idle") return;

    // Only hand-picked projects? No need to call GitHub at all.
    if (settings.showGithub === false) {
      setState({ status: "ready", cards: applySettings([]) });
      return;
    }

    const cached = readCache();
    if (cached) {
      setState({ status: "ready", cards: applySettings(cached) });
      return;
    }

    setState({ status: "loading", cards: [] });
    const controller = new AbortController();
    fetch(`https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=pushed`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const repos = data
          .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== profile.githubUser.toLowerCase())
          .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
          .slice(0, MAX_PROJECTS)
          .map(({ id, name, description, language, homepage, html_url, stargazers_count, pushed_at }) => ({
            id, name, description, language, homepage, html_url, stargazers_count, pushed_at,
          }));
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
        } catch {
          /* storage full or blocked — fine */
        }
        setState({ status: "ready", cards: applySettings(repos) });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Could not load GitHub projects:", err);
        // still show the projects you added by hand
        const manual = applySettings([]);
        setState(manual.length ? { status: "ready", cards: manual } : { status: "error", cards: [] });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return state;
}
