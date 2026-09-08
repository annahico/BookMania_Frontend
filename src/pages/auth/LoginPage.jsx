import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import authService from "../../api/authService";
import useToast from "../../hooks/useToast";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // A 401 elsewhere in the app (expired/invalid token) sets this flag right
  // before redirecting here, so the reason for landing back on the login
  // screen isn't a silent mystery.
  useEffect(() => {
    if (sessionStorage.getItem("session_expired")) {
      sessionStorage.removeItem("session_expired");
      showToast("Tu sesión ha caducado. Inicia sesión de nuevo.", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(formData.email, formData.password);
      login({ email: data.email, role: data.role, name: data.name }, data.token);
      showToast(`¡Bienvenid@, ${data.name}!`, "success");
      const redirect = searchParams.get("redirect");
      navigate(redirect || "/", { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || "Email o contraseña incorrectos", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 border border-pink-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-700">📚 BookMania</h1>
          <p className="text-gray-500 mt-1">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="login-email" type="email" name="email" value={formData.email} onChange={handleChange} required
              autoComplete="email"
              placeholder="tu@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="login-password" type="password" name="password" value={formData.password} onChange={handleChange} required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-pink-300 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-pink-700 hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
