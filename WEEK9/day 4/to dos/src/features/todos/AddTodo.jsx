import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTodo } from './todoSlice';

export default function AddTodo() {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    dispatch(addTodo(trimmed));
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        aria-label="New todo"
        placeholder="What needs doing?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ flex: 1, padding: 6 }}
      />
      <button type="submit">Add</button>
    </form>
  );
}
