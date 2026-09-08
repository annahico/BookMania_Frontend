import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import fineService from "../../api/fineService";
import Pagination from "../../components/common/Pagination";
import useToast from "../../hooks/useToast";

const PAGE_SIZE = 15;

const MyFinesPage = () => {
  const { t, i18n } = useTranslation();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const data = await fineService.getMyFines();
        setFines(data);
      } catch {
        showToast(t("fines.loadError"), "error");
      } finally {
        setLoading(false);
      }
    };
    fetchFines();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  const filtered = fines.filter((f) =>
    f.bookTitle?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <div>
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
    <div>
      <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-400 mb-2">{t("fines.title")}</h1>
      <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
        {t("fines.subtitle")}
      </p>

      <label htmlFor="fines-search" className="sr-only">{t("fines.searchLabel")}</label>
      <input id="fines-search" type="text" placeholder={t("fines.searchPlaceholder")} value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        className="border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-600 w-full max-w-2xl mb-3" />
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        {t("fines.count", { count: filtered.length })}
        {totalPages > 1 && ` · ${t("fines.pageOf", { current: page + 1, total: totalPages })}`}
      </p>

      {paginated.length === 0 ? (
        <div className="bg-pink-50 dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-8 text-center">
          <p className="text-pink-700 dark:text-pink-400 font-medium">{t("fines.noneTitle")}</p>
          <p className="text-pink-700 dark:text-pink-400 text-sm mt-1">{t("fines.noneSubtitle")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((fine) => {
            const isActive = fine.penaltyDaysRemaining > 0;
            return (
              <div key={fine.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 ${isActive ? "border-pink-200 dark:border-pink-900" : "border-gray-200 dark:border-slate-700"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-pink-700 dark:text-pink-400">{fine.bookTitle}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-slate-400">
                      <span>{t("fines.daysOverdue", { count: fine.daysOverdue })}</span>
                      <span>{t("fines.penaltyDays", { count: fine.penaltyDays })}</span>
                      <span>{t("fines.blockedUntil", { date: new Date(fine.penaltyUntil).toLocaleDateString(i18n.language) })}</span>
                    </div>
                  </div>
                  {isActive ? (
                    <div className="flex-shrink-0 bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-900 rounded-xl px-4 py-2 text-center">
                      <p className="text-pink-700 dark:text-pink-300 font-bold text-lg">{fine.penaltyDaysRemaining}</p>
                      <p className="text-pink-700 dark:text-pink-300 text-xs">{t("fines.daysRemaining")}</p>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2 text-center">
                      <p className="text-gray-500 dark:text-slate-400 text-xs">{t("fines.penaltyFulfilledLabel")}</p>
                      <p className="text-gray-600 dark:text-slate-300 font-medium text-sm">{t("fines.penaltyFulfilled")}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default MyFinesPage;
