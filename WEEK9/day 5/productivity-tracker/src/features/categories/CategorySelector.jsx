import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addCategory,
  deleteCategory,
  editCategory,
  setSelectedCategory,
} from './categoriesSlice';
import {
  selectCategories,
  selectCategoryById,
  selectSelectedCategoryId,
} from '../selectors';

export default function CategorySelector() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const selectedId = useSelector(selectSelectedCategoryId);
  const selected = useSelector((state) => selectCategoryById(state, selectedId));
  const [newName, setNewName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    dispatch(addCategory(name));
    setNewName('');
  };

  return (
    <section className="category-selector">
      <div className="chips" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={selectedId === 'all' ? 'chip active' : 'chip'}
          aria-pressed={selectedId === 'all'}
          onClick={() => dispatch(setSelectedCategory('all'))}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={c.id === selectedId ? 'chip active' : 'chip'}
            aria-pressed={c.id === selectedId}
            style={{ '--chip-color': c.color }}
            onClick={() => dispatch(setSelectedCategory(c.id))}
          >
            {c.name}
          </button>
        ))}
      </div>

      <form className="inline-form" onSubmit={handleAdd}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category…"
          aria-label="New category name"
        />
        <button type="submit" disabled={!newName.trim()}>
          Add category
        </button>
      </form>

      {selected && (
        <div className="inline-form">
          {/* key resets the input when switching categories */}
          <input
            key={selected.id}
            defaultValue={selected.name}
            aria-label="Rename selected category"
            onBlur={(e) => {
              const name = e.target.value.trim();
              if (name && name !== selected.name) {
                dispatch(editCategory({ id: selected.id, changes: { name } }));
              } else {
                e.target.value = selected.name;
              }
            }}
          />
          <button
            type="button"
            className="danger"
            onClick={() => dispatch(deleteCategory(selected.id))}
          >
            Delete category
          </button>
        </div>
      )}
    </section>
  );
}
