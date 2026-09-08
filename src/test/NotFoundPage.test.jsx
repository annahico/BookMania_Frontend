/* eslint-disable no-undef */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "../pages/NotFoundPage";

describe("NotFoundPage", () => {
  test("muestra un mensaje claro y un enlace de vuelta al catálogo", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Página no encontrada")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Volver al catálogo" });
    expect(link).toHaveAttribute("href", "/");
  });
});
