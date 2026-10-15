import React, { useState } from "react";
import { connect } from "react-redux";
import { addCategory } from "../redux/actions";

function AddCategory({ addCategory }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory(name);
    setName("");
  };

  return (
    <form className="add-todo add-category" onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New category (e.g. Work, Home)"
        aria-label="New category"
      />
      <button type="submit">Add category</button>
    </form>
  );
}

const mapDispatchToProps = { addCategory };

export default connect(null, mapDispatchToProps)(AddCategory);
