import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Home, Button } from "./components/Home";

describe("Vitest + React Testing Library", () => {
  it("finds text content", () => {
    render(<Home />);
    expect(screen.getByText(/to get started\./)).toBeInTheDocument();
  });

  it("uses the button to increment", () => {
    render(<Button />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Clicked 0 times");
    fireEvent.click(button);
    expect(button).toHaveTextContent("Clicked 1 times");
  });
});
