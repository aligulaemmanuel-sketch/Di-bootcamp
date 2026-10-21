// Daily challenge: book list managed with useState and rendered by the generic List.
import { useState } from 'react'
import type { FormEvent } from 'react'
import List from './List'
import type { Book } from '../types'

const initialBooks: Book[] = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas' },
  { id: 2, title: 'Clean Code', author: 'Robert C. Martin' },
  { id: 3, title: 'Eloquent JavaScript', author: 'Marijn Haverbeke' },
]

function BookApp() {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [title, setTitle] = useState<string>('')
  const [author, setAuthor] = useState<string>('')

  // Builds a new book with a unique id and appends it to the state.
  const addBook = (newTitle: string, newAuthor: string): void => {
    setBooks((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((b) => b.id)) + 1 : 1
      const newBook: Book = { id: nextId, title: newTitle, author: newAuthor }
      return [...prev, newBook]
    })
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedAuthor = author.trim()
    if (!trimmedTitle || !trimmedAuthor) return
    addBook(trimmedTitle, trimmedAuthor)
    setTitle('')
    setAuthor('')
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="row book-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <button type="submit">Add book</button>
      </form>

      <List
        items={books}
        renderItem={(book) => (
          <div className="card">
            <strong>{book.title}</strong> <span>by {book.author}</span>
          </div>
        )}
      />
    </div>
  )
}

export default BookApp
