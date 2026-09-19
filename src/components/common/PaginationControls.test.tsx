import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PaginationControls from "./PaginationControls";

describe("PaginationControls", () => {
  it("deshabilita botón anterior en la primera página", () => {
    render(
      <PaginationControls
        pagina={1}
        totalPaginas={5}
        total={50}
        limite={10}
        onPageChange={vi.fn()}
      />
    );

    const prevBtn = screen.getByRole("button", { name: /página anterior/i });
    const nextBtn = screen.getByRole("button", { name: /página siguiente/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();
    expect(screen.getByText("Página 1 de 5")).toBeInTheDocument();
  });

  it("deshabilita botón siguiente en la última página", () => {
    render(
      <PaginationControls
        pagina={5}
        totalPaginas={5}
        total={50}
        limite={10}
        onPageChange={vi.fn()}
      />
    );

    const prevBtn = screen.getByRole("button", { name: /página anterior/i });
    const nextBtn = screen.getByRole("button", { name: /página siguiente/i });

    expect(prevBtn).toBeEnabled();
    expect(nextBtn).toBeDisabled();
  });

  it("ejecuta onPageChange al hacer click en página siguiente o anterior", async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PaginationControls
        pagina={2}
        totalPaginas={4}
        total={40}
        limite={10}
        onPageChange={handlePageChange}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /página siguiente/i })
    );
    expect(handlePageChange).toHaveBeenCalledWith(3);

    await user.click(
      screen.getByRole("button", { name: /página anterior/i })
    );
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });
});
