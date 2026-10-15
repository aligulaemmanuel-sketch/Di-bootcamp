import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodos } from './todoSlice';
import ToggleTodo from './ToggleTodo';
import RemoveTodo from './RemoveTodo';

export default function TodoList() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.todos);

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  return (
    <section>
      <button onClick={() => dispatch(fetchTodos())} disabled={loading}>
        Fetch todos from API
      </button>

      {loading && <p>Loading...</p>}
      {error && (
        <p role="alert" style={{ color: 'crimson' }}>
          Error: {error}
        </p>
      )}
      {!loading && !error && items.length === 0 && <p>No todos yet.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((todo) => (
          <li
            key={todo.id}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}
          >
            <ToggleTodo todo={todo} />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#888' : 'inherit',
              }}
            >
              {todo.title}
            </span>
            <RemoveTodo todo={todo} />
          </li>
        ))}
      </ul>
    </section>
  );
}
