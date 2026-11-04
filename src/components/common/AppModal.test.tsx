import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AppModal from "./AppModal";

describe("AppModal", () => {
  it("no se renderiza cuando isOpen es false", () => {
    render(
      <AppModal isOpen={false} title="Modal de prueba" onClose={vi.fn()}>
        <p>Contenido interno</p>
      </AppModal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Modal de prueba")).not.toBeInTheDocument();
  });

  it("renderiza role dialog, título y descripción cuando está abierto", () => {
    render(
      <AppModal
        isOpen={true}
        title="Modal de prueba"
        description="Descripción del modal"
        onClose={vi.fn()}
      >
        <p>Contenido interno</p>
      </AppModal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Modal de prueba")).toBeInTheDocument();
    expect(screen.getByText("Descripción del modal")).toBeInTheDocument();
    expect(screen.getByText("Contenido interno")).toBeInTheDocument();
  });

  it("ejecuta onClose al hacer clic en el botón de cerrar", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AppModal isOpen={true} title="Modal de prueba" onClose={handleClose}>
        <p>Contenido</p>
      </AppModal>,
    );

    const closeBtn = screen.getByRole("button", { name: /cerrar modal/i });
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("cierra el modal al presionar la tecla Escape", () => {
    const handleClose = vi.fn();

    render(
      <AppModal isOpen={true} title="Modal de prueba" onClose={handleClose}>
        <p>Contenido</p>
      </AppModal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("no permite cerrar con Escape mientras isSubmitting es true", () => {
    const handleClose = vi.fn();

    render(
      <AppModal
        isOpen={true}
        title="Modal de prueba"
        isSubmitting={true}
        onClose={handleClose}
      >
        <p>Contenido</p>
      </AppModal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("utiliza capa z-60 para superponerse correctamente sobre la jerarquía visual de la aplicación", () => {
    render(
      <AppModal isOpen={true} title="Modal de prueba" onClose={vi.fn()}>
        <p>Contenido</p>
      </AppModal>,
    );

    const presentationContainer = screen.getByRole("presentation");
    expect(presentationContainer.className).toContain("z-60");
  });
});
