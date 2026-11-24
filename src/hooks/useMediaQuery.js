import { useSyncExternalStore } from "react";

export default function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Wide enough to show the full table with the side inspector. */
export const DESKTOP_QUERY = "(min-width: 960px) and (min-height: 560px)";
