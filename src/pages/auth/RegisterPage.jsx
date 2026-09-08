import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import authService from "../../api/authService";
import useAuth from "../../hooks/useAuth";
import useToast from "../../hooks/useToast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(formData.name, formData.email, formData.password);

      const data = await authService.login(formData.email, formData.password);
      login({ email: data.email, role: data.role, name: data.name }, data.token);

      showToast(`¡Bienvenid@, ${data.name}! Cuenta creada correctamente.`, "success");
      const redirect = searchParams.get("redirect");
      navigate(redirect || "/", { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || "Error al registrarse.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 border border-pink-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-700">📚 BookMania</h1>
          <p className="text-gray-500 mt-1">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="register-name" type="text" name="name" value={formData.name} onChange={handleChange} required
              autoComplete="name"
              placeholder="Tu nombre"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="register-email" type="email" name="email" value={formData.email} onChange={handleChange} required
              autoComplete="email"
              placeholder="tu@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="register-password" type="password" name="password" value={formData.password} onChange={handleChange} required
              autoComplete="new-password"
              placeholder="••••••••" minLength={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-pink-300 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-pink-700 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
