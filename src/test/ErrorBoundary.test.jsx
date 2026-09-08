/* eslint-disable no-undef */
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ErrorBoundary from "../components/common/ErrorBoundary";

const Bomb = () => {
  throw new Error("boom");
};

describe("ErrorBoundary", () => {
  test("renderiza a los hijos normalmente cuando no hay error", () => {
    render(
      <ErrorBoundary>
        <p>Todo bien</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("Todo bien")).toBeInTheDocument();
  });

  test("muestra un mensaje de fallback en vez de pantalla en blanco si un hijo lanza", () => {
    // React logs the error to console during the render pass even though
    // ErrorBoundary catches it — silence that expected noise for this test.
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver al catálogo" })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
