/* eslint-disable no-undef */
import { render, screen, act } from "@testing-library/react";
import { AuthContext } from "../context/AuthContext";
import AuthProvider from "../context/AuthProvider";
import useAuth from "../hooks/useAuth";

// Componente auxiliar para exponer el hook
const TestComponent = () => {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.name : "null"}</span>
      <span data-testid="isAuthenticated">{isAuthenticated() ? "true" : "false"}</span>
      <span data-testid="isAdmin">{isAdmin() ? "true" : "false"}</span>
      <button onClick={() => login({ name: "Anna", email: "anna@test.com", role: "ADMIN" }, "fake-token")}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuth = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe("useAuth", () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test("estado inicial — usuario no autenticado", () => {
    renderWithAuth();
    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(screen.getByTestId("isAdmin").textContent).toBe("false");
  });

  test("login — guarda usuario y token en localStorage", () => {
    renderWithAuth();

    act(() => {
      screen.getByText("Login").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("Anna");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(localStorage.getItem("token")).toBe("fake-token");
    expect(JSON.parse(localStorage.getItem("user")).name).toBe("Anna");
  });

  test("isAdmin — devuelve true si el rol es ADMIN", () => {
    renderWithAuth();

    act(() => {
      screen.getByText("Login").click();
    });

    expect(screen.getByTestId("isAdmin").textContent).toBe("true");
  });

  test("logout — limpia usuario y localStorage", () => {
    renderWithAuth();

    act(() => {
      screen.getByText("Login").click();
    });

    act(() => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  test("usuario USER — isAdmin devuelve false", () => {
    const TestUser = () => {
      const { isAdmin, login } = useAuth();
      return (
        <div>
          <span data-testid="isAdmin">{isAdmin() ? "true" : "false"}</span>
          <button onClick={() => login({ name: "Harry", email: "harry@test.com", role: "USER" }, "token-user")}>
            Login User
          </button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestUser />
      </AuthProvider>
    );

    act(() => {
      screen.getByText("Login User").click();
    });

    expect(screen.getByTestId("isAdmin").textContent).toBe("false");
  });
});