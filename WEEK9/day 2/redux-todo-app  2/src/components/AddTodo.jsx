import React, { useState } from "react";
import { connect } from "react-redux";
import { addTodo } from "../redux/actions";

// Reusable: pass the categoryId of the category this form adds to.
function AddTodo({ categoryId, addTodo }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo(categoryId, text);
    setText("");
  };

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a todo to this category"
        aria-label="New todo"
      />
      <button type="submit">Add</button>
    </form>
  );
}

const mapDispatchToProps = { addTodo };

export default connect(null, mapDispatchToProps)(AddTodo);
