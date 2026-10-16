import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask } from './tasksSlice';
import { selectCategories, selectSelectedCategoryId } from '../selectors';

export default function AddTaskForm() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const selectedId = useSelector(selectSelectedCategoryId);
  const [title, setTitle] = useState('');
  const [chosenId, setChosenId] = useState('');

  // Default to the category being viewed, else the first one
  const categoryId =
    chosenId && categories.some((c) => c.id === chosenId)
      ? chosenId
      : categories.some((c) => c.id === selectedId)
        ? selectedId
        : categories[0]?.id ?? '';

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !categoryId) return;
    dispatch(addTask({ title: trimmed, categoryId }));
    setTitle('');
  };

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task…"
        aria-label="New task title"
      />
      <select
        value={categoryId}
        onChange={(e) => setChosenId(e.target.value)}
        aria-label="Task category"
        disabled={categories.length === 0}
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button type="submit" disabled={!title.trim() || !categoryId}>
        Add task
      </button>
    </form>
  );
}
