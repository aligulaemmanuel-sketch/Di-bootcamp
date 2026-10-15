import React from "react";
import { connect } from "react-redux";
import { dismissError } from "../redux/actions";

function ErrorBanner({ error, dismissError }) {
  if (!error) return null;
  return (
    <div className="error-banner" role="alert">
      <span>{error}</span>
      <button onClick={dismissError} aria-label="Dismiss error">
        ×
      </button>
    </div>
  );
}

const mapStateToProps = (state) => ({ error: state.error });
const mapDispatchToProps = { dismissError };

export default connect(mapStateToProps, mapDispatchToProps)(ErrorBanner);
