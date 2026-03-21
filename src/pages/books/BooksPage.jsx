import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bookService from "../../api/bookService";
import { getBookCover } from "../../utils/bookCover";

// ── Componente portada ──────────────────────────────────────────────────────
const BookCover = ({ isbn, title, coverUrl }) => {
  const [cover, setCover] = useState(coverUrl || null);

  useEffect(() => {
    if (!coverUrl || coverUrl.includes("ejemplo.com")) {
      getBookCover(isbn).then((url) => {
        if (url) setCover(url);
      });
    }
  }, [isbn, coverUrl]);

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden aspect-[2/3] mb-3">
      {cover ? (
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center p-4">
          Sin portada
        </div>
      )}
    </div>
  );
};

// ── Página principal ────────────────────────────────────────────────────────
const BooksPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, categoriesData] = await Promise.all([
          bookService.getAll(),
          bookService.getCategories(),
        ]);
        setBooks(booksData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error cargando libros:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || book.categories?.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Catálogo de libros
      </h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar por título o autor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de libros */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No se encontraron libros.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/books/${book.id}`)}
              className="cursor-pointer group"
            >
              {/* Portada */}
              <BookCover
                isbn={book.isbn}
                title={book.title}
                coverUrl={book.coverUrl}
              />

              {/* Info */}
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>

              {/* Categorías */}
              <div className="flex flex-wrap gap-1 mt-1">
                {book.categories?.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Disponibilidad */}
              <div className="mt-1">
                {book.availableCopies > 0 ? (
                  <span className="text-xs text-green-600 font-medium">
                    Disponible
                  </span>
                ) : (
                  <span className="text-xs text-red-500 font-medium">
                    No disponible
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BooksPage;