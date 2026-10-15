import React from "react";
import { connect } from "react-redux";
import CategorySection from "./CategorySection";

function CategoryList({ categoryIds }) {
  return (
    <div className="category-list">
      {categoryIds.map((id) => (
        <CategorySection key={id} categoryId={id} />
      ))}
    </div>
  );
}

// Only ids are mapped, so toggling a todo doesn't re-render the whole list.
const mapStateToProps = (state) => ({
  categoryIds: state.categories.map((c) => c.id),
});

export default connect(
  mapStateToProps,
  null,
  null,
  {
    areStatePropsEqual: (a, b) =>
      a.categoryIds.length === b.categoryIds.length &&
      a.categoryIds.every((id, i) => id === b.categoryIds[i]),
  }
)(CategoryList);
