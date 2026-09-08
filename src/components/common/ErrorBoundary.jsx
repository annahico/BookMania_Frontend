import { Component } from "react";
import i18n from "../../i18n";

// Render errors can only be caught by a class component's
// getDerivedStateFromError/componentDidCatch — there's no hook equivalent,
// so this can't use useTranslation; it reads the i18n instance directly.
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error no controlado en la interfaz:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream-100 dark:bg-slate-900 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md w-full max-w-md p-8 border border-pink-100 dark:border-slate-700 text-center">
            <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-400 mb-2">{i18n.t("errorBoundary.title")}</h1>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              {i18n.t("errorBoundary.message")}
            </p>
            <button onClick={this.handleReload}
              className="bg-pink-700 hover:bg-pink-800 dark:bg-pink-600 dark:hover:bg-pink-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2">
              {i18n.t("common.backToCatalog")}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
