import { useSelector } from 'react-redux';
import CategorySelector from './features/categories/CategorySelector';
import AddTaskForm from './features/tasks/AddTaskForm';
import TaskList from './features/tasks/TaskList';
import { selectCompletedTasks, selectTasks } from './features/selectors';

export default function App() {
  const completed = useSelector(selectCompletedTasks);
  const total = useSelector(selectTasks).length;

  return (
    <main className="app">
      <header>
        <h1>Productivity Tracker</h1>
        <p className="summary">
          {completed} of {total} tasks completed
        </p>
      </header>
      <CategorySelector />
      <AddTaskForm />
      <TaskList />
    </main>
  );
}
