import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const Toast = ({ message, type = "error", onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300",
    success: "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-900 text-pink-700 dark:text-pink-300",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-300",
  };

  return (
    <div role="status" className={`fixed bottom-6 right-6 z-50 border rounded-2xl px-5 py-4 shadow-lg max-w-sm text-sm flex items-start gap-3 ${styles[type]}`}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} aria-label={t("common.close")} className="opacity-60 hover:opacity-100 font-bold text-lg leading-none">×</button>
    </div>
  );
};

export default Toast;
