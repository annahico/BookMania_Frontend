import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          BookMania
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Catálogo
          </Link>

          {isAuthenticated() && (
            <>
              <Link to="/my-loans" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Mis préstamos
              </Link>
              <Link to="/my-reservations" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Mis reservas
              </Link>
              <Link to="/my-fines" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Mis multas
              </Link>
            </>
          )}

          {isAdmin() && (
            <Link to="/admin" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Admin
            </Link>
          )}
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-4">
          {isAuthenticated() ? (
            <>
              <span className="text-sm text-gray-700">
                Hola, <span className="font-medium">{user?.name}</span>
                {isAdmin() && (
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;