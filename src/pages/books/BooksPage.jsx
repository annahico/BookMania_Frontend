import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import bookService from "../../api/bookService";
import { getBookCover } from "../../utils/bookCover";
import useToast from "../../hooks/useToast";
import Pagination from "../../components/common/Pagination";

const BookCover = ({ isbn, coverUrl }) => {
  const [cover, setCover] = useState(coverUrl || null);

  useEffect(() => {
    let cancelled = false;
    if (!coverUrl || coverUrl.includes("ejemplo.com")) {
      getBookCover(isbn).then((url) => {
        if (!cancelled && url) setCover(url);
      });
    }
    return () => { cancelled = true; };
  }, [isbn, coverUrl]);

  return (
    <div className="bg-pink-50 rounded-xl overflow-hidden aspect-[2/3] mb-3 border border-pink-100">
      {cover ? (
        <img src={cover} alt="" loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-pink-700 text-sm text-center p-4">
          Sin portada
        </div>
      )}
    </div>
  );
};

const BooksPage = () => {
  const { showToast } = useToast();
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

  // Only the very first load should show the full-page skeleton; a search
  // or page change while books are already on screen shouldn't blank the
  // list out from under the user.
  const hasLoadedOnce = useRef(false);

  const fetchBooks = useCallback(async (page = 0, titleAuthor = "", catId = "") => {
    setLoading(true);
    try {
      const params = { page, size: PAGE_SIZE };
      if (titleAuthor) params.title = titleAuthor;
      if (catId) params.categoryId = catId;

      const data = await bookService.getAll(params);

      setBooks(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
      setCurrentPage(data?.number || 0);
    } catch {
      showToast("Error cargando el catálogo. Inténtalo de nuevo.", "error");
      setBooks([]);
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showToast identity is stable via useCallback in ToastProvider
  }, []);

  useEffect(() => {
    bookService.getCategories().then(setCategories).catch(() => {
      showToast("No se pudieron cargar las categorías", "error");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
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

  if (loading && !hasLoadedOnce.current) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-pink-700 mb-6">Catálogo de libros</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-pink-100 rounded-xl aspect-[2/3] mb-3" />
              <div className="bg-pink-100 rounded h-3 mb-1.5" />
              <div className="bg-pink-100 rounded h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-pink-700 mb-6">Catálogo de libros</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        <label htmlFor="book-search" className="sr-only">Buscar por título o autor</label>
        <input
          id="book-search"
          type="text"
          placeholder="Buscar por título o autor..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 min-w-[200px] border border-pink-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
        />
        <label htmlFor="book-category" className="sr-only">Filtrar por categoría</label>
        <select
          id="book-category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="border border-pink-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-400 mb-4" role="status" aria-live="polite">
        {totalElements} {totalElements === 1 ? "libro encontrado" : "libros encontrados"}
        {totalPages > 1 && ` · Página ${currentPage + 1} de ${totalPages}`}
      </p>

      {books.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No se encontraron libros.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`} className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2">
              <BookCover isbn={book.isbn} coverUrl={book.coverUrl} />
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-pink-800 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {book.categories?.map((cat) => (
                  <span key={cat} className="text-xs bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded-full border border-pink-100">
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
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default BooksPage;
