import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center text-center py-20">
    <p className="text-6xl mb-2" aria-hidden="true">📚</p>
    <h1 className="text-2xl font-bold text-pink-700 mb-2">Página no encontrada</h1>
    <p className="text-gray-500 mb-8 max-w-sm">
      La página que buscas no existe o se ha movido a otro sitio.
    </p>
    <Link to="/"
      className="bg-pink-700 hover:bg-pink-800 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2">
      Volver al catálogo
    </Link>
  </div>
);

export default NotFoundPage;
