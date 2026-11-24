import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import {
  FaArrowRight,
  FaArrowUp,
  FaArrowUpRightFromSquare,
  FaBars,
  FaCheck,
  FaCode,
  FaCopy,
  FaEnvelope,
  FaFileArrowDown,
  FaGamepad,
  FaGithub,
  FaLayerGroup,
  FaLinkedin,
  FaServer,
  FaStar,
  FaWandMagicSparkles,
  FaXmark,
} from "react-icons/fa6";
import { SiReact, SiNodedotjs, SiMongodb } from "react-icons/si";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import ModeSwitch from "../components/ModeSwitch";
import { GameCard } from "../components/GameCard";
import { profile, socials } from "../data/profile";
import servicesJson from "../content/services.json";
import { icon } from "../data/icons";
import { skills } from "../data/skills";
import { hand } from "../data/deck";
import "./ProPortfolio.css";

const ease = [0.16, 1, 0.3, 1];
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.75, ease, delay },
});

const NAV = [
  ["about", "About"],
  ["services", "Services"],
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["contact", "Contact"],
];

const ROLES = profile.heroRoles?.length ? profile.heroRoles : [profile.role];

// Links are optional in the CMS, so look them up loosely and fall back gracefully.
const email = socials.find((s) => s.url?.startsWith("mailto:"));
const linkedin = socials.find((s) => s.icon === "linkedin" || s.id === "linkedin");
const github = socials.find((s) => s.icon === "github-social" || s.id === "github") || {
  href: `https://github.com/${profile.githubUser}`,
};
const quickLinks = socials.filter((s) => s.quickLink);
const skillGroup = (s) => s.type.split("·")[1].trim();

/* ───────────── helpers ───────────── */

/** Card with a gold glow that follows the pointer (fill + border). */
const Spot = forwardRef(function Spot({ as = "div", className = "", children, ...rest }, ref) {
  const Tag = motion[as];
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag ref={ref} className={`spot ${className}`} onPointerMove={onMove} {...rest}>
      {children}
    </Tag>
  );
});

function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function SectionTitle({ index, eyebrow, title, accent, children }) {
  return (
    <motion.header className="pro-section__head" {...reveal()}>
      <p className="pro-eyebrow">
        <span>{String(index).padStart(2, "0")}</span>
        {eyebrow}
      </p>
      <h2>
        {title} {accent && <span className="pro-gold">{accent}</span>}
      </h2>
      {children && <p className="pro-section__lead">{children}</p>}
    </motion.header>
  );
}

/* ───────────── nav ───────────── */

function Nav({ onSwitch }) {
  const ids = useMemo(() => NAV.map(([id]) => id), []);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`pro-nav ${scrolled ? "is-scrolled" : ""}`} aria-label="Main">
      <a className="pro-nav__brand" href="#top" onClick={() => setOpen(false)}>
        <span className="pro-nav__logo">MO</span>
        <span className="pro-nav__name">{profile.name}</span>
      </a>

      <ul className="pro-nav__links">
        {NAV.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} className={active === id ? "is-active" : ""}>
              {active === id && <motion.span layoutId="nav-pill" className="pro-nav__pill" />}
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="pro-nav__end">
        <ModeSwitch mode="pro" onChange={onSwitch} className="pro-nav__switch" />
        <ModeSwitch mode="pro" onChange={onSwitch} compact className="pro-nav__switch--compact" />
        <button
          type="button"
          className="pro-nav__burger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <FaXmark /> : <FaBars />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="pro-nav__menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {NAV.map(([id, label], i) => (
              <motion.li key={id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}>
                <a href={`#${id}`} onClick={() => setOpen(false)} className={active === id ? "is-active" : ""}>
                  {label}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ───────────── hero ───────────── */

function RotatingRole() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ROLES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="pro-rotator" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROLES[i]}
          className="pro-gold"
          initial={{ y: "0.6em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.6em", opacity: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Hero({ projectCount, onPlay }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--hx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--hy", `${e.clientY - r.top}px`);
  };
  const step = (i) => ({
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.85, ease, delay: 0.1 + i * 0.09 } },
  });
  const badges = [
    { Icon: SiReact, label: "React", color: "#61dafb", cls: "is-a" },
    { Icon: SiNodedotjs, label: "Node.js", color: "#6cc24a", cls: "is-b" },
    { Icon: SiMongodb, label: "MongoDB", color: "#4db33d", cls: "is-c" },
  ];

  return (
    <section className="pro-hero" id="top" ref={ref} onPointerMove={onMove}>
      <div className="pro-hero__grid" aria-hidden="true" />
      <div className="pro-hero__spot" aria-hidden="true" />

      <div className="pro-hero__copy">
        {profile.openToWork && (
          <motion.p className="pro-status" {...step(0)}>
            <span className="pro-status__dot" /> {profile.statusText || "Open to new opportunities"}
          </motion.p>
        )}
        <motion.h1 {...step(1)}>
          <span className="pro-hero__name">{profile.name}</span>
          <span className="pro-hero__line">
            I build <RotatingRole />
          </span>
        </motion.h1>
        <motion.p className="pro-hero__bio" {...step(2)}>
          {profile.role} — {profile.bio}
        </motion.p>
        <motion.div className="pro-hero__ctas" {...step(3)}>
          <a className="pro-btn pro-btn--gold" href="#projects">
            View my work <FaArrowRight aria-hidden="true" />
          </a>
          <a className="pro-btn pro-btn--ghost" href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
            <FaFileArrowDown aria-hidden="true" /> Download CV
          </a>
          <span className="pro-hero__socials">
            {quickLinks.map(({ id, title, href, Icon }) => (
              <a key={id} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" aria-label={title} title={title}>
                <Icon />
              </a>
            ))}
          </span>
        </motion.div>
        <motion.ul className="pro-stats" {...step(4)}>
          <li>
            <strong>{projectCount ?? "—"}</strong>
            <span>Public projects</span>
          </li>
          <li>
            <strong>{skills.length}+</strong>
            <span>Technologies</span>
          </li>
          <li>
            <strong>MERN</strong>
            <span>Full-stack</span>
          </li>
        </motion.ul>
      </div>

      <motion.div
        className="pro-hero__visual"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 1.1, ease, delay: 0.15 } }}
      >
        <div className="pro-hero__orb" aria-hidden="true" />
        <svg className="pro-hero__ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="96" />
        </svg>
        <div className="pro-portrait">
          <img src={profile.photo} alt={profile.name} />
        </div>
        {badges.map(({ Icon, label, color, cls }, i) => (
          <motion.span
            key={label}
            className={`pro-float ${cls}`}
            style={{ "--brand": color }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.8 + i * 0.15, type: "spring", stiffness: 200, damping: 15 } }}
          >
            <Icon aria-hidden="true" /> {label}
          </motion.span>
        ))}
        <motion.button
          type="button"
          className="pro-hero__play"
          onClick={onPlay}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 1.2, duration: 0.6, ease } }}
        >
          <FaGamepad aria-hidden="true" />
          <span>
            <strong>Prefer to play?</strong>
            Explore it as a card game
          </span>
          <FaArrowRight aria-hidden="true" />
        </motion.button>
      </motion.div>

      <a className="pro-scroll" href="#about" aria-label="Scroll to About">
        <span />
      </a>
    </section>
  );
}

function Marquee() {
  const row = [...skills, ...skills];
  return (
    <div className="pro-marquee" aria-hidden="true">
      <div className="pro-marquee__track">
        {row.map(({ id, title, art: { Icon, color } }, i) => (
          <span key={`${id}-${i}`} style={{ "--brand": color }}>
            <Icon /> {title}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────────── sections ───────────── */

function About() {
  const facts = (profile.facts || []).map((f) => [f.label, f.value]);
  return (
    <section className="pro-section" id="about">
      <SectionTitle index={1} eyebrow="About" title="Engineer by training," accent="builder by habit." />
      <div className="pro-about">
        <motion.div className="pro-about__text" {...reveal()}>
          <p>{profile.bio}</p>
          {(profile.about || []).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </motion.div>
        <Spot as="dl" className="pro-facts" {...reveal(0.1)}>
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </Spot>
      </div>
    </section>
  );
}

function Services() {
  const items = servicesJson.services.map((s) => ({ ...s, Icon: icon(s.icon).Icon, tags: s.tags || [] }));
  return (
    <section className="pro-section" id="services">
      <SectionTitle index={2} eyebrow="Services" title="What I can" accent="do for you." />
      <div className="pro-services">
        {items.map(({ Icon, title, text, tags }, i) => (
          <Spot as="article" key={title} className="pro-service" {...reveal(i * 0.08)}>
            <span className="pro-service__icon">
              <Icon aria-hidden="true" />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
            <ul>
              {tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Spot>
        ))}
      </div>
    </section>
  );
}

function Skills() {
  const groups = useMemo(() => {
    const map = new Map();
    skills.forEach((s) => {
      const g = skillGroup(s);
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(s);
    });
    return [...map];
  }, []);
  return (
    <section className="pro-section" id="skills">
      <SectionTitle index={3} eyebrow="Skills" title="The tools" accent="I work with." />
      <div className="pro-skills">
        {groups.map(([group, items], gi) => (
          <Spot as="article" key={group} className={`pro-skill-group is-${group.toLowerCase()}`} {...reveal(gi * 0.07)}>
            <header>
              <h3>{group}</h3>
              <span>{items.length}</span>
            </header>
            <ul>
              {items.map(({ id, title, art: { Icon, color }, text }) => (
                <li key={id} title={text} style={{ "--brand": color }}>
                  <Icon aria-hidden="true" />
                  {title}
                </li>
              ))}
            </ul>
          </Spot>
        ))}
      </div>
    </section>
  );
}

function ProjectThumb({ project }) {
  const [broken, setBroken] = useState(false);
  const src = !broken && project.art?.src;
  const { Icon, color } = project.art?.Icon ? project.art : project.art?.fallback || {};
  return (
    <div className="pro-project__thumb" style={{ "--brand": color || "#d9a441" }}>
      {src ? (
        <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} />
      ) : Icon ? (
        <Icon aria-hidden="true" />
      ) : (
        <FaCode aria-hidden="true" />
      )}
    </div>
  );
}

function Projects({ projects }) {
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const langs = useMemo(() => ["All", ...new Set(projects.cards.map((p) => p.lang))], [projects.cards]);
  const list = projects.cards.filter((p) => filter === "All" || p.lang === filter);
  const shown = showAll ? list : list.slice(0, 6);
  const loading = projects.status !== "ready" && projects.status !== "error";

  return (
    <section className="pro-section" id="projects">
      <SectionTitle index={4} eyebrow="Projects" title="Things" accent="I've built.">
        Pulled live from my GitHub — every card links to a live demo or the source code.
      </SectionTitle>

      {langs.length > 2 && (
        <motion.div className="pro-filters" role="tablist" aria-label="Filter by language" {...reveal()}>
          {langs.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={filter === l}
              className={filter === l ? "is-on" : ""}
              onClick={() => setFilter(l)}
            >
              {filter === l && <motion.span layoutId="filter-pill" className="pro-filters__pill" />}
              <span>{l}</span>
            </button>
          ))}
        </motion.div>
      )}

      {projects.status === "error" && (
        <p className="pro-note">
          GitHub didn't answer right now.{" "}
          <a href={github.href} target="_blank" rel="noopener noreferrer">
            See all projects on GitHub →
          </a>
        </p>
      )}

      <motion.div className="pro-projects" layout>
        {loading
          ? Array.from({ length: 3 }, (_, i) => <div key={i} className="pro-project is-skeleton" />)
          : (
            <AnimatePresence mode="popLayout">
              {shown.map((p, i) => (
                <Spot
                  as="article"
                  key={p.id}
                  layout
                  className={`pro-project ${i === 0 && filter === "All" ? "is-featured" : ""}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: (i % 6) * 0.06 } }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  <ProjectThumb project={p} />
                  <div className="pro-project__body">
                    <div className="pro-project__meta">
                      <span className="pro-tag">{p.lang}</span>
                      {p.stars > 0 && (
                        <span>
                          <FaStar aria-hidden="true" /> {p.stars}
                        </span>
                      )}
                      <span>Updated {p.updated}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                    <div className="pro-project__links">
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noopener noreferrer" className="is-primary">
                          Live demo <FaArrowUpRightFromSquare aria-hidden="true" />
                        </a>
                      )}
                      <a href={p.repoUrl} target="_blank" rel="noopener noreferrer">
                        <FaGithub aria-hidden="true" /> Source
                      </a>
                    </div>
                  </div>
                </Spot>
              ))}
            </AnimatePresence>
          )}
      </motion.div>

      {list.length > 6 && (
        <div className="pro-more">
          <button type="button" className="pro-btn pro-btn--ghost" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show fewer" : `Show all ${list.length} projects`}
          </button>
        </div>
      )}
    </section>
  );
}

function GameTeaser({ onPlay }) {
  return (
    <section className="pro-section">
      <motion.div className="pro-teaser" {...reveal()}>
        <div className="pro-teaser__copy">
          <p className="pro-eyebrow pro-eyebrow--dark">Interactive version</p>
          <h2>Rather play than scroll?</h2>
          <p>
            The same portfolio, reimagined as a card table — play a card from your hand and its deck is dealt onto the
            field.
          </p>
          <button type="button" className="pro-btn pro-btn--dark" onClick={onPlay}>
            <FaGamepad aria-hidden="true" /> Play the card game
          </button>
        </div>
        <div className="pro-teaser__fan" aria-hidden="true">
          {hand.map((card, i) => (
            <motion.div
              key={card.id}
              className="pro-teaser__card"
              style={{ "--i": i - (hand.length - 1) / 2 }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.1, type: "spring", stiffness: 120, damping: 16 } }}
              viewport={{ once: true }}
              whileHover={{ y: -22, scale: 1.06, zIndex: 5 }}
            >
              <GameCard card={card} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const address = email ? email.url.replace("mailto:", "") : "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = email.href;
    }
  };
  return (
    <section className="pro-section" id="contact">
      <Spot className="pro-contact" {...reveal()}>
        <div className="pro-contact__glow" aria-hidden="true" />
        <p className="pro-eyebrow">
          <span>05</span>Contact
        </p>
        <h2>
          Let's build something <span className="pro-gold">together.</span>
        </h2>
        <p>{profile.contactText}</p>
        {email && (
        <div className="pro-contact__email">
          <a href={email.href}>{address}</a>
          <button type="button" onClick={copy} aria-label="Copy email address">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "y" : "n"}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
              >
                {copied ? <FaCheck /> : <FaCopy />}
              </motion.span>
            </AnimatePresence>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        )}
        <div className="pro-contact__ctas">
          {email && (
            <a className="pro-btn pro-btn--gold" href={email.href}>
              <FaEnvelope aria-hidden="true" /> Send an email
            </a>
          )}
          {linkedin && (
            <a className="pro-btn pro-btn--ghost" href={linkedin.href} target="_blank" rel="noopener noreferrer">
              <FaLinkedin aria-hidden="true" /> LinkedIn
            </a>
          )}
          <a className="pro-btn pro-btn--ghost" href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
            <FaFileArrowDown aria-hidden="true" /> CV
          </a>
        </div>
        <ul className="pro-socials">
          {socials.map(({ id, title, Icon, href }) => (
            <li key={id}>
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" aria-label={title} title={title}>
                <Icon aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </Spot>
    </section>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="#top"
          className="pro-top"
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
        >
          <FaArrowUp />
        </motion.a>
      )}
    </AnimatePresence>
  );
}

export default function ProPortfolio({ projects, onSwitch }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const play = () => onSwitch("game");
  const projectCount = projects.status === "ready" ? projects.cards.length : null;

  return (
    <div className="pro">
      <motion.div className="pro-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <Nav onSwitch={onSwitch} />

      <main>
        <Hero projectCount={projectCount} onPlay={play} />
        <Marquee />
        <About />
        <Services />
        <Skills />
        <Projects projects={projects} />
        <GameTeaser onPlay={play} />
        <Contact />
      </main>

      <footer className="pro-footer">
        <span>
          © {new Date().getFullYear()} {profile.name}. Built with React &amp; Motion.
        </span>
        <button type="button" onClick={play}>
          <FaGamepad aria-hidden="true" /> Switch to the card game
        </button>
      </footer>
      <BackToTop />
    </div>
  );
}
