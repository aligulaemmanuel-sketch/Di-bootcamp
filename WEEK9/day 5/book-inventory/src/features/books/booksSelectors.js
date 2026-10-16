import { createSelector } from '@reduxjs/toolkit';

// Input selectors: plain functions that read from state
const selectBooksState = (state) => state.books;

export const selectBooks = (state) => selectBooksState(state).books;
export const selectSelectedGenre = (state) => selectBooksState(state).selectedGenre;

// Helper to build a memoized genre selector
const makeGenreSelector = (genre) =>
  createSelector([selectBooks], (books) =>
    books.filter((book) => book.genre === genre)
  );

// Memoized genre selectors: they only recompute when `books` changes
export const selectHorrorBooks = makeGenreSelector('Horror');
export const selectFantasyBooks = makeGenreSelector('Fantasy');
export const selectScienceFictionBooks = makeGenreSelector('Science Fiction');

// Picks the right list for the currently selected genre,
// reusing the memoized selectors above
export const selectVisibleBooks = createSelector(
  [
    selectSelectedGenre,
    selectBooks,
    selectHorrorBooks,
    selectFantasyBooks,
    selectScienceFictionBooks,
  ],
  (genre, all, horror, fantasy, scifi) => {
    switch (genre) {
      case 'Horror':
        return horror;
      case 'Fantasy':
        return fantasy;
      case 'Science Fiction':
        return scifi;
      default:
        return all;
    }
  }
);
