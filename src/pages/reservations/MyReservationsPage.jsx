/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import reservationService from "../../api/reservationService";
import ConfirmModal from "../../components/common/ConfirmModal";
import useToast from "../../hooks/useToast";

const PAGE_SIZE = 15;

const statusLabel = {
  PENDING: { text: "En cola", color: "bg-yellow-100 text-yellow-700" },
  FULFILLED: { text: "Cumplida", color: "bg-green-100 text-green-700" },
  CANCELLED: { text: "Cancelada", color: "bg-gray-100 text-gray-600" },
  EXPIRED: { text: "Expirada", color: "bg-red-100 text-red-700" },
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPageChange(0)} disabled={currentPage === 0}
        className="px-3 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed">«</button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}
        className="px-4 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed">Anterior</button>
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
            <button key={item} onClick={() => onPageChange(item)}
              className={`px-4 py-2 text-sm rounded-xl transition-colors ${currentPage === item
                ? "bg-fuchsia-500 text-white font-medium"
                : "border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50"}`}>
              {item + 1}
            </button>
          )
        )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}
        className="px-4 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed">Siguiente</button>
      <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage === totalPages - 1}
        className="px-3 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed">»</button>
    </div>
  );
};

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState({ open: false, message: "", onConfirm: null });
  const { showToast } = useToast();

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (err) {
      showToast("Error cargando reservas", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirm = (message, onConfirm) => setModal({ open: true, message, onConfirm });

  const handleCancel = (reservationId) => {
    confirm("¿Cancelar esta reserva?", async () => {
      setModal({ open: false });
      try {
        const updated = await reservationService.cancel(reservationId);
        setReservations(reservations.map((r) => (r.id === reservationId ? updated : r)));
        showToast("Reserva cancelada correctamente", "success");
      } catch (err) {
        showToast(err.response?.data?.message || "Error al cancelar", "error");
      }
    });
  };

  const filtered = reservations.filter((r) =>
    r.bookTitle?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 bg-fuchsia-100 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-fuchsia-100 rounded-xl p-4">
              <div className="bg-fuchsia-100 rounded h-4 w-1/3 mb-2" />
              <div className="bg-fuchsia-100 rounded h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-fuchsia-700 mb-6">Mis reservas</h1>

      <input type="text" placeholder="Buscar por título..." value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        className="border border-fuchsia-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 bg-white w-full mb-3" />
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} reservas
        {totalPages > 1 && ` · Página ${page + 1} de ${totalPages}`}
      </p>

      {paginated.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No tienes reservas.</p>
      ) : (
        <div className="space-y-4">
          {paginated.map((reservation) => (
            <div key={reservation.id}
              className="bg-white rounded-2xl border border-fuchsia-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-fuchsia-700">{reservation.bookTitle}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabel[reservation.status]?.color}`}>
                    {statusLabel[reservation.status]?.text}
                  </span>
                  {reservation.status === "PENDING" && (
                    <span className="text-xs text-gray-500">
                      Posición: <strong>{reservation.queuePosition}</strong>
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(reservation.reservationDate).toLocaleDateString("es-ES")}
                  </span>
                  {reservation.expiryDate && (
                    <span className="text-xs text-fuchsia-500 font-medium">
                      Recoger antes del: {new Date(reservation.expiryDate).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </div>
              </div>
              {reservation.status === "PENDING" && (
                <button onClick={() => handleCancel(reservation.id)}
                  className="text-sm border border-red-400 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors flex-shrink-0">
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {modal.open && (
        <ConfirmModal message={modal.message} onConfirm={modal.onConfirm}
          onCancel={() => setModal({ open: false })} />
      )}
    </div>
  );
};

export default MyReservationsPage;