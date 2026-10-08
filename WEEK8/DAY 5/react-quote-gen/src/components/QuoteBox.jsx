export default function QuoteBox({
  quote,
  author,
  accent,
  textColor,
  onNewQuote,
  onCopyQuote,
  copied,
  activeFilter,
  filters,
  filterLabels,
  onFilterChange,
}) {
  return (
    <main
      className="quote-box"
      id="quote-box"
      style={{
        color: textColor,
        borderColor: `${accent}55`,
      }}
    >
      <div className="quote-badge" style={{ color: accent }}>
        Daily inspiration
      </div>

      <div className="filter-row" aria-label="Quote categories">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? "filter-btn active" : "filter-btn"}
            onClick={() => onFilterChange(filter)}
            style={{
              color: activeFilter === filter ? textColor : accent,
              borderColor: `${accent}88`,
              background: activeFilter === filter ? `${accent}22` : "transparent",
            }}
          >
            {filterLabels[filter]}
          </button>
        ))}
      </div>

      <h1 className="quote-text" id="text">
        <span className="mark">&ldquo;</span>
        {quote}
      </h1>
      <p className="quote-author" id="author">
        &mdash; {author}
      </p>

      <div className="quote-actions">
        <button
          id="copy-quote"
          className="secondary-btn"
          style={{ color: textColor, borderColor: `${accent}99` }}
          onClick={onCopyQuote}
        >
          {copied ? "Copied!" : "Copy quote"}
        </button>

        <button
          id="new-quote"
          className="new-quote-btn"
          style={{ backgroundColor: accent, color: "#101018" }}
          onClick={onNewQuote}
        >
          New quote
        </button>
      </div>
    </main>
  );
}
