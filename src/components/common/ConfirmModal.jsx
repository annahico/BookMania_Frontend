import { useTranslation } from "react-i18next";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-pink-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-400 mb-2">{t("common.confirmActionTitle")}</h3>
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-sm transition-colors">
            {t("common.cancel")}
          </button>
          <button onClick={onConfirm}
            className="bg-pink-700 hover:bg-pink-800 dark:bg-pink-600 dark:hover:bg-pink-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors">
            {t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
