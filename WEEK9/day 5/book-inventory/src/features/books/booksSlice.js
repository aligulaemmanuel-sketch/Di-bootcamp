import { createSlice } from '@reduxjs/toolkit';

// Mock data simulating the book inventory
const initialState = {
  books: [
    { id: 1, title: 'It', author: 'Stephen King', genre: 'Horror' },
    { id: 2, title: 'Dracula', author: 'Bram Stoker', genre: 'Horror' },
    { id: 3, title: 'The Shining', author: 'Stephen King', genre: 'Horror' },
    { id: 4, title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy' },
    { id: 5, title: 'A Game of Thrones', author: 'George R.R. Martin', genre: 'Fantasy' },
    { id: 6, title: 'Mistborn', author: 'Brandon Sanderson', genre: 'Fantasy' },
    { id: 7, title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction' },
    { id: 8, title: 'Neuromancer', author: 'William Gibson', genre: 'Science Fiction' },
    { id: 9, title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', genre: 'Science Fiction' },
  ],
  selectedGenre: 'All',
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setGenre(state, action) {
      state.selectedGenre = action.payload;
    },
  },
});

export const { setGenre } = booksSlice.actions;
export default booksSlice.reducer;
