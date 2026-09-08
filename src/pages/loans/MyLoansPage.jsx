import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import loanService from "../../api/loanService";
import ConfirmModal from "../../components/common/ConfirmModal";
import Pagination from "../../components/common/Pagination";
import useToast from "../../hooks/useToast";

const PAGE_SIZE = 15;

const MyLoansPage = () => {
  const { t, i18n } = useTranslation();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState({ open: false, message: "", onConfirm: null });
  const { showToast } = useToast();

  const statusLabel = {
    ISSUED: { text: t("loans.statusIssued"), color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" },
    OVERDUE: { text: t("loans.statusOverdue"), color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" },
    RETURNED: { text: t("loans.statusReturned"), color: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300" },
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchLoans must run only once on mount
  useEffect(() => { fetchLoans(); }, []);

  const fetchLoans = async () => {
    try {
      const data = await loanService.getMyLoans();
      setLoans(data);
    } catch {
      showToast(t("loans.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const confirm = (message, onConfirm) => setModal({ open: true, message, onConfirm });

  const handleExtend = (loanId) => {
    confirm(t("loans.extendConfirm"), async () => {
      setModal({ open: false });
      try {
        const updated = await loanService.extend(loanId);
        setLoans(loans.map((l) => (l.id === loanId ? updated : l)));
        showToast(t("loans.extendSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("loans.extendError"), "error");
      }
    });
  };

  const handleReturn = (loanId) => {
    confirm(t("loans.returnConfirm"), async () => {
      setModal({ open: false });
      try {
        const updated = await loanService.returnBook(loanId);
        setLoans(loans.map((l) => (l.id === loanId ? updated : l)));
        showToast(t("loans.returnSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("loans.returnError"), "error");
      }
    });
  };

  const filtered = loans.filter((l) => {
    const matchesSearch = l.bookTitle?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 bg-pink-100 dark:bg-slate-800 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
      <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-400 mb-6">{t("loans.title")}</h1>

      <div className="flex gap-2 mb-3">
        <label htmlFor="loans-search" className="sr-only">{t("loans.searchLabel")}</label>
        <input id="loans-search" type="text" placeholder={t("loans.searchPlaceholder")} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-600 flex-1" />
        <label htmlFor="loans-status" className="sr-only">{t("loans.statusLabel")}</label>
        <select id="loans-status" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-600">
          <option value="ALL">{t("loans.statusAll")}</option>
          <option value="ISSUED">{t("loans.statusIssued")}</option>
          <option value="OVERDUE">{t("loans.statusOverdue")}</option>
          <option value="RETURNED">{t("loans.statusReturned")}</option>
        </select>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        {t("loans.count", { count: filtered.length })}
        {totalPages > 1 && ` · ${t("loans.pageOf", { current: page + 1, total: totalPages })}`}
      </p>

      {paginated.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400 text-center py-12">{t("loans.noResults")}</p>
      ) : (
        <div className="space-y-4">
          {paginated.map((loan) => (
            <div key={loan.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-pink-100 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-pink-700 dark:text-pink-400">{loan.bookTitle}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabel[loan.status]?.color}`}>
                    {statusLabel[loan.status]?.text}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {t("loans.due", { date: new Date(loan.dueDate).toLocaleDateString(i18n.language) })}
                  </span>
                  {loan.returnDate && (
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {t("loans.returned", { date: new Date(loan.returnDate).toLocaleDateString(i18n.language) })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{t("loans.extensionsUsed", { count: loan.extensionsUsed })}</p>
              </div>
              {loan.status !== "RETURNED" && (
                <div className="flex gap-2">
                  {loan.status === "ISSUED" && loan.extensionsUsed < 3 && (
                    <button onClick={() => handleExtend(loan.id)}
                      className="text-sm border border-pink-400 dark:border-pink-800 text-pink-700 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors">
                      {t("loans.extend")}
                    </button>
                  )}
                  <button onClick={() => handleReturn(loan.id)}
                    className="text-sm bg-pink-700 hover:bg-pink-800 dark:bg-pink-600 dark:hover:bg-pink-500 text-white px-4 py-2 rounded-xl transition-colors">
                    {t("loans.return")}
                  </button>
                </div>
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

export default MyLoansPage;
