import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_CATEGORIES, UNCATEGORIZED } from '../../model/Book'
import type { Book } from '../../model/Book'
import { loadLibrary } from '../../app/storage'
import type { PersistedLibrary } from '../../app/storage'

export type StatusFilter = 'all' | 'read' | 'unread'
export type SortBy = 'title' | 'author' | 'dateAdded'
export type SortDirection = 'asc' | 'desc'

export interface BooksState {
  items: Book[]
  categories: string[]
  statusFilter: StatusFilter
  categoryFilter: string // a category name, or 'all'
  searchQuery: string
  sortBy: SortBy
  sortDirection: SortDirection
}

function createInitialState(): BooksState {
  const persisted = loadLibrary()
  return {
    items: persisted?.items ?? [],
    categories: persisted?.categories ?? [...DEFAULT_CATEGORIES],
    statusFilter: 'all',
    categoryFilter: 'all',
    searchQuery: '',
    sortBy: 'dateAdded',
    sortDirection: 'desc',
  }
}

const booksSlice = createSlice({
  name: 'books',
  initialState: createInitialState(),
  reducers: {
    // --- Books ---
    addBook(state, action: PayloadAction<Book>) {
      state.items.push(action.payload)
    },
    removeBook(state, action: PayloadAction<string>) {
      state.items = state.items.filter((book) => book.id !== action.payload)
    },
    toggleRead(state, action: PayloadAction<string>) {
      const book = state.items.find((b) => b.id === action.payload)
      if (book) book.isRead = !book.isRead
    },

    // --- Filters, search and sorting ---
    setStatusFilter(state, action: PayloadAction<StatusFilter>) {
      state.statusFilter = action.payload
    },
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryFilter = action.payload
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload
    },
    toggleSortDirection(state) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc'
    },

    // --- Categories ---
    addCategory(state, action: PayloadAction<string>) {
      const name = action.payload
      const exists = state.categories.some((c) => c.toLowerCase() === name.toLowerCase())
      if (!exists) state.categories.push(name)
    },
    renameCategory(state, action: PayloadAction<{ from: string; to: string }>) {
      const { from, to } = action.payload
      if (from === UNCATEGORIZED || !state.categories.includes(from)) return
      const clash = state.categories.some(
        (c) => c !== from && c.toLowerCase() === to.toLowerCase(),
      )
      if (clash) return

      state.categories = state.categories.map((c) => (c === from ? to : c))
      state.items.forEach((book) => {
        if (book.category === from) book.category = to
      })
      if (state.categoryFilter === from) state.categoryFilter = to
    },
    deleteCategory(state, action: PayloadAction<string>) {
      const name = action.payload
      if (name === UNCATEGORIZED) return
      state.categories = state.categories.filter((c) => c !== name)
      // Books in a deleted category are kept and moved to "Uncategorized".
      state.items.forEach((book) => {
        if (book.category === name) book.category = UNCATEGORIZED
      })
      if (state.categoryFilter === name) state.categoryFilter = 'all'
    },

    // --- Import ---
    importLibrary(state, action: PayloadAction<PersistedLibrary>) {
      state.items = action.payload.items
      state.categories = action.payload.categories
      state.categoryFilter = 'all'
    },
  },
})

export const {
  addBook,
  removeBook,
  toggleRead,
  setStatusFilter,
  setCategoryFilter,
  setSearchQuery,
  setSortBy,
  toggleSortDirection,
  addCategory,
  renameCategory,
  deleteCategory,
  importLibrary,
} = booksSlice.actions

export default booksSlice.reducer
