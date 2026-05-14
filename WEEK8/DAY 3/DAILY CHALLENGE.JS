import React from 'react';
import { useTasks } from './TaskContext';
import TaskItem from './TaskItem';

const TaskList = () => {
  const { state, dispatch } = useTasks();

  const filteredTasks = state.tasks.filter(task => {
    if (state.filter === 'completed') return task.completed;
    if (state.filter === 'active') return !task.completed;
    return true; // 'all'
  });

  return (
    <div>
      <div className="filters">
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}>All</button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'active' })}>Active</button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}>Completed</button>
      </div>

      <ul>
        {filteredTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
};

export default TaskList;