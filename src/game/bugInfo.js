/**
 * Real-world explanations for every bug-side card:
 *  what — what the bug actually is in software
 *  sign — how it usually shows up
 *  fix  — how developers prevent or fix it
 */
export const BUG_INFO = {
  "typo-gremlin": {
    what: "A misspelled variable, property or import name — `usre.name` instead of `user.name`.",
    sign: "`ReferenceError: usre is not defined`, or a value that is silently `undefined`.",
    fix: "Let tools catch it: ESLint, TypeScript and editor autocomplete flag unknown names before the code runs.",
  },
  "missing-semicolon": {
    what: "A syntax slip. In JavaScript, automatic semicolon insertion can glue two lines together when the next line starts with `(` or `[`.",
    sign: "`SyntaxError`, or a strange `… is not a function` on a line that looks fine.",
    fix: "Use a formatter (Prettier) and a linter so the style is consistent and risky lines are flagged.",
  },
  "null-pointer": {
    what: "Using a reference that points to nothing — reading a property of `null` or `undefined`.",
    sign: "`TypeError: Cannot read properties of null (reading 'x')` — often after an API returns no data.",
    fix: "Check before you use it: optional chaining (`user?.name`), default values, early returns, and TypeScript's strict null checks.",
  },
  "off-by-one": {
    what: "A loop or index that is one step off — `i <= arr.length` instead of `i < arr.length`, or a range that skips the first or last item.",
    sign: "The last item is missing, duplicated, or `undefined` sneaks into the result.",
    fix: "Prefer `for…of`, `map` and `slice` over manual indexes, and always test the edges: empty list, one item, last item.",
  },
  "undefined-phantom": {
    what: "A value that was never set flows through the code as `undefined` instead of failing loudly.",
    sign: "`NaN`, blank text, or a request sent with `undefined` in the URL.",
    fix: "Initialise state, validate inputs at the boundaries (forms, API responses) and use default parameters.",
  },
  "overflow-spider": {
    what: "A CSS layout bug: content spills out of its box — long words, fixed widths, or a flex child that refuses to shrink.",
    sign: "Text running off the card, a horizontal scrollbar on mobile, buttons pushed off-screen.",
    fix: "`min-width: 0` on flex children, `overflow-wrap: anywhere`, fluid sizes instead of fixed pixels, and testing with very long content.",
  },
  "memory-leak": {
    what: "Memory that is no longer needed is never released — forgotten event listeners, intervals, subscriptions or ever-growing caches.",
    sign: "The app gets slower the longer it stays open, until the tab crashes.",
    fix: "Clean up after yourself: return a cleanup function from `useEffect`, `removeEventListener`, `clearInterval`, and inspect heap snapshots in DevTools.",
  },
  "race-condition": {
    what: "The result depends on which async operation finishes first — e.g. an older search response arrives after a newer one and overwrites it.",
    sign: "Bugs that happen only sometimes, on slow networks, or when you click fast.",
    fix: "Cancel stale requests with `AbortController`, ignore out-of-date responses, and use atomic updates or transactions on the server.",
  },
  "infinite-loop": {
    what: "A loop, recursion or re-render that never stops — the classic React version is a `useEffect` that updates the state it depends on.",
    sign: "A frozen tab, 100% CPU, or `Too many re-renders`.",
    fix: "Give every loop a reachable exit condition and get `useEffect` dependency arrays right.",
  },
  "merge-conflict": {
    what: "Two branches changed the same lines, so Git can't decide which version to keep.",
    sign: "`<<<<<<< HEAD` markers in your files and a merge that refuses to finish.",
    fix: "Pull often, keep pull requests small, talk to your team, resolve by hand — and run the tests afterwards.",
  },
  heisenbug: {
    what: "A bug that changes or disappears when you try to observe it — adding a log or a breakpoint changes the timing.",
    sign: "\"It works on my machine\" and \"it works when I debug it\".",
    fix: "Make it reproducible: record inputs, write a deterministic test, and look for hidden timing or shared-state issues.",
  },
  "deadlock-twins": {
    what: "Two processes each hold a resource the other one needs, so both wait forever.",
    sign: "Requests that hang with no error, database transactions that time out.",
    fix: "Always acquire locks in the same order, keep transactions short, and use timeouts.",
  },
  "spaghetti-golem": {
    what: "Spaghetti code: tangled logic with no clear structure, where everything depends on everything else.",
    sign: "Fixing one thing breaks two others; nobody wants to touch the file.",
    fix: "Refactor step by step into small functions and modules with one job each — with tests in place first.",
  },
  "stack-hydra": {
    what: "A stack overflow: recursion without a base case (or far too deep) keeps adding calls until the call stack runs out.",
    sign: "`RangeError: Maximum call stack size exceeded`.",
    fix: "Make sure every recursion has a base case, or rewrite deep recursion as a loop.",
  },
  "legacy-monolith": {
    what: "A large, old, tightly-coupled codebase that nobody fully understands any more.",
    sign: "Small changes take weeks, deployments are scary, and the original authors are long gone.",
    fix: "Wrap it in tests, then replace it piece by piece (the \"strangler fig\" approach) instead of a big-bang rewrite.",
  },
  "zero-day": {
    what: "A security vulnerability that attackers exploit before the vendor even knows about it — so there is no patch yet.",
    sign: "Suspicious traffic, a security advisory, or an `npm audit` warning on a dependency.",
    fix: "Defense in depth: keep dependencies updated, validate all input, use least privilege, monitor, and be ready to patch fast.",
  },
  /* bug spells & traps */
  "breaking-change": {
    what: "An update that changes an API so existing code stops working — usually a new major version.",
    sign: "Everything broke right after `npm update`.",
    fix: "Follow semantic versioning, read changelogs, commit lockfiles, and deprecate before removing.",
  },
  "crash-report": {
    what: "A crash report: the stack trace and context captured when an app fails.",
    sign: "An error-monitoring alert with a stack trace pointing at minified code.",
    fix: "Use it! Error monitoring with source maps shows exactly which line failed and how often.",
  },
  deadline: {
    what: "Deadline pressure: shipping too fast leads to skipped tests, rushed reviews and shortcuts.",
    sign: "\"We'll fix it later\" comments and a growing pile of tech debt.",
    fix: "Cut scope instead of quality — keep tests and code review even when time is short.",
  },
  "prod-outage": {
    what: "Production is down: real users can't use the app.",
    sign: "Error rates spike, alerts fire, support tickets pour in.",
    fix: "Monitoring and alerts, a staging environment, fast rollbacks — and a blameless post-mortem afterwards.",
  },
  segfault: {
    what: "A segmentation fault: a program touches memory it isn't allowed to, and the operating system kills it.",
    sign: "`Segmentation fault (core dumped)` — common in C/C++ and native Node modules.",
    fix: "Bounds checks, memory-safe languages and sanitizers that catch invalid memory access.",
  },
  timeout: {
    what: "A request takes too long, so the client or server gives up on it.",
    sign: "`504 Gateway Timeout`, spinners that never stop.",
    fix: "Add database indexes, cache, paginate, and use retries with exponential backoff and sensible timeout values.",
  },
};
