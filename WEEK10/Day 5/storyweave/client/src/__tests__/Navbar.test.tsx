import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Navbar from "../components/Navbar";

describe("Navbar", () => {
  it("opens the mobile menu and closes it after navigation", () => {
    render(
      <MemoryRouter>
        <Navbar
          user={{ id: "writer-1", username: "story_writer" }}
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole("button", { name: "Open navigation menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Close navigation menu" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Profile: story_writer" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /new story/i }));

    expect(screen.getByRole("button", { name: "Open navigation menu" })).toHaveAttribute("aria-expanded", "false");
  });
});
