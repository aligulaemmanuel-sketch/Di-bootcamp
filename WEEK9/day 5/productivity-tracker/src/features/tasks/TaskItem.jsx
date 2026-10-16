import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCategoryById } from '../selectors';

// memo: an item only re-renders when its own task (or the stable callbacks) change.
const TaskItem = memo(function TaskItem({ task, onProgress, onEdit, onDelete }) {
  const category = useSelector((state) => selectCategoryById(state, task.categoryId));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const completed = task.progress === 100;

  const save = () => {
    const title = draft.trim();
    if (title) onEdit(task.id, title);
    else setDraft(task.title);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(task.title);
    setEditing(false);
  };

  return (
    <li className={completed ? 'task completed' : 'task'}>
      <input
        type="checkbox"
        checked={completed}
        aria-label={`Mark "${task.title}" as ${completed ? 'not completed' : 'completed'}`}
        onChange={() => onProgress(task.id, completed ? 0 : 100)}
      />

      <div className="task-main">
        {editing ? (
          <input
            className="edit-input"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') cancel();
            }}
          />
        ) : (
          <span className="title">{task.title}</span>
        )}

        <div className="meta">
          {category && (
            <span className="badge" style={{ background: category.color }}>
              {category.name}
            </span>
          )}
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={task.progress}
            aria-label={`Progress for "${task.title}"`}
            onChange={(e) => onProgress(task.id, Number(e.target.value))}
          />
          <span className="percent">{task.progress}%</span>
        </div>
      </div>

      <div className="actions">
        {editing ? (
          <>
            <button type="button" onClick={save}>Save</button>
            <button type="button" onClick={cancel}>Cancel</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)}>Edit</button>
            <button type="button" className="danger" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
});

export default TaskItem;
