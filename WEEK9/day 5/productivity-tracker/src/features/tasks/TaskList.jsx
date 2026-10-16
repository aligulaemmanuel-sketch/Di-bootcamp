import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, editTask, updateTaskProgress } from './tasksSlice';
import {
  selectCategoryById,
  selectSelectedCategoryId,
  selectTasksByCategory,
} from '../selectors';
import TaskItem from './TaskItem';

export default function TaskList() {
  const dispatch = useDispatch();
  const selectedId = useSelector(selectSelectedCategoryId);
  const tasks = useSelector((state) => selectTasksByCategory(state, selectedId));
  const category = useSelector((state) => selectCategoryById(state, selectedId));

  // Stable callbacks (dispatch never changes), so memoized TaskItems
  // don't re-render when a sibling task changes.
  const handleProgress = useCallback(
    (id, progress) => dispatch(updateTaskProgress({ id, progress })),
    [dispatch]
  );
  const handleEdit = useCallback(
    (id, title) => dispatch(editTask({ id, changes: { title } })),
    [dispatch]
  );
  const handleDelete = useCallback((id) => dispatch(deleteTask(id)), [dispatch]);

  return (
    <section>
      <h2>
        {category ? category.name : 'All tasks'} ({tasks.length})
      </h2>
      {tasks.length === 0 ? (
        <p className="empty">No tasks here yet.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onProgress={handleProgress}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
