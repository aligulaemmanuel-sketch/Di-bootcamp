import { useEffect, useState } from 'react'
import { useFilters } from '../hooks/useFilters'
import { useCategories } from '../hooks/useCategories'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { SortBy, StatusFilter } from '../features/books/booksSlice'
import styles from './Filters.module.css'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'dateAdded', label: 'Date added' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
]

function Filters() {
  const {
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
  } = useFilters()
  const { categories } = useCategories()

  // The input updates instantly; the store only updates once typing pauses.
  const [searchText, setSearchText] = useState<string>(searchQuery)
  const debouncedSearch = useDebouncedValue(searchText, 300)

  useEffect(() => {
    setSearch(debouncedSearch)
  }, [debouncedSearch, setSearch])

  return (
    <div className={`panel ${styles.bar}`}>
      <label className={styles.search}>
        <span className="visually-hidden">Search books</span>
        <input
          className="input"
          type="search"
          placeholder="Search by title or author…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </label>

      <div className={styles.group} role="group" aria-label="Filter by status">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn ${statusFilter === option.value ? 'btn-active' : ''}`}
            aria-pressed={statusFilter === option.value}
            onClick={() => setStatus(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className={styles.select}>
        <span>Category</span>
        <select
          className="input"
          value={categoryFilter}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.select}>
        <label htmlFor="sort-by">Sort by</label>
        <div className={styles.sortRow}>
          <select
            id="sort-by"
            className="input"
            value={sortBy}
            onChange={(e) => setSort(e.target.value as SortBy)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            onClick={toggleDirection}
            aria-label={`Sort direction: ${sortDirection === 'asc' ? 'ascending' : 'descending'}. Click to reverse.`}
            title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Filters
