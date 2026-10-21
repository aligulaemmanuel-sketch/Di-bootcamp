import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCategories } from '../hooks/useCategories'
import { UNCATEGORIZED } from '../model/Book'
import styles from './CategoryManager.module.css'

function CategoryManager() {
  const { categories, counts, createCategory, editCategory, removeCategory } = useCategories()

  const [newName, setNewName] = useState<string>('')
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const result = createCategory(newName)
    setError(result)
    if (!result) setNewName('')
  }

  const startEditing = (name: string): void => {
    setEditing(name)
    setDraft(name)
    setError(null)
  }

  const saveEdit = (name: string): void => {
    const result = editCategory(name, draft)
    setError(result)
    if (!result) setEditing(null)
  }

  const handleDelete = (name: string): void => {
    const count = counts.get(name) ?? 0
    const message =
      count > 0
        ? `Delete "${name}"? Its ${count} book(s) will move to "${UNCATEGORIZED}".`
        : `Delete "${name}"?`
    if (!window.confirm(message)) return
    setError(removeCategory(name))
  }

  return (
    <section className="panel" aria-labelledby="categories-title">
      <h2 className="panel-title" id="categories-title">
        Categories
      </h2>

      <form className={styles.addRow} onSubmit={handleAdd} noValidate>
        <input
          className="input"
          type="text"
          value={newName}
          maxLength={30}
          placeholder="New category"
          aria-label="New category name"
          onChange={(e) => {
            setNewName(e.target.value)
            setError(null)
          }}
        />
        <button className="btn btn-primary" type="submit">
          Add
        </button>
      </form>

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      <ul className={styles.list}>
        {categories.map((name) => {
          const isProtected = name === UNCATEGORIZED
          const isEditing = editing === name

          return (
            <li key={name} className={styles.item}>
              {isEditing ? (
                <>
                  <input
                    className="input"
                    type="text"
                    value={draft}
                    maxLength={30}
                    aria-label={`New name for ${name}`}
                    autoFocus
                    onChange={(e) => {
                      setDraft(e.target.value)
                      setError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(name)
                      if (e.key === 'Escape') setEditing(null)
                    }}
                  />
                  <button type="button" className="btn btn-primary" onClick={() => saveEdit(name)}>
                    Save
                  </button>
                  <button type="button" className="btn" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className={styles.name}>
                    {name}
                    <span className={styles.count}>{counts.get(name) ?? 0}</span>
                  </span>
                  {!isProtected && (
                    <>
                      <button
                        type="button"
                        className="btn"
                        aria-label={`Rename ${name}`}
                        onClick={() => startEditing(name)}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        aria-label={`Delete ${name}`}
                        onClick={() => handleDelete(name)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default CategoryManager
