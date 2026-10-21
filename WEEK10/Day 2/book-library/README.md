# Personal Book Library

React + TypeScript + Redux Toolkit book library built with Vite.

## Run it

```bash
npm install
npm run dev      # open the URL Vite prints (usually http://localhost:5173)
npm run build    # type-checks with tsc, then builds for production
```

Requires Node.js 18 or newer.

## Setting it up from scratch (Part 1)

```bash
mkdir book-library && cd book-library
npm create vite@latest . -- --template react-ts
npm install
npm install @reduxjs/toolkit react-redux
npm run dev
```

Then copy `src/` from this project over the generated one.

## Where each part lives

| Part | Files |
| --- | --- |
| 2. Data model | `src/model/Book.ts` (`Book` interface, `BookItem` class with getters, `toJSON`, `fromJSON`) |
| 3. Redux store | `src/app/store.ts`, `src/features/books/booksSlice.ts` (add, remove, toggle read, filters, categories) |
| 4. Custom hooks | `src/hooks/` (`useBooks`, `useFilters`, `useCategories`, `useLibraryData`, `useDebouncedValue`, typed `redux.ts`) |
| 5. Components | `src/components/` (`BookInput`, `BookList`, `BookItem`, plus `Filters`, `Stats`, `CategoryManager`, `DataTools`, `Highlight`) |
| 6. Styling | `*.module.css` per component, shared styles and theme variables in `src/index.css` |
| 7. Validation and errors | Form validation in `useAddBook` and `useCategories`; import validation in `src/app/storage.ts` |

## Challenge exercises

| Challenge | Where |
| --- | --- |
| Search with debounce and highlighting | `Filters.tsx` (300 ms debounce), `useVisibleBooks`, `Highlight.tsx` |
| Sorting by title, author, date added, with direction toggle | `Filters.tsx`, `useVisibleBooks` |
| Statistics dashboard | `Stats.tsx`, `useLibraryStats` (totals, read/unread, progress bar, per-category counts) |
| Data persistence, export, import | `src/app/store.ts` (auto-save), `src/app/storage.ts`, `DataTools.tsx`, `useLibraryData` |
| Categories management | `CategoryManager.tsx`, `useCategories` (add, rename, delete, count per category) |

## Design notes

- Redux state holds plain `Book` objects, because class instances are not serializable. `BookItem` is used to create books and to serialize them.
- "Uncategorized" is protected. Deleting a category moves its books there instead of deleting them.
- Reading progress is tracked as the share of books marked read.
- The only async step is importing a file, which shows an "Importing…" state.
