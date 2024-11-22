import React, { useState, useEffect } from "react";

function TypingEffect({ text, speed = 100 }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length-1) {
        setDisplayText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval); 
  }, [text, speed]);

  return <span className="typing">{displayText}</span>;
}

export default TypingEffect;
