import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  setCategoryFilter,
  setSearchQuery,
  setSortBy,
  setStatusFilter,
  toggleSortDirection,
} from '../features/books/booksSlice'
import type { SortBy, StatusFilter } from '../features/books/booksSlice'

/** Read and change the filter, search and sort settings. */
export function useFilters() {
  const dispatch = useAppDispatch()

  const statusFilter = useAppSelector((state) => state.books.statusFilter)
  const categoryFilter = useAppSelector((state) => state.books.categoryFilter)
  const searchQuery = useAppSelector((state) => state.books.searchQuery)
  const sortBy = useAppSelector((state) => state.books.sortBy)
  const sortDirection = useAppSelector((state) => state.books.sortDirection)

  const setStatus = useCallback(
    (value: StatusFilter): void => {
      dispatch(setStatusFilter(value))
    },
    [dispatch],
  )

  const setCategory = useCallback(
    (value: string): void => {
      dispatch(setCategoryFilter(value))
    },
    [dispatch],
  )

  const setSearch = useCallback(
    (value: string): void => {
      dispatch(setSearchQuery(value))
    },
    [dispatch],
  )

  const setSort = useCallback(
    (value: SortBy): void => {
      dispatch(setSortBy(value))
    },
    [dispatch],
  )

  const toggleDirection = useCallback((): void => {
    dispatch(toggleSortDirection())
  }, [dispatch])

  return {
    statusFilter,
    categoryFilter,
    searchQuery,
    sortBy,
    sortDirection,
    setStatus,
    setCategory,
    setSearch,
    setSort,
    toggleDirection,
  }
}
