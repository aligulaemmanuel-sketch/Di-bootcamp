import { configureStore } from '@reduxjs/toolkit'
import booksReducer from '../features/books/booksSlice'
import { saveLibrary } from './storage'

export const store = configureStore({
  reducer: {
    books: booksReducer,
  },
})

// Data persistence: save to localStorage whenever books or categories change.
let lastItems = store.getState().books.items
let lastCategories = store.getState().books.categories

store.subscribe(() => {
  const { items, categories } = store.getState().books
  if (items !== lastItems || categories !== lastCategories) {
    lastItems = items
    lastCategories = categories
    saveLibrary({ items, categories })
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
