import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("LandingPage", () => {
  it("switches between light and dark mode and remembers the preference", () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    const page = container.querySelector(".landing-page");

    expect(page).not.toHaveClass("dark");
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(page).toHaveClass("dark");
    expect(localStorage.getItem("storyweave-theme")).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(page).not.toHaveClass("dark");
    expect(localStorage.getItem("storyweave-theme")).toBe("light");
  });
});
