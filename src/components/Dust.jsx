import { useMemo } from "react";

/** Slow floating golden dust. Pure CSS; switched off for reduced motion. */
export default function Dust({ count = 22 }) {
  const motes = useMemo(() => {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: count }, () => ({
      left: `${rand() * 100}%`,
      size: `${2 + rand() * 4}px`,
      dur: `${14 + rand() * 18}s`,
      delay: `${-rand() * 30}s`,
      drift: `${(rand() - 0.5) * 120}px`,
    }));
  }, [count]);

  return (
    <div className="dust" aria-hidden="true">
      {motes.map((m, i) => (
        <span
          key={i}
          style={{ left: m.left, width: m.size, height: m.size, animationDuration: m.dur, animationDelay: m.delay, "--drift": m.drift }}
        />
      ))}
    </div>
  );
}
