import React from "react";
import { connect } from "react-redux";
import AddTodo from "./AddTodo";
import TodoList from "./TodoList";
import { toggleTodo, removeTodo, removeCategory } from "../redux/actions";

function CategorySection({ category, todos, filter, toggleTodo, removeTodo, removeCategory }) {
  const handleRemoveCategory = () => {
    const n = category.todos.length;
    const message =
      n > 0
        ? `Delete "${category.name}" and its ${n} todo${n === 1 ? "" : "s"}?`
        : `Delete "${category.name}"?`;
    if (window.confirm(message)) removeCategory(category.id);
  };

  const emptyMessage =
    category.todos.length === 0
      ? "No todos in this category yet."
      : `No ${filter} todos here.`;

  return (
    <section className="category">
      <header className="category-header">
        <h2>
          {category.name}
          <span className="count">{category.todos.length}</span>
        </h2>
        <button
          className="remove"
          onClick={handleRemoveCategory}
          aria-label={`Delete category ${category.name}`}
          title="Delete category"
        >
          ×
        </button>
      </header>

      <AddTodo categoryId={category.id} />

      <TodoList
        todos={todos}
        emptyMessage={emptyMessage}
        onToggle={(todoId) => toggleTodo(category.id, todoId)}
        onRemove={(todoId) => removeTodo(category.id, todoId)}
      />
    </section>
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

// ownProps.categoryId picks this section's category out of the store.
const mapStateToProps = (state, ownProps) => {
  const category = state.categories.find((c) => c.id === ownProps.categoryId);
  return {
    category,
    todos: category ? getVisibleTodos(category.todos, state.filter) : [],
    filter: state.filter,
  };
};

const mapDispatchToProps = { toggleTodo, removeTodo, removeCategory };

// Guard: if the category vanished between renders, render nothing.
const Guarded = (props) => (props.category ? <CategorySection {...props} /> : null);

export default connect(mapStateToProps, mapDispatchToProps)(Guarded);
