import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renderiza mensaje y botones de confirmación y cancelación", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="¿Desea eliminar?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        cancelLabel="No, cancelar"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("¿Desea eliminar?")).toBeInTheDocument();
    expect(
      screen.getByText("Esta acción no se puede deshacer.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sí, eliminar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /no, cancelar/i })
    ).toBeInTheDocument();
  });

  it("ejecuta onConfirm y onCancel respectivamente", async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <ConfirmDialog
        isOpen={true}
        title="Confirmar acción"
        message="¿Continuar?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: /confirmar/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    rerender(
      <ConfirmDialog
        isOpen={true}
        title="Confirmar acción"
        message="¿Continuar?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("deshabilita los botones y muestra estado de procesamiento cuando isLoading es true", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Eliminando"
        message="Eliminando registro..."
        isLoading={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /procesando/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
  });
});
