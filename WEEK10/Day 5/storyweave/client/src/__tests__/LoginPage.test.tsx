import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/authSlice";
import LoginPage from "../pages/LoginPage";

function renderWithStore() {
  const store = configureStore({ reducer: { auth: authReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("LoginPage", () => {
  it("renders the sign-in form", () => {
    renderWithStore();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
