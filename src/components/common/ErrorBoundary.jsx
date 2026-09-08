import { Component } from "react";

// Render errors can only be caught by a class component's
// getDerivedStateFromError/componentDidCatch — there's no hook equivalent.
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
        <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 border border-pink-100 text-center">
            <h1 className="text-2xl font-bold text-pink-700 mb-2">Algo salió mal</h1>
            <p className="text-gray-500 mb-6">
              Ha ocurrido un error inesperado. Puedes intentar volver al catálogo.
            </p>
            <button onClick={this.handleReload}
              className="bg-pink-700 hover:bg-pink-800 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2">
              Volver al catálogo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
