import React, { useState, useEffect } from "react";

function TypingEffect({ text, speed = 100 }) {
  const [displayText, setDisplayText] = useState([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        if (text[index] === ".") {
          setDisplayText((prev) => [...prev, <br key={index} />]); // Add a line break for "~"
        } else {
          setDisplayText((prev) => [...prev, text[index]]); // Add the character
        }
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
