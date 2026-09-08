/* eslint-disable no-undef */
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { PrivateRoute, AdminRoute } from "../routes/AppRouter";
import AuthProvider from "../context/AuthProvider";
import ToastProvider from "../context/ToastProvider";

const LocationProbe = () => {
  const location = useLocation();
  return <p>ruta: {location.pathname}{location.search}</p>;
};

describe("PrivateRoute", () => {
  beforeEach(() => localStorage.clear());

  test("sin sesión, redirige a /login preservando la ruta pedida", () => {
    render(
      <MemoryRouter initialEntries={["/my-loans"]}>
        <AuthProvider>
          <Routes>
            <Route path="/my-loans" element={<PrivateRoute><p>Mis préstamos</p></PrivateRoute>} />
            <Route path="/login" element={<LocationProbe />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("ruta: /login?redirect=%2Fmy-loans")).toBeInTheDocument();
  });

  test("con sesión, renderiza la ruta protegida", () => {
    localStorage.setItem("token", "fake-token");
    render(
      <MemoryRouter initialEntries={["/my-loans"]}>
        <AuthProvider>
          <Routes>
            <Route path="/my-loans" element={<PrivateRoute><p>Mis préstamos</p></PrivateRoute>} />
            <Route path="/login" element={<LocationProbe />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Mis préstamos")).toBeInTheDocument();
  });
});

describe("AdminRoute", () => {
  beforeEach(() => localStorage.clear());

  test("sin permisos de admin, avisa y redirige al catálogo", () => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify({ name: "Harry", role: "USER" }));

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/admin" element={<AdminRoute><p>Panel admin</p></AdminRoute>} />
              <Route path="/" element={<p>Catálogo</p>} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Catálogo")).toBeInTheDocument();
    expect(screen.getByText("No tienes permisos de administrador")).toBeInTheDocument();
  });

  test("con permisos de admin, renderiza el panel", () => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify({ name: "Anna", role: "ADMIN" }));

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/admin" element={<AdminRoute><p>Panel admin</p></AdminRoute>} />
              <Route path="/" element={<p>Catálogo</p>} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Panel admin")).toBeInTheDocument();
  });
});
