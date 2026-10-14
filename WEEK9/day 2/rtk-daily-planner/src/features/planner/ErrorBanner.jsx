import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissError } from "./plannerSlice";
import { selectError } from "./selectors";

export default function ErrorBanner() {
  const dispatch = useDispatch();
  const error = useSelector(selectError);
  if (!error) return null;

  return (
    <div className="error-banner" role="alert">
      <span>{error}</span>
      <button onClick={() => dispatch(dismissError())} aria-label="Dismiss error">
        ×
      </button>
    </div>
  );
}
