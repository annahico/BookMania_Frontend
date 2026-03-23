import { useState, useEffect } from "react";
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

      {/* Filtros */}
      <div className="flex gap-4 mb-8">
        <input type="text" placeholder="Buscar por título o autor..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-fuchsia-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 bg-white" />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-fuchsia-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 bg-white">
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No se encontraron libros.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map((book) => (
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
    </div>
  );
};

export default BooksPage;