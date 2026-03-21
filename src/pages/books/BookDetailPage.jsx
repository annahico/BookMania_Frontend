import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import bookService from "../../api/bookService";
import { getBookCover } from "../../utils/bookCover";
import useAuth from "../../hooks/useAuth";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await bookService.getById(id);
        setBook(data);

        if (!data.coverUrl || data.coverUrl.includes("ejemplo.com")) {
          const url = await getBookCover(data.isbn);
          setCover(url);
        } else {
          setCover(data.coverUrl);
        }
      } catch (err) {
        setError("No se pudo cargar el libro.");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando libro...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || "Libro no encontrado"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1"
      >
        ← Volver al catálogo
      </button>

      <div className="flex flex-col md:flex-row gap-10">

        {/* Portada */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-gray-100 rounded-xl overflow-hidden aspect-[2/3]">
            {cover ? (
              <img
                src={cover}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center p-4">
                Sin portada
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{book.author}</p>

          {/* Categorías */}
          <div className="flex flex-wrap gap-2 mb-6">
            {book.categories?.map((cat) => (
              <span
                key={cat}
                className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            {book.isbn && (
              <div>
                <p className="text-gray-400 font-medium">ISBN</p>
                <p className="text-gray-700">{book.isbn}</p>
              </div>
            )}
            {book.publishYear && (
              <div>
                <p className="text-gray-400 font-medium">Año de publicación</p>
                <p className="text-gray-700">{book.publishYear}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400 font-medium">Copias totales</p>
              <p className="text-gray-700">{book.totalCopies}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Disponibilidad</p>
              {book.availableCopies > 0 ? (
                <p className="text-green-600 font-medium">
                  {book.availableCopies} {book.availableCopies === 1 ? "copia disponible" : "copias disponibles"}
                </p>
              ) : (
                <p className="text-red-500 font-medium">No disponible</p>
              )}
            </div>
          </div>

          {/* Acciones */}
          {!isAuthenticated() ? (
            <p className="text-sm text-gray-500">
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline"
              >
                Inicia sesión
              </button>{" "}
              para solicitar un préstamo o reserva.
            </p>
          ) : book.availableCopies > 0 ? (
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
              Solicitar préstamo
            </button>
          ) : (
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
              Reservar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;