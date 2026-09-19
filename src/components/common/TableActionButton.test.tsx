import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TableActionButton from "./TableActionButton";

describe("TableActionButton", () => {
  it("renderiza botón con aria-label y title accesibles", () => {
    render(
      <TableActionButton
        icon={<span>Icon</span>}
        label="Editar registro"
        onClick={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: "Editar registro" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", "Editar registro");
  });

  it("ejecuta onClick al ser presionado", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <TableActionButton
        icon={<span>Icon</span>}
        label="Ver detalle"
        onClick={handleClick}
      />
    );

    await user.click(screen.getByRole("button", { name: "Ver detalle" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("no ejecuta onClick cuando disabled es true", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <TableActionButton
        icon={<span>Icon</span>}
        label="Eliminar"
        disabled={true}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole("button", { name: "Eliminar" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
