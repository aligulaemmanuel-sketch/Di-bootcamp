import { useDispatch } from 'react-redux';
import { removeTodo } from './todoSlice';

export default function RemoveTodo({ todo }) {
  const dispatch = useDispatch();

  return (
    <button
      aria-label={`Remove ${todo.title}`}
      onClick={() => dispatch(removeTodo(todo.id))}
    >
      Remove
    </button>
  );
}
