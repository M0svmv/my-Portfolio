import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Keyboard, A11y } from "swiper/modules";
import { FaArrowLeft, FaArrowUpRightFromSquare, FaCode, FaHandPointer, FaPlay } from "react-icons/fa6";
import "swiper/css";
import "swiper/css/effect-cards";
import { GameCard, CardBack } from "./GameCard";
import Typewriter from "./Typewriter";
import { hand, decks } from "../data/deck";
import "./MobileTable.css";

const isExternal = (href) => /^https?:/.test(href);

/**
 * Phone layout: a swipeable stack of cards (like the original mobile view).
 * Your hand is the first stack; tapping a card opens its deck as a new stack.
 */
export default function MobileTable({ projects, onDuel }) {
  const [deck, setDeck] = useState(null); // the hand card whose deck is open
  const [index, setIndex] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const deckRef = useRef(null);
  deckRef.current = deck;

  const loading = deck?.deck === "projects" && (projects.status === "loading" || projects.status === "idle");
  const failed = deck?.deck === "projects" && projects.status === "error";
  const cards = !deck ? hand : deck.deck === "projects" ? projects.cards : decks[deck.deck];
  const current = cards[Math.min(index, cards.length - 1)];

  const openDeck = useCallback((card) => {
    setDeck(card);
    setIndex(0);
    window.history.pushState({ mobileDeck: card.id }, "");
  }, []);

  // Return to the hand, with the card that was played back on top.
  const closeDeck = useCallback(() => {
    const played = deckRef.current;
    setDeck(null);
    setIndex(Math.max(0, hand.findIndex((h) => h.id === played?.id)));
  }, []);

  const back = useCallback(() => {
    if (window.history.state?.mobileDeck) window.history.back();
    else closeDeck();
  }, [closeDeck]);

  // The phone's own back button / gesture closes the open deck.
  useEffect(() => {
    const onPop = () => closeDeck();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [closeDeck]);

  const activate = (card) => {
    if (!deck && card.deck === "duel") onDuel();
    else if (!deck) openDeck(card);
    else if (card.href) window.open(card.href, isExternal(card.href) ? "_blank" : "_self", "noopener");
  };

  const stackKey = deck ? `${deck.id}-${projects.status}` : "hand";

  return (
    <div className="m-table">
      <div className="m-crumbs">
        <AnimatePresence initial={false}>
          {deck && (
            <motion.button
              type="button"
              className="m-back"
              onClick={back}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              <FaArrowLeft aria-hidden="true" /> Hand
            </motion.button>
          )}
        </AnimatePresence>
        <h2 className="m-crumbs__title">{deck ? deck.title : "Your hand"}</h2>
        {cards.length > 0 && (
          <span className="m-crumbs__count" aria-live="polite">
            {Math.min(index, cards.length - 1) + 1} / {cards.length}
          </span>
        )}
      </div>

      <div className="m-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={stackKey}
            className="m-stack"
            initial={{ opacity: 0, y: 60, rotateX: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { type: "spring", stiffness: 160, damping: 20 } }}
            exit={{ opacity: 0, y: -40, scale: 0.9, transition: { duration: 0.22 } }}
          >
            {loading ? (
              <div className="m-loading">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="m-loading__card" style={{ "--i": i }}>
                    <CardBack />
                  </div>
                ))}
                <p>Shuffling projects from GitHub…</p>
              </div>
            ) : failed || cards.length === 0 ? (
              <p className="m-empty">
                {failed ? "GitHub didn't answer — try again in a minute." : "No public projects yet."}
              </p>
            ) : (
              <Swiper
                className="m-swiper"
                modules={[EffectCards, Keyboard, A11y]}
                effect="cards"
                cardsEffect={{ slideShadows: false, perSlideOffset: 9, perSlideRotate: 3 }}
                grabCursor
                initialSlide={index}
                keyboard={{ enabled: true }}
                onSlideChange={(s) => {
                  setIndex(s.activeIndex);
                  setSwiped(true);
                }}
              >
                {cards.map((card, i) => (
                  <SwiperSlide key={card.id} className="m-slide">
                    <button
                      type="button"
                      className="m-card"
                      onClick={() => i === index && activate(card)}
                      aria-label={deck ? (card.href ? `Open ${card.title}` : card.title) : `Open ${card.title}`}
                      tabIndex={i === index ? 0 : -1}
                    >
                      <GameCard card={card} />
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {!swiped && !deck && (
            <motion.div
              className="m-swipe-hint"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8 } }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                animate={{ x: [-30, 30, -30] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaHandPointer />
              </motion.span>
              Swipe to browse
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {current && !loading && (
        <AnimatePresence mode="wait">
          <motion.section
            key={current.id}
            className="m-info"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
          >
            <div className="m-info__scroll">
              <h3 className="details__title">{current.title}</h3>
              <p className="details__type">{current.type}</p>
              <Typewriter key={current.id} text={current.desc || current.text} speed={12} className="details__desc" />
            </div>
            <div className="actions">
              {!deck ? (
                <button type="button" className="btn-gold" onClick={() => activate(current)}>
                  <FaPlay aria-hidden="true" /> {current.deck === "duel" ? "Start Bug Hunt" : "Play this card"}
                </button>
              ) : current.href ? (
                <a
                  className="btn-gold"
                  href={current.href}
                  target={isExternal(current.href) ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  {current.cta || "Open"} <FaArrowUpRightFromSquare aria-hidden="true" />
                </a>
              ) : null}
              {current.source && (
                <a className="btn-ghost" href={current.source} target="_blank" rel="noopener noreferrer">
                  <FaCode aria-hidden="true" /> Source
                </a>
              )}
            </div>
          </motion.section>
        </AnimatePresence>
      )}
    </div>
  );
}
