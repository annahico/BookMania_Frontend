import { useState } from "react";
import { useTranslation } from "react-i18next";
import adminService from "../../../api/adminService";
import Pagination from "../../../components/common/Pagination";
import useToast from "../../../hooks/useToast";
import { paginate, totalPages, searchClass, btnDelete } from "../adminShared";

const AdminFinesTab = ({ fines, setFines, confirm }) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = fines.filter((f) =>
    f.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
    f.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteFine = (id) => {
    confirm(t("admin.fines.voidConfirm"), async () => {
      try {
        await adminService.deleteFine(id);
        setFines((prev) => prev.filter((f) => f.id !== id));
        showToast(t("admin.fines.voidSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("admin.fines.voidError"), "error");
      }
    });
  };

  return (
    <div>
      <label htmlFor="admin-fine-search" className="sr-only">{t("admin.fines.searchLabel")}</label>
      <input id="admin-fine-search" type="text" placeholder={t("admin.fines.searchPlaceholder")} value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        className={searchClass} />
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
        {t("admin.fines.count", { count: filtered.length })}
        {totalPages(filtered) > 1 && ` · ${t("loans.pageOf", { current: page + 1, total: totalPages(filtered) })}`}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.fines.noResults")}</p>}
        {paginate(filtered, page).map((fine) => (
          <div key={fine.id} className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-pink-700 dark:text-pink-400">{fine.bookTitle}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300">{fine.userName}</p>
              <div className="flex gap-4 mt-1 text-xs text-gray-600 dark:text-slate-300 flex-wrap">
                <span>{t("admin.fines.overdueLabel", { count: fine.daysOverdue })}</span>
                <span>{t("admin.fines.penaltyLabel", { count: fine.penaltyDays })}</span>
                <span>{t("admin.fines.untilLabel", { date: new Date(fine.penaltyUntil).toLocaleDateString(i18n.language) })}</span>
              </div>
            </div>
            <button onClick={() => handleDeleteFine(fine.id)} className={btnDelete}>{t("admin.fines.void")}</button>
          </div>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages(filtered)} onPageChange={setPage} />
    </div>
  );
};

export default AdminFinesTab;
