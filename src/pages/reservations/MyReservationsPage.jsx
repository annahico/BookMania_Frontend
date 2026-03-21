import { useState, useEffect } from "react";
import reservationService from "../../api/reservationService";

const statusLabel = {
  PENDING: { text: "En cola", color: "bg-yellow-100 text-yellow-700" },
  FULFILLED: { text: "Cumplida", color: "bg-green-100 text-green-700" },
  CANCELLED: { text: "Cancelada", color: "bg-gray-100 text-gray-600" },
  EXPIRED: { text: "Expirada", color: "bg-red-100 text-red-700" },
};

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error("Error cargando reservas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await reservationService.cancel(reservationId);
      setReservations(reservations.map((r) => (r.id === reservationId ? updated : r)));
      setActionSuccess("Reserva cancelada correctamente.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Error al cancelar la reserva.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis reservas</h1>

      {actionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {actionError}
        </div>
      )}

      {reservations.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No tienes reservas.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{reservation.bookTitle}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabel[reservation.status]?.color}`}>
                    {statusLabel[reservation.status]?.text}
                  </span>
                  {reservation.status === "PENDING" && (
                    <span className="text-xs text-gray-500">
                      Posición en cola: <strong>{reservation.queuePosition}</strong>
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    Reservado el: {new Date(reservation.reservationDate).toLocaleDateString("es-ES")}
                  </span>
                  {reservation.expiryDate && (
                    <span className="text-xs text-orange-600 font-medium">
                      Recoger antes del: {new Date(reservation.expiryDate).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </div>
              </div>

              {reservation.status === "PENDING" && (
                <button
                  onClick={() => handleCancel(reservation.id)}
                  className="text-sm border border-red-400 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                >
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;