import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <p className="text-6xl mb-2" aria-hidden="true">📚</p>
      <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-400 mb-2">{t("notFound.title")}</h1>
      <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-sm">
        {t("notFound.message")}
      </p>
      <Link to="/"
        className="bg-pink-700 hover:bg-pink-800 dark:bg-pink-600 dark:hover:bg-pink-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2">
        {t("common.backToCatalog")}
      </Link>
    </div>
  );
};

export default NotFoundPage;
