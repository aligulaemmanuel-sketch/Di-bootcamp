import { useState } from "react";
import quotes from "./QuotesDatabase.js";
import QuoteBox from "./components/QuoteBox.jsx";

const seen = new Set();
const QUOTES = [];
for (const q of quotes) {
  const key = q.quote.trim().toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  QUOTES.push({
    id: QUOTES.length,
    text: q.quote.trim(),
    author: q.author.trim() || "Unknown",
  });
}

const PALETTES = [
  { bg: "#1b263b", text: "#e0e1dd", accent: "#778da9" },
  { bg: "#3a0ca3", text: "#f72585", accent: "#4cc9f0" },
  { bg: "#0d3b2e", text: "#d8f3dc", accent: "#74c69d" },
  { bg: "#432818", text: "#ffe6a7", accent: "#bb9457" },
  { bg: "#590d22", text: "#ffccd5", accent: "#ff4d6d" },
  { bg: "#001219", text: "#94d2bd", accent: "#ee9b00" },
  { bg: "#22223b", text: "#f2e9e4", accent: "#c9ada7" },
  { bg: "#2b2d42", text: "#edf2f4", accent: "#ef233c" },
  { bg: "#14213d", text: "#fca311", accent: "#e5e5e5" },
  { bg: "#2d1e2f", text: "#f0e6ef", accent: "#d44a7a" },
];

const randomIndex = (length) => Math.floor(Math.random() * length);

function randomQuote(exceptId) {
  let index = randomIndex(QUOTES.length);
  if (QUOTES.length > 1) {
    while (QUOTES[index].id === exceptId) index = randomIndex(QUOTES.length);
  }
  return QUOTES[index];
}

function randomPalette(exceptIndex) {
  let index = randomIndex(PALETTES.length);
  if (PALETTES.length > 1) {
    while (index === exceptIndex) index = randomIndex(PALETTES.length);
  }
  return { palette: PALETTES[index], index };
}

export default function App() {
  const [quote, setQuote] = useState(() => randomQuote(-1));
  const [{ palette, index: paletteIndex }, setTheme] = useState(() =>
    randomPalette(-1)
  );
  const [copied, setCopied] = useState(false);

  function handleNewQuote() {
    setQuote((prev) => randomQuote(prev.id));
    setTheme((prev) => randomPalette(prev.index));
    setCopied(false);
  }

  async function handleCopyQuote() {
    const textToCopy = `"${quote.text}" — ${quote.author}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  return (
    <div
      className="app"
      style={{
        background: `radial-gradient(circle at top, ${palette.accent}33 0%, transparent 35%), ${palette.bg}`,
        color: palette.text,
        transition: "background 0.6s ease, color 0.6s ease",
      }}
    >
      <QuoteBox
        quote={quote.text}
        author={quote.author}
        accent={palette.accent}
        textColor={palette.text}
        onNewQuote={handleNewQuote}
        onCopyQuote={handleCopyQuote}
        copied={copied}
      />
    </div>
  );
}
