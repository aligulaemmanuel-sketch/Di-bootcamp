import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import booksReducer, { setGenre } from './booksSlice';
import {
  selectBooks,
  selectHorrorBooks,
  selectFantasyBooks,
  selectScienceFictionBooks,
  selectVisibleBooks,
} from './booksSelectors';

const makeStore = () => configureStore({ reducer: { books: booksReducer } });

describe('book selectors', () => {
  it('selectBooks returns all books', () => {
    const state = makeStore().getState();
    expect(selectBooks(state)).toHaveLength(9);
  });

  it('genre selectors only return their own genre', () => {
    const state = makeStore().getState();
    expect(selectHorrorBooks(state).every((b) => b.genre === 'Horror')).toBe(true);
    expect(selectFantasyBooks(state).every((b) => b.genre === 'Fantasy')).toBe(true);
    expect(
      selectScienceFictionBooks(state).every((b) => b.genre === 'Science Fiction')
    ).toBe(true);
    expect(selectHorrorBooks(state)).toHaveLength(3);
  });

  it('selectVisibleBooks follows the selected genre', () => {
    const store = makeStore();
    expect(selectVisibleBooks(store.getState())).toHaveLength(9);

    store.dispatch(setGenre('Fantasy'));
    const fantasy = selectVisibleBooks(store.getState());
    expect(fantasy).toHaveLength(3);
    expect(fantasy.every((b) => b.genre === 'Fantasy')).toBe(true);

    store.dispatch(setGenre('Science Fiction'));
    expect(
      selectVisibleBooks(store.getState()).every((b) => b.genre === 'Science Fiction')
    ).toBe(true);
  });

  it('memoizes: same state gives the same array reference', () => {
    const state = makeStore().getState();
    expect(selectHorrorBooks(state)).toBe(selectHorrorBooks(state));
  });

  it('memoizes: switching genre does not recompute genre selectors', () => {
    const store = makeStore();
    const before = selectHorrorBooks(store.getState());
    store.dispatch(setGenre('Fantasy'));
    const after = selectHorrorBooks(store.getState());
    expect(after).toBe(before);
  });
});
