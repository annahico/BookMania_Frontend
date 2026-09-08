import { useState } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/common/Pagination";
import { paginate, totalPages, searchClass } from "../adminShared";

const AdminReservationsTab = ({ reservations }) => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const statusReservationLabel = {
    PENDING: { text: t("reservations.statusPending"), color: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400" },
    FULFILLED: { text: t("reservations.statusFulfilled"), color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" },
    CANCELLED: { text: t("reservations.statusCancelled"), color: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300" },
    EXPIRED: { text: t("reservations.statusExpired"), color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" },
  };

  const filtered = reservations.filter((r) =>
    r.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
    r.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <label htmlFor="admin-reservation-search" className="sr-only">{t("admin.reservations.searchLabel")}</label>
      <input id="admin-reservation-search" type="text" placeholder={t("admin.reservations.searchPlaceholder")} value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        className={searchClass} />
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
        {t("admin.reservations.count", { count: filtered.length })}
        {totalPages(filtered) > 1 && ` · ${t("loans.pageOf", { current: page + 1, total: totalPages(filtered) })}`}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.reservations.noResults")}</p>}
        {paginate(filtered, page).map((r) => (
          <div key={r.id} className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="font-medium text-pink-700 dark:text-pink-400">{r.bookTitle}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300">{t("admin.reservations.position", { name: r.userName, position: r.queuePosition })}</p>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                {new Date(r.reservationDate).toLocaleDateString(i18n.language)}
                {r.expiryDate && ` · ${t("admin.reservations.expires", { date: new Date(r.expiryDate).toLocaleDateString(i18n.language) })}`}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium self-start sm:self-center ${statusReservationLabel[r.status]?.color}`}>
              {statusReservationLabel[r.status]?.text}
            </span>
          </div>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages(filtered)} onPageChange={setPage} />
    </div>
  );
};

export default AdminReservationsTab;
