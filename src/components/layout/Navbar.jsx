import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <>
      {/* Spacer para compensar el navbar fijo */}
      <div className="h-14" />

      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-fuchsia-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-wide shrink-0">
            📚 BookMania
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
              Catálogo
            </Link>
            {isAuthenticated() && (
              <>
                <Link to="/my-loans" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Mis préstamos
                </Link>
                <Link to="/my-reservations" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Mis reservas
                </Link>
                <Link to="/my-fines" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Mis multas
                </Link>
              </>
            )}
            {isAdmin() && (
              <Link to="/admin" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Desktop usuario */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated() ? (
              <>
                <span className="text-sm text-gray-700">
                  Hola, <span className="font-semibold text-gray-900">{user?.name}</span>
                  {isAdmin() && (
                    <span className="ml-2 bg-fuchsia-900 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </span>
                <button onClick={handleLogout}
                  className="text-sm bg-white text-fuchsia-600 hover:bg-fuchsia-50 font-medium px-3 py-1.5 rounded-lg transition-colors">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Iniciar sesión
                </Link>
                <Link to="/register"
                  className="text-sm bg-fuchsia-900 text-white hover:bg-fuchsia-800 font-medium px-4 py-2 rounded-lg transition-colors">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Hamburger móvil */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-900 focus:outline-none">
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-fuchsia-300 border-t border-fuchsia-200 px-4 pb-4 space-y-1">
            <Link to="/" onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
              Catálogo
            </Link>
            {isAuthenticated() && (
              <>
                <Link to="/my-loans" onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Mis préstamos
                </Link>
                <Link to="/my-reservations" onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Mis reservas
                </Link>
                <Link to="/my-fines" onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Mis multas
                </Link>
              </>
            )}
            {isAdmin() && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                Admin
              </Link>
            )}
            <div className="pt-2 border-t border-fuchsia-200">
              {isAuthenticated() ? (
                <>
                  <p className="py-1 text-sm text-gray-700">
                    {user?.name}
                    {isAdmin() && (
                      <span className="ml-2 bg-fuchsia-900 text-white text-xs px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </p>
                  <button onClick={handleLogout}
                    className="block py-2 text-sm text-gray-900 font-medium hover:text-gray-700 transition-colors">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                    Iniciar sesión
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm text-gray-900 font-medium hover:text-gray-700 transition-colors">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;