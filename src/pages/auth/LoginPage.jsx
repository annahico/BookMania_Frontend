import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import authService from "../../api/authService";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await authService.login(formData.email, formData.password);
      login({ email: data.email, role: data.role, name: data.name }, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 border border-fuchsia-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-fuchsia-600">📚 BookMania</h1>
          <p className="text-gray-500 mt-1">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required
              placeholder="tu@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-fuchsia-300 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-fuchsia-500 hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;