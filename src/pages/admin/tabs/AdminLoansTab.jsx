import { useState } from "react";
import { useTranslation } from "react-i18next";
import adminService from "../../../api/adminService";
import Pagination from "../../../components/common/Pagination";
import useToast from "../../../hooks/useToast";
import { paginate, totalPages, searchClass, btnEdit } from "../adminShared";

const AdminLoansTab = ({ loans, setLoans, confirm }) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const statusLoanLabel = {
    ISSUED: { text: t("loans.statusIssued"), color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" },
    OVERDUE: { text: t("loans.statusOverdue"), color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" },
    RETURNED: { text: t("loans.statusReturned"), color: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300" },
  };

  const filtered = loans.filter((l) =>
    l.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
    l.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleReturnLoan = (id) => {
    confirm(t("admin.loans.returnConfirm"), async () => {
      try {
        const updated = await adminService.returnLoan(id);
        setLoans((prev) => prev.map((l) => (l.id === id ? updated : l)));
        showToast(t("admin.loans.returnSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("admin.loans.returnError"), "error");
      }
    });
  };

  return (
    <div>
      <label htmlFor="admin-loan-search" className="sr-only">{t("admin.loans.searchLabel")}</label>
      <input id="admin-loan-search" type="text" placeholder={t("admin.loans.searchPlaceholder")} value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        className={searchClass} />
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
        {t("admin.loans.count", { count: filtered.length })}
        {totalPages(filtered) > 1 && ` · ${t("loans.pageOf", { current: page + 1, total: totalPages(filtered) })}`}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.loans.noResults")}</p>}
        {paginate(filtered, page).map((loan) => (
          <div key={loan.id} className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="font-medium text-pink-700 dark:text-pink-400">{loan.bookTitle}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300">{loan.userName}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-600 dark:text-slate-300 flex-wrap">
                <span>{t("admin.loans.due", { date: new Date(loan.dueDate).toLocaleDateString(i18n.language) })}</span>
                {loan.returnDate && <span>{t("admin.loans.returned", { date: new Date(loan.returnDate).toLocaleDateString(i18n.language) })}</span>}
                <span>{t("admin.loans.extensions", { count: loan.extensionsUsed })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLoanLabel[loan.status]?.color}`}>
                {statusLoanLabel[loan.status]?.text}
              </span>
              {loan.status !== "RETURNED" && (
                <button onClick={() => handleReturnLoan(loan.id)} className={btnEdit}>{t("admin.loans.markReturned")}</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages(filtered)} onPageChange={setPage} />
    </div>
  );
};

export default AdminLoansTab;
