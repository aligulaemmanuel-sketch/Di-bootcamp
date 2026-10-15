import React from "react";
import { connect } from "react-redux";
import { setFilter, clearCompleted } from "../redux/actions";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

function Footer({ remaining, completedCount, total, filter, setFilter, clearCompleted }) {
  if (total === 0) return null;

  return (
    <footer className="footer">
      <span>
        {remaining} {remaining === 1 ? "item" : "items"} left
      </span>

      <div className="filters">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        className="clear"
        onClick={clearCompleted}
        disabled={completedCount === 0}
      >
        Clear completed
      </button>
    </footer>
  );
}

// Totals are computed across every category.
const mapStateToProps = (state) => {
  const all = state.categories.flatMap((c) => c.todos);
  const completedCount = all.filter((t) => t.completed).length;
  return {
    total: all.length,
    completedCount,
    remaining: all.length - completedCount,
    filter: state.filter,
  };
};

const mapDispatchToProps = { setFilter, clearCompleted };

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
