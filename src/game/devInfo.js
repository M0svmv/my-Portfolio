/**
 * Explanations for the developer's cards:
 *  what  — what the technology / practice actually is
 *  power — how it helps developers beat bugs in real life
 *  tip   — how to use the card in Bug Hunt
 */
export const DEV_INFO = {
  "html-scout": {
    what: "HTML is the structure of every web page — headings, forms, buttons and links.",
    power: "Semantic HTML (`<button>`, `<label>`, `<nav>`) makes pages accessible and gives CSS and JavaScript a solid base to build on.",
    tip: "A cheap early blocker. Later, tribute it to summon something stronger.",
  },
  "css-stylist": {
    what: "CSS styles and lays out the page: colors, Flexbox, Grid, animations and responsive design.",
    power: "Fixes the visual bugs — overflowing text, broken mobile layouts — with fluid sizes and `min-width: 0`.",
    tip: "1200 ATK beats most level 1–2 bugs.",
  },
  "js-ninja": {
    what: "JavaScript adds behaviour to the page: events, async requests and DOM updates.",
    power: "Knowing `async/await`, closures and the event loop is how you beat race conditions and undefined values.",
    tip: "1800 ATK with no tribute — your best early attacker.",
  },
  "redux-store": {
    what: "Redux keeps app state in a single, predictable store that only changes through actions and reducers.",
    power: "Predictable state makes bugs reproducible, and the DevTools let you replay every action that led to one.",
    tip: "1600 DEF — Set it face-down to wall off attackers.",
  },
  "react-architect": {
    what: "React builds user interfaces from small, reusable components with hooks.",
    power: "Components keep bugs isolated, and `useEffect` cleanups stop memory leaks before they start.",
    tip: "Tribute one weak monster for a 2300 ATK attacker.",
  },
  "node-engine": {
    what: "Node.js runs JavaScript on the server with a fast, non-blocking event loop.",
    power: "Proper error handling, logging and graceful shutdowns keep crashes out of production.",
    tip: "1700 ATK, no tribute — a solid all-rounder.",
  },
  "express-router": {
    what: "Express is a minimal Node.js framework for routes, middleware and REST APIs.",
    power: "Validation and error-handling middleware stop bad requests before they turn into bugs.",
    tip: "Good tribute material for your level 5+ monsters.",
  },
  "socket-messenger": {
    what: "Socket.IO gives apps real-time, two-way communication — chats, live dashboards, multiplayer.",
    power: "Acknowledgements and reconnection logic fight lost messages and out-of-order updates.",
    tip: "1600 ATK — trades evenly with Memory Leak.",
  },
  "jwt-sentinel": {
    what: "JSON Web Tokens are signed tokens that prove who a user is without server-side sessions.",
    power: "Signed, short-lived tokens keep unauthorised requests out of protected routes.",
    tip: "Balanced 1300 / 1300 — works in Attack or Defense.",
  },
  "mongo-keeper": {
    what: "MongoDB stores data as flexible, JSON-like documents.",
    power: "Schemas (with Mongoose), indexes and transactions keep data consistent and queries fast — no timeouts.",
    tip: "1900 DEF — a great face-down wall.",
  },
  "git-guardian": {
    what: "Git tracks every change to the code and lets a team work on branches in parallel.",
    power: "`git bisect` finds the exact commit that introduced a bug, and `git revert` undoes it safely.",
    tip: "2000 DEF — the toughest wall in your deck.",
  },
  fullstack: {
    what: "A full-stack developer builds the whole app — front end, back end and database.",
    power: "Seeing the whole stack means you can trace a bug from the button click all the way to the database query.",
    tip: "Needs 2 tributes, but 2800 ATK beats almost every bug — even the Legacy Monolith.",
  },
  hotfix: {
    what: "An urgent fix shipped straight to production to stop a critical bug.",
    power: "Fast and targeted — just follow it with a test so the bug can't come back.",
    tip: "Save it for the biggest bug on the field.",
  },
  "code-review": {
    what: "Teammates read your code before it is merged.",
    power: "Catches bugs early, shares knowledge and keeps the codebase consistent.",
    tip: "Draw 2 cards — play it early to find your answers.",
  },
  "unit-tests": {
    what: "Automated tests that check small pieces of code in isolation.",
    power: "They catch regressions before users ever see them.",
    tip: "Gain 1000 LP when the bugs have been hitting hard.",
  },
  "pair-programming": {
    what: "Two developers, one problem — one writes the code while the other reviews in real time.",
    power: "Two sets of eyes spot bugs faster and share knowledge as they go.",
    tip: "+700 ATK this turn — use it to win a fight you'd otherwise lose.",
  },
  "git-revert": {
    what: "`git revert` creates a new commit that undoes an earlier one.",
    power: "The quickest safe way back to a known-good state when a change breaks things.",
    tip: "Brings back your strongest monster from the graveyard.",
  },
  "try-catch": {
    what: "`try { … } catch (err) { … }` handles an error gracefully instead of letting the app crash.",
    power: "Errors get logged and handled, and the user sees a friendly message instead of a blank screen.",
    tip: "Set it, then negate an attack on the Bug's turn.",
  },
  firewall: {
    what: "A firewall filters network traffic and blocks requests that look malicious.",
    power: "Stops attacks at the door, before they ever reach your app.",
    tip: "Set it, then destroy the attacking bug on the Bug's turn.",
  },
};
