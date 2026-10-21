import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAddBook } from '../hooks/useBooks'
import { useCategories } from '../hooks/useCategories'
import { UNCATEGORIZED } from '../model/Book'
import styles from './BookInput.module.css'

function BookInput() {
  const { categories } = useCategories()
  const { addBook, error, clearError } = useAddBook()

  const [title, setTitle] = useState<string>('')
  const [author, setAuthor] = useState<string>('')
  const [category, setCategory] = useState<string>(UNCATEGORIZED)

  // If the chosen category was deleted, fall back to "Uncategorized".
  const selectedCategory = categories.includes(category) ? category : UNCATEGORIZED

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const added = addBook(title, author, selectedCategory)
    if (added) {
      setTitle('')
      setAuthor('')
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2 className="panel-title">Add a book</h2>

      <label className={styles.field}>
        <span>Title</span>
        <input
          className="input"
          type="text"
          value={title}
          maxLength={100}
          placeholder="e.g. Dune"
          onChange={(e) => {
            setTitle(e.target.value)
            clearError()
          }}
        />
      </label>

      <label className={styles.field}>
        <span>Author</span>
        <input
          className="input"
          type="text"
          value={author}
          maxLength={100}
          placeholder="e.g. Frank Herbert"
          onChange={(e) => {
            setAuthor(e.target.value)
            clearError()
          }}
        />
      </label>

      <label className={styles.field}>
        <span>Category</span>
        <select
          className="input"
          value={selectedCategory}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-primary" type="submit">
        Add book
      </button>
    </form>
  )
}

export default BookInput
