# Random Quote Generator — React

A beginner-friendly React take on the classic quote machine, built for the
assignment: a box showing a random quote (header) + author (below) + a button
that picks a new quote — never the same twice — and randomly recolors the
background, quote text, and button.

## Concepts demonstrated
- **React state** (`useState`) — current quote + current color palette
- **React components** — `App` (logic) → `QuoteBox` (presentation)
- **Event handlers** — `onClick` → `handleNewQuote` calls `setQuote` / `setTheme`
- Derived, deduplicated data (`QuotesDatabase.js` → stable ids, "Unknown" authors)

## Run it
```bash
npm install
npm run dev      # then open the printed http://localhost:5173 URL
```

## How the "never twice" + "random colors" rules work
Both helpers take the *previous* value and re-roll while the new pick equals it:
```js
setQuote((prev) => randomQuote(prev.id));       // re-rolls if same id
setTheme((prev) => randomPalette(prev.index));  // re-rolls if same palette
```
The functional `setState(prev => ...)` form guarantees we compare against the
*latest* state even if clicks race.
