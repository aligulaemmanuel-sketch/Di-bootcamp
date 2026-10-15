import AddTodo from './features/todos/AddTodo';
import TodoList from './features/todos/TodoList';

export default function App() {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 560, margin: '2rem auto' }}>
      <h1>Todo List</h1>
      <AddTodo />
      <TodoList />
    </main>
  );
}
