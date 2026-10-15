import { useDispatch } from 'react-redux';
import { toggleTodo } from './todoSlice';

export default function ToggleTodo({ todo }) {
  const dispatch = useDispatch();

  return (
    <input
      type="checkbox"
      aria-label={`Toggle ${todo.title}`}
      checked={todo.completed}
      onChange={() => dispatch(toggleTodo(todo.id))}
    />
  );
}
