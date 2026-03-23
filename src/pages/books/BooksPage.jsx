import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import bookService from "../../api/bookService";
import { getBookCover } from "../../utils/bookCover";

const BookCover = ({ isbn, title, coverUrl }) => {
  const [cover, setCover] = useState(coverUrl || null);

  useEffect(() => {
    if (!coverUrl || coverUrl.includes("ejemplo.com")) {
      getBookCover(isbn).then((url) => { if (url) setCover(url); });
    }
  }, [isbn, coverUrl]);

  return (
    <div className="bg-fuchsia-50 rounded-xl overflow-hidden aspect-[2/3] mb-3 border border-fuchsia-100">
      {cover ? (
        <img src={cover} alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-fuchsia-300 text-sm text-center p-4">
          Sin portada
        </div>
      )}
    </div>
  );
};

const BooksPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 15;

  const fetchBooks = useCallback(async (page = 0, titleAuthor = "", catId = "") => {
    setLoading(true);
    try {
      const params = { page, size: PAGE_SIZE };
      if (titleAuthor) params.title = titleAuthor;
      if (catId) params.categoryId = catId;

      const data = await bookService.getAll(params);
      setBooks(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);
    } catch (err) {
      console.error("Error cargando libros:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bookService.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const cat = categories.find((c) => c.name === selectedCategory);
    fetchBooks(currentPage, search, cat?.id || "");
  }, [currentPage, search, selectedCategory, fetchBooks, categories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(0);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-fuchsia-700 mb-6">Catálogo de libros</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-fuchsia-100 rounded-xl aspect-[2/3] mb-3" />
              <div className="bg-fuchsia-100 rounded h-3 mb-1.5" />
              <div className="bg-fuchsia-100 rounded h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-fuchsia-700 mb-6">Catálogo de libros</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por título o autor..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 min-w-[200px] border border-fuchsia-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 bg-white"
        />
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="border border-fuchsia-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 bg-white"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {!loading && (
        <p className="text-sm text-gray-400 mb-4">
          {totalElements} {totalElements === 1 ? "libro encontrado" : "libros encontrados"}
          {totalPages > 1 && ` · Página ${currentPage + 1} de ${totalPages}`}
        </p>
      )}

      {books.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No se encontraron libros.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <div key={book.id} onClick={() => navigate(`/books/${book.id}`)}
              className="cursor-pointer group">
              <BookCover isbn={book.isbn} title={book.title} coverUrl={book.coverUrl} />
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-fuchsia-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {book.categories?.map((cat) => (
                  <span key={cat} className="text-xs bg-fuchsia-50 text-fuchsia-600 px-1.5 py-0.5 rounded-full border border-fuchsia-100">
                    {cat}
                  </span>
                ))}
              </div>
              <div className="mt-1">
                {book.availableCopies > 0 ? (
                  <span className="text-xs text-green-600 font-medium">Disponible</span>
                ) : (
                  <span className="text-xs text-red-500 font-medium">No disponible</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
            className="px-3 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i)
            .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1)
            .reduce((acc, i, idx, arr) => {
              if (idx > 0 && i - arr[idx - 1] > 1) acc.push("...");
              acc.push(i);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`px-4 py-2 text-sm rounded-xl transition-colors ${currentPage === item
                    ? "bg-fuchsia-500 text-white font-medium"
                    : "border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50"
                    }`}
                >
                  {item + 1}
                </button>
              )
            )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
          <button
            onClick={() => setCurrentPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
};

export default BooksPage;