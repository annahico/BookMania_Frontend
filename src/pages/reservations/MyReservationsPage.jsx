import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import reservationService from "../../api/reservationService";
import ConfirmModal from "../../components/common/ConfirmModal";
import Pagination from "../../components/common/Pagination";
import useToast from "../../hooks/useToast";

const PAGE_SIZE = 15;

const MyReservationsPage = () => {
  const { t, i18n } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState({ open: false, message: "", onConfirm: null });
  const { showToast } = useToast();

  const statusLabel = {
    PENDING: { text: t("reservations.statusPending"), color: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400" },
    FULFILLED: { text: t("reservations.statusFulfilled"), color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" },
    CANCELLED: { text: t("reservations.statusCancelled"), color: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300" },
    EXPIRED: { text: t("reservations.statusExpired"), color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" },
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchReservations must run only once on mount
  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch {
      showToast(t("reservations.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const confirm = (message, onConfirm) => setModal({ open: true, message, onConfirm });

  const handleCancel = (reservationId) => {
    confirm(t("reservations.cancelConfirm"), async () => {
      setModal({ open: false });
      try {
        const updated = await reservationService.cancel(reservationId);
        setReservations(reservations.map((r) => (r.id === reservationId ? updated : r)));
        showToast(t("reservations.cancelSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("reservations.cancelError"), "error");
      }
    });
  };

  const filtered = reservations.filter((r) => {
    const matchesSearch = r.bookTitle?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 bg-pink-100 dark:bg-slate-800 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-xl p-4">
              <div className="bg-pink-100 dark:bg-slate-700 rounded h-4 w-1/3 mb-2" />
              <div className="bg-pink-100 dark:bg-slate-700 rounded h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-400 mb-6">{t("reservations.title")}</h1>

      <div className="flex gap-2 mb-3">
        <label htmlFor="reservations-search" className="sr-only">{t("reservations.searchLabel")}</label>
        <input id="reservations-search" type="text" placeholder={t("reservations.searchPlaceholder")} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-600 flex-1" />
        <label htmlFor="reservations-status" className="sr-only">{t("reservations.statusLabel")}</label>
        <select id="reservations-status" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-600">
          <option value="ALL">{t("reservations.statusAll")}</option>
          <option value="PENDING">{t("reservations.statusPending")}</option>
          <option value="FULFILLED">{t("reservations.statusFulfilled")}</option>
          <option value="CANCELLED">{t("reservations.statusCancelled")}</option>
          <option value="EXPIRED">{t("reservations.statusExpired")}</option>
        </select>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        {t("reservations.count", { count: filtered.length })}
        {totalPages > 1 && ` · ${t("reservations.pageOf", { current: page + 1, total: totalPages })}`}
      </p>

      {paginated.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400 text-center py-12">{t("reservations.noResults")}</p>
      ) : (
        <div className="space-y-4">
          {paginated.map((reservation) => (
            <div key={reservation.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-pink-100 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-pink-700 dark:text-pink-400">{reservation.bookTitle}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabel[reservation.status]?.color}`}>
                    {statusLabel[reservation.status]?.text}
                  </span>
                  {reservation.status === "PENDING" && (
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {t("reservations.position", { position: reservation.queuePosition })}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {new Date(reservation.reservationDate).toLocaleDateString(i18n.language)}
                  </span>
                  {reservation.expiryDate && (
                    <span className="text-xs text-pink-700 dark:text-pink-400 font-medium">
                      {t("reservations.expiresOn", { date: new Date(reservation.expiryDate).toLocaleDateString(i18n.language) })}
                    </span>
                  )}
                </div>
              </div>
              {reservation.status === "PENDING" && (
                <button onClick={() => handleCancel(reservation.id)}
                  className="text-sm border border-red-400 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 px-4 py-2 rounded-xl transition-colors flex-shrink-0">
                  {t("reservations.cancelButton")}
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
