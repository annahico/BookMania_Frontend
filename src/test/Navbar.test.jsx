/* eslint-disable no-undef */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import i18n from "../i18n";
import Navbar from "../components/layout/Navbar";
import AuthProvider from "../context/AuthProvider";
import ThemeProvider from "../context/ThemeProvider";

const renderNavbar = () => render(
  <MemoryRouter>
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </ThemeProvider>
  </MemoryRouter>
);

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
    i18n.changeLanguage("es");
  });

  test("cambiar el selector de idioma traduce la interfaz al momento", async () => {
    const user = userEvent.setup();
    renderNavbar();

    expect(screen.getAllByText("Catálogo")[0]).toBeInTheDocument();

    const [languageSelect] = screen.getAllByLabelText("Idioma");
    await user.selectOptions(languageSelect, "en");

    expect(screen.getAllByText("Catalog")[0]).toBeInTheDocument();
    expect(screen.queryByText("Catálogo")).not.toBeInTheDocument();
  });

  test("el interruptor de tema alterna la clase dark en <html>", async () => {
    const user = userEvent.setup();
    document.documentElement.classList.remove("dark");
    renderNavbar();

    const [themeToggle] = screen.getAllByRole("button", { name: /modo oscuro/i });
    await user.click(themeToggle);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
