import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// import LoginPage from "../pages/auth/LoginPage";
// import RegisterPage from "../pages/auth/RegisterPage";
// import BooksPage from "../pages/books/BooksPage";
// import BookDetailPage from "../pages/books/BookDetailPage";
// import MyLoansPage from "../pages/loans/MyLoansPage";
// import MyFinesPage from "../pages/fines/MyFinesPage";
// import MyReservationsPage from "../pages/reservations/MyReservationsPage";
// import AdminPage from "../pages/admin/AdminPage";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return isAdmin() ? children : <Navigate to="/" />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />

        {/* Privadas USER */}
        <Route path="/my-loans" element={<PrivateRoute><MyLoansPage /></PrivateRoute>} />
        <Route path="/my-fines" element={<PrivateRoute><MyFinesPage /></PrivateRoute>} />
        <Route path="/my-reservations" element={<PrivateRoute><MyReservationsPage /></PrivateRoute>} />

        {/* Privadas ADMIN */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;