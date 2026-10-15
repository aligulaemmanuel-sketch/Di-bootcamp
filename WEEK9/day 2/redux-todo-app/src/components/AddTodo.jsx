import React, { useState } from "react";
import { connect } from "react-redux";
import { addTodo } from "../redux/actions";

function AddTodo({ addTodo }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setText("");
  };

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        aria-label="New todo"
      />
      <button type="submit">Add</button>
    </form>
  );
}

// No state needed here, only dispatching.
const mapDispatchToProps = { addTodo };

export default connect(null, mapDispatchToProps)(AddTodo);
