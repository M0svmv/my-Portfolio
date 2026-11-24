import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Intro from "./components/Intro";
import Field from "./components/Field";
import { PlayerHand, OpponentHand } from "./components/Hand";
import { InspectorPanel } from "./components/Inspector";
import MobileTable from "./components/MobileTable";
import HowTo, { HelpButton } from "./components/HowTo";
import BugHunt from "./components/BugHunt";
import ModeSwitch from "./components/ModeSwitch";
import ProPortfolio from "./pro/ProPortfolio";
import Dust from "./components/Dust";
import useGithubProjects from "./hooks/useGithubProjects";
import useMediaQuery, { DESKTOP_QUERY } from "./hooks/useMediaQuery";
import { hand, decks } from "./data/deck";
import { profile } from "./data/profile";

const PLACEHOLDERS = Array.from({ length: 10 }, () => ({}));
const HOWTO_KEY = "howto-seen-v1";

function DesktopTable({ projects, onHelp, ready, onDuel }) {
  const [activeCard, setActiveCard] = useState(null); // the hand card that was played
  const [selected, setSelected] = useState(hand[0]); // what the inspector shows
  const [summon, setSummon] = useState(0);
  const deckKey = activeCard?.deck ?? null;

  const fieldCards = useMemo(() => {
    if (!deckKey) return [];
    if (deckKey === "projects") {
      if (projects.status === "ready") return projects.cards;
      return projects.status === "error" ? [] : PLACEHOLDERS;
    }
    return decks[deckKey];
  }, [deckKey, projects]);

  const play = useCallback((card) => {
    if (card.deck === "duel") {
      setSelected(card);
      onDuel();
      return;
    }
    setActiveCard(card);
    setSelected(card);
    setSummon((n) => n + 1);
  }, [onDuel]);

  // Number keys 1–5 play the matching card from your hand.
  useEffect(() => {
    if (!ready) return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("[aria-modal='true']")) return;
      const card = hand[Number(e.key) - 1];
      if (card) play(card);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play, ready]);

  return (
    <>
      <InspectorPanel card={selected} onHelp={onHelp} />
      <main className="board" aria-label="Card table">
        <Dust />
        {ready && (
          <>
            <OpponentHand />
            <Field
              deckKey={deckKey}
              cards={fieldCards}
              status={deckKey === "projects" ? projects.status : "ready"}
              selectedId={selected?.id}
              onSelect={setSelected}
              summon={summon}
            />
            <PlayerHand cards={hand} activeId={activeCard?.id} onPlay={play} />
          </>
        )}
      </main>
      {ready && <motion.p
        className="kbd-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 2 } }}
        aria-hidden="true"
      >
        Tip: press 1–5 to play a card
      </motion.p>}
    </>
  );
}

/** The card-game view (the original portfolio, now the second view). */
function GameView({ projects, onSwitch }) {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const [intro, setIntro] = useState(true);
  const [help, setHelp] = useState(false);
  const [duel, setDuel] = useState(false);
  const openDuel = useCallback(() => setDuel(true), []);

  const closeIntro = useCallback(() => {
    setIntro(false);
    // First visit: explain how the table works.
    let seen = false;
    try {
      seen = localStorage.getItem(HOWTO_KEY) === "1";
      localStorage.setItem(HOWTO_KEY, "1");
    } catch {
      /* private mode — just show it */
    }
    if (!seen) setTimeout(() => setHelp(true), 1400);
  }, []);

  const openHelp = useCallback(() => setHelp(true), []);
  const closeHelp = useCallback(() => setHelp(false), []);

  return (
    <div className={`app ${desktop ? "app--desktop" : "app--compact"}`}>
      {desktop ? (
        <>
          <DesktopTable projects={projects} onHelp={openHelp} ready={!intro} onDuel={openDuel} />
          {!intro && (
            <motion.div
              className="game-switch"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
            >
              <ModeSwitch mode="game" onChange={onSwitch} />
            </motion.div>
          )}
        </>
      ) : (
        <>
          <header className="topbar">
            <div>
              <h1 className="topbar__name">{profile.name}</h1>
              <p className="topbar__role">{profile.role}</p>
            </div>
            <div className="topbar__actions">
              <ModeSwitch mode="game" onChange={onSwitch} compact />
              <HelpButton onClick={openHelp} />
            </div>
          </header>
          {!intro && <MobileTable projects={projects} onDuel={openDuel} />}
        </>
      )}

      <AnimatePresence>{duel && <BugHunt onClose={() => setDuel(false)} />}</AnimatePresence>
      <HowTo open={help} mode={desktop ? "desktop" : "mobile"} onClose={closeHelp} />
      <AnimatePresence>{intro && <Intro onClose={closeIntro} />}</AnimatePresence>
    </div>
  );
}

/** Professional page first; the card game is one click away (or ?view=game). */
const initialView = () => (new URLSearchParams(window.location.search).get("view") === "game" ? "game" : "pro");

export default function App() {
  const [view, setView] = useState(initialView);
  const projects = useGithubProjects(true);

  useEffect(() => {
    document.documentElement.dataset.view = view;
  }, [view]);

  const switchView = useCallback((next) => {
    const url = new URL(window.location.href);
    if (next === "game") url.searchParams.set("view", "game");
    else url.searchParams.delete("view");
    url.hash = "";
    window.history.replaceState(null, "", url);
    window.scrollTo(0, 0);
    setView(next);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          className={`view view--${view}`}
          initial={{ opacity: 0, scale: view === "game" ? 1.03 : 0.985 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, scale: view === "game" ? 1.03 : 0.985, transition: { duration: 0.25 } }}
        >
          {view === "pro" ? (
            <ProPortfolio projects={projects} onSwitch={switchView} />
          ) : (
            <GameView projects={projects} onSwitch={switchView} />
          )}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
