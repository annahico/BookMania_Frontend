import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Layout from "../components/layout/Layout";
import ToastProvider from "../context/ToastProvider";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import BooksPage from "../pages/books/BooksPage";
import BookDetailPage from "../pages/books/BookDetailPage";
import MyLoansPage from "../pages/loans/MyLoansPage";
import MyFinesPage from "../pages/fines/MyFinesPage";
import MyReservationsPage from "../pages/reservations/MyReservationsPage";
import AdminPage from "../pages/admin/AdminPage";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin() ? children : <Navigate to="/" />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<Layout />}>
            <Route path="/" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/my-loans" element={<PrivateRoute><MyLoansPage /></PrivateRoute>} />
            <Route path="/my-fines" element={<PrivateRoute><MyFinesPage /></PrivateRoute>} />
            <Route path="/my-reservations" element={<PrivateRoute><MyReservationsPage /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default AppRouter;