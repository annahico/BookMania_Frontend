/* eslint-disable no-undef */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AccountPage from "../pages/account/AccountPage";
import AuthProvider from "../context/AuthProvider";
import ToastProvider from "../context/ToastProvider";
import userService from "../api/userService";

vi.mock("../api/userService");

const renderAccountPage = () => {
  localStorage.setItem("token", "fake-token");
  localStorage.setItem("user", JSON.stringify({ name: "Anna", email: "anna@test.com", role: "USER" }));

  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          <AccountPage />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
};

const fillAndSubmit = async (user, { current, next, confirm }) => {
  await user.type(screen.getByLabelText("Contraseña actual"), current);
  await user.type(screen.getByLabelText("Nueva contraseña"), next);
  await user.type(screen.getByLabelText("Confirmar nueva contraseña"), confirm);
  await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
};

describe("AccountPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("cambia la contraseña correctamente y limpia el formulario", async () => {
    const user = userEvent.setup();
    userService.changePassword.mockResolvedValue();

    renderAccountPage();
    await fillAndSubmit(user, { current: "oldPass", next: "newPass1", confirm: "newPass1" });

    await waitFor(() => {
      expect(userService.changePassword).toHaveBeenCalledWith("oldPass", "newPass1");
    });
    expect(screen.getByText("Contraseña actualizada correctamente.")).toBeInTheDocument();
    expect(screen.getByLabelText("Nueva contraseña")).toHaveValue("");
  });

  test("avisa si la confirmación no coincide y no llama a la API", async () => {
    const user = userEvent.setup();

    renderAccountPage();
    await fillAndSubmit(user, { current: "oldPass", next: "newPass1", confirm: "otraCosa" });

    expect(screen.getByText("Las contraseñas nuevas no coinciden.")).toBeInTheDocument();
    expect(userService.changePassword).not.toHaveBeenCalled();
  });

  test("muestra el mensaje de error que devuelve el backend", async () => {
    const user = userEvent.setup();
    userService.changePassword.mockRejectedValue({
      response: { data: { message: "La contraseña actual no es correcta" } },
    });

    renderAccountPage();
    await fillAndSubmit(user, { current: "wrong", next: "newPass1", confirm: "newPass1" });

    await waitFor(() => {
      expect(screen.getByText("La contraseña actual no es correcta")).toBeInTheDocument();
    });
  });
});
