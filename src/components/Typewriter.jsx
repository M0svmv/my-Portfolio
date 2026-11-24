import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Types `text` out one character at a time, pausing a little on punctuation.
 * Remount it (change its `key`) to restart. Screen readers get the full text at once.
 */
export default function Typewriter({ text, speed = 22, instant = false, onDone, className = "" }) {
  const reduce = useReducedMotion();
  const skip = instant || reduce;
  const [count, setCount] = useState(skip ? text.length : 0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (skip) setCount(text.length);
  }, [skip, text.length]);

  useEffect(() => {
    if (count >= text.length) {
      doneRef.current?.();
      return;
    }
    const prev = text[count - 1];
    const delay = /[.!?]/.test(prev) ? speed * 9 : /[,—:]/.test(prev) ? speed * 4 : prev === "\n" ? speed * 6 : speed;
    const t = setTimeout(() => setCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [count, text, speed]);

  const typing = count < text.length;

  return (
    <p className={`typewriter ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        <span className={`typewriter__caret ${typing ? "is-typing" : ""}`} />
      </span>
    </p>
  );
}
