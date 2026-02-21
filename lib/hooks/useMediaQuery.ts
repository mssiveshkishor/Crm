"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
const [matches, setMatches] = useState<boolean>(() => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(query).matches;
});

useEffect(() => {
  const mq = window.matchMedia(query);
  const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}, [query]);

return matches;
}
