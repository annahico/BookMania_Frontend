/* eslint-disable no-undef */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import BooksPage from "../pages/books/BooksPage";
import bookService from "../api/bookService";

vi.mock("../api/bookService");

vi.mock("../utils/bookCover", () => ({
  getBookCover: vi.fn().mockResolvedValue(null),
}));

const mockBooks = [
  {
    id: 1,
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    isbn: "978-0-06-088328-7",
    publishYear: 1967,
    coverUrl: null,
    totalCopies: 3,
    availableCopies: 0,
    categories: ["Ficción"],
  },
  {
    id: 2,
    title: "El nombre del viento",
    author: "Patrick Rothfuss",
    isbn: "978-8401337208",
    publishYear: 2007,
    coverUrl: null,
    totalCopies: 3,
    availableCopies: 3,
    categories: ["Ficción", "Fantasía"],
  },
];

const mockCategories = [
  { id: 2, name: "Ficción" },
  { id: 3, name: "Fantasía" },
];

const renderBooksPage = () => {
  return render(
    <MemoryRouter>
      <BooksPage />
    </MemoryRouter>
  );
};

describe("BooksPage", () => {

  beforeEach(() => {
    bookService.getAll.mockResolvedValue(mockBooks);
    bookService.getCategories.mockResolvedValue(mockCategories);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("muestra el título del catálogo", async () => {
    renderBooksPage();
    await waitFor(() => {
      expect(screen.getByText("Catálogo de libros")).toBeInTheDocument();
    });
  });

  test("carga y muestra los libros", async () => {
    renderBooksPage();
    await waitFor(() => {
      expect(screen.getByText("Cien años de soledad")).toBeInTheDocument();
      expect(screen.getByText("El nombre del viento")).toBeInTheDocument();
    });
  });

  test("muestra el autor de cada libro", async () => {
    renderBooksPage();
    await waitFor(() => {
      expect(screen.getByText("Gabriel García Márquez")).toBeInTheDocument();
      expect(screen.getByText("Patrick Rothfuss")).toBeInTheDocument();
    });
  });

  test("muestra disponibilidad correcta", async () => {
    renderBooksPage();
    await waitFor(() => {
      expect(screen.getByText("No disponible")).toBeInTheDocument();
      expect(screen.getByText("Disponible")).toBeInTheDocument();
    });
  });

  test("filtra libros por búsqueda de título", async () => {
    const user = userEvent.setup();
    renderBooksPage();

    await waitFor(() => {
      expect(screen.getByText("Cien años de soledad")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Buscar por título o autor...");
    await user.type(input, "viento");

    expect(screen.queryByText("Cien años de soledad")).not.toBeInTheDocument();
    expect(screen.getByText("El nombre del viento")).toBeInTheDocument();
  });

  test("filtra libros por búsqueda de autor", async () => {
    const user = userEvent.setup();
    renderBooksPage();

    await waitFor(() => {
      expect(screen.getByText("Gabriel García Márquez")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Buscar por título o autor...");
    await user.type(input, "Rothfuss");

    expect(screen.queryByText("Cien años de soledad")).not.toBeInTheDocument();
    expect(screen.getByText("El nombre del viento")).toBeInTheDocument();
  });

  test("filtra libros por categoría", async () => {
    const user = userEvent.setup();
    renderBooksPage();

    await waitFor(() => {
      expect(screen.getByText("El nombre del viento")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "Fantasía");

    expect(screen.queryByText("Cien años de soledad")).not.toBeInTheDocument();
    expect(screen.getByText("El nombre del viento")).toBeInTheDocument();
  });

  test("muestra mensaje cuando no hay resultados", async () => {
    const user = userEvent.setup();
    renderBooksPage();

    await waitFor(() => {
      expect(screen.getByText("Cien años de soledad")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Buscar por título o autor...");
    await user.type(input, "libro que no existe xyz");

    expect(screen.getByText("No se encontraron libros.")).toBeInTheDocument();
  });

  test("muestra skeleton mientras carga", () => {
    bookService.getAll.mockReturnValue(new Promise(() => { }));
    bookService.getCategories.mockReturnValue(new Promise(() => { }));
    renderBooksPage();
    expect(screen.getByText("Catálogo de libros")).toBeInTheDocument();
  });
});