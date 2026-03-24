/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import bookService from "../../api/bookService";
import loanService from "../../api/loanService";
import reservationService from "../../api/reservationService";
import { getBookCover } from "../../utils/bookCover";
import useAuth from "../../hooks/useAuth";
import useToast from "../../hooks/useToast";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanDone, setLoanDone] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationDone, setReservationDone] = useState(false);

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

  const handleLoan = async () => {
    setLoanLoading(true);
    try {
      await loanService.create(book.id);
      showToast("Préstamo solicitado correctamente", "success");
      setBook({ ...book, availableCopies: book.availableCopies - 1 });
      setLoanDone(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Error al solicitar el préstamo", "error");
    } finally {
      setLoanLoading(false);
    }
  };

  const handleReservation = async () => {
    setReservationLoading(true);
    try {
      await reservationService.create(book.id);
      showToast("Reserva realizada correctamente", "success");
      setReservationDone(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Error al hacer la reserva", "error");
    } finally {
      setReservationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-fuchsia-400">Cargando libro...</p>
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
      <button onClick={() => navigate(-1)}
        className="text-sm text-fuchsia-400 hover:text-fuchsia-600 mb-6 flex items-center gap-1">
        ← Volver al catálogo
      </button>

      <div className="flex flex-col md:flex-row gap-10">

        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-fuchsia-50 rounded-2xl overflow-hidden aspect-[2/3] border border-fuchsia-100">
            {cover ? (
              <img src={cover} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-fuchsia-300 text-sm text-center p-4">
                Sin portada
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-fuchsia-700 mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{book.author}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {book.categories?.map((cat) => (
              <span key={cat}
                className="bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 text-sm px-3 py-1 rounded-full">
                {cat}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm bg-fuchsia-50 rounded-2xl p-4 border border-fuchsia-100">
            {book.isbn && (
              <div>
                <p className="text-fuchsia-400 font-medium">ISBN</p>
                <p className="text-gray-700">{book.isbn}</p>
              </div>
            )}
            {book.pages && (
              <div>
                <p className="text-fuchsia-400 font-medium">Páginas</p>
                <p className="text-gray-700">{book.pages}</p>
              </div>
            )}
            {book.publishYear && (
              <div>
                <p className="text-fuchsia-400 font-medium">Año de publicación</p>
                <p className="text-gray-700">{book.publishYear}</p>
              </div>
            )}
            <div>
              <p className="text-fuchsia-400 font-medium">Copias totales</p>
              <p className="text-gray-700">{book.totalCopies}</p>
            </div>
            <div>
              <p className="text-fuchsia-400 font-medium">Disponibilidad</p>
              {book.availableCopies > 0 ? (
                <p className="text-green-600 font-medium">
                  {book.availableCopies} {book.availableCopies === 1 ? "copia disponible" : "copias disponibles"}
                </p>
              ) : (
                <p className="text-red-500 font-medium">No disponible</p>
              )}
            </div>
          </div>

          {!isAuthenticated() ? (
            <p className="text-sm text-gray-500">
              <button onClick={() => navigate("/login")} className="text-fuchsia-500 hover:underline">
                Inicia sesión
              </button>{" "}
              para solicitar un préstamo o reserva.
            </p>
          ) : book.availableCopies > 0 ? (
            <button onClick={handleLoan} disabled={loanLoading || loanDone}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-fuchsia-300 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">
              {loanLoading ? "Solicitando..." : loanDone ? "Préstamo solicitado ✓" : "Solicitar préstamo"}
            </button>
          ) : (
            <button onClick={handleReservation} disabled={reservationLoading || reservationDone}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-fuchsia-300 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">
              {reservationLoading ? "Reservando..." : reservationDone ? "Reservado ✓" : "Reservar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;