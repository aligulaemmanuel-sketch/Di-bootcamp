import React from "react";
import { connect } from "react-redux";
import TodoItem from "./TodoItem";
import { toggleTodo, removeTodo } from "../redux/actions";

function TodoList({ todos, toggleTodo, removeTodo }) {
  if (todos.length === 0) {
    return <p className="empty">Nothing here. Add a todo above!</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={toggleTodo}
          onRemove={removeTodo}
        />
      ))}
    </ul>
  );
}

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case "active":
      return todos.filter((t) => !t.completed);
    case "completed":
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
};

const mapStateToProps = (state) => ({
  todos: getVisibleTodos(state.todos, state.filter),
});

const mapDispatchToProps = { toggleTodo, removeTodo };

export default connect(mapStateToProps, mapDispatchToProps)(TodoList);
