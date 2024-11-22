import { useEffect, useState } from "react";

export default function TypingEffect({ text }) {
  const [displayedText, setDisplayedText] = useState('');
  const lines = text.split('.').filter((line) => line.trim() !== ''); // Split text into lines.

  useEffect(() => {
    let currentLine = 0;
    let currentChar = 0;
    let interval;

    const handleTyping = () => {
      if (currentChar < lines[currentLine].length) {
        setDisplayedText((prev) => prev + lines[currentLine][currentChar]);
        currentChar++;
      } else {
        currentChar = 0;
        currentLine++;
        if (currentLine < lines.length) {
          setDisplayedText((prev) => prev + '\n'); // Add line break.
        } else {
          clearInterval(interval); // Stop typing when done.
        }
      }
    };

    interval = setInterval(handleTyping, 100);

    return () => clearInterval(interval);
  }, [lines]);

  return (
    <div>
      {displayedText.split('\n').map((line, index) => (
        <p key={index}>{line}</p> // Render each line in a new paragraph.
      ))}
    </div>
  );
}
