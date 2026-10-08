export default function QuoteBox({ quote, author, accent, textColor, onNewQuote }) {
  return (
    <main className="quote-box" id="quote-box">
      <h1 className="quote-text" id="text">
        <span className="mark">&ldquo;</span>
        {quote}
      </h1>
      <p className="quote-author" id="author">
        &mdash; {author}
      </p>
      <button
        id="new-quote"
        className="new-quote-btn"
        style={{ backgroundColor: accent, color: "#101018" }}
        onClick={onNewQuote}
      >
        New quote
      </button>
    </main>
  );
}
