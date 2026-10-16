import { useDispatch, useSelector } from 'react-redux';
import { setGenre } from './booksSlice';
import { selectSelectedGenre, selectVisibleBooks } from './booksSelectors';

const GENRES = ['All', 'Horror', 'Fantasy', 'Science Fiction'];

export default function BookList() {
  const dispatch = useDispatch();
  const selectedGenre = useSelector(selectSelectedGenre);
  const books = useSelector(selectVisibleBooks);

  return (
    <section className="book-list">
      <div className="genre-buttons" role="group" aria-label="Filter by genre">
        {GENRES.map((genre) => (
          <button
            key={genre}
            type="button"
            className={genre === selectedGenre ? 'active' : ''}
            aria-pressed={genre === selectedGenre}
            onClick={() => dispatch(setGenre(genre))}
          >
            {genre}
          </button>
        ))}
      </div>

      <h2>
        {selectedGenre === 'All' ? 'All books' : selectedGenre} ({books.length})
      </h2>

      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong>
            <span>by {book.author}</span>
            <em>{book.genre}</em>
          </li>
        ))}
      </ul>
    </section>
  );
}
