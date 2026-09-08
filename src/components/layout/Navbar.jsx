import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/bookmania_logo.png";

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
      <div className="h-14" />

      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-pink-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          <Link to="/" className="shrink-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pink-700">
            <img src={logo} alt="BookMania" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/" className="text-sm text-pink-50 hover:text-white transition-colors">
              Catálogo
            </Link>
            {isAuthenticated() && (
              <>
                <Link to="/my-loans" className="text-sm text-pink-50 hover:text-white transition-colors">
                  Mis préstamos
                </Link>
                <Link to="/my-reservations" className="text-sm text-pink-50 hover:text-white transition-colors">
                  Mis reservas
                </Link>
                <Link to="/my-fines" className="text-sm text-pink-50 hover:text-white transition-colors">
                  Mis multas
                </Link>
              </>
            )}
            {isAdmin() && (
              <Link to="/admin" className="text-sm text-pink-50 hover:text-white transition-colors">
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated() ? (
              <>
                <span className="text-sm text-pink-50">
                  Hola, <span className="font-semibold text-white">{user?.name}</span>
                  {isAdmin() && (
                    <span className="ml-2 bg-pink-900 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </span>
                <button onClick={handleLogout}
                  className="text-sm bg-white text-pink-700 hover:bg-pink-50 font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pink-700">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-pink-50 hover:text-white transition-colors">
                  Iniciar sesión
                </Link>
                <Link to="/register"
                  className="text-sm bg-pink-900 text-white hover:bg-pink-800 font-medium px-4 py-2 rounded-lg transition-colors">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="md:hidden text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pink-700 rounded">
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

        {menuOpen && (
          <div className="md:hidden bg-pink-300 border-t border-pink-200 px-4 pb-4 space-y-1">
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
            <div className="pt-2 border-t border-pink-200">
              {isAuthenticated() ? (
                <>
                  <p className="py-1 text-sm text-gray-700">
                    {user?.name}
                    {isAdmin() && (
                      <span className="ml-2 bg-pink-900 text-white text-xs px-2 py-0.5 rounded-full">Admin</span>
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