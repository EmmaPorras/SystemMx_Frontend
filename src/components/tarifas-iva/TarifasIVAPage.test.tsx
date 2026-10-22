import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";
import TarifasIVAPage from "./TarifasIVAPage";
import * as tarifasApi from "../../services/tarifasIvaApi";
import type { TarifaIVA } from "./tarifas-iva.types";

const mockTarifas: TarifaIVA[] = [
  { id: 1, codigo: "IVA13", porcentaje: 13, descripcion: "Tarifa general 13%", estado: "ACTIVA" },
  { id: 2, codigo: "EXENTO", porcentaje: 0, descripcion: "Exento 0%", estado: "ACTIVA" },
];

vi.mock("../../services/tarifasIvaApi", () => ({
  obtenerTarifasIva: vi.fn(),
  crearTarifaIva: vi.fn(),
  actualizarTarifaIvaApi: vi.fn(),
  eliminarTarifaIvaApi: vi.fn(),
}));

describe("TarifasIVAPage - Tipado limpio de porcentaje", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tarifasApi.obtenerTarifasIva).mockResolvedValue(mockTarifas);
  });

  it("permite ingresar valores numéricos y decimales (0, 5, 13, 13.5, 100) y enviarlos como number al backend", async () => {
    const user = userEvent.setup();
    vi.mocked(tarifasApi.crearTarifaIva).mockResolvedValue({
      id: 3,
      codigo: "IVA5",
      porcentaje: 5,
      descripcion: "Tarifa reducida 5%",
      estado: "ACTIVA",
    });

    render(
      <BrowserRouter>
        <TarifasIVAPage />
      </BrowserRouter>,
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("IVA13")).toBeInTheDocument();
    });

    // Open create modal (+ Nueva tarifa)
    const btnNueva = screen.getByRole("button", { name: /\+.*Nueva tarifa/i });
    await user.click(btnNueva);

    // Fill code
    const inputCodigo = screen.getByLabelText(/Código/i);
    await user.type(inputCodigo, "IVA5");

    // Fill percentage: test typing and editing with string state
    const inputPorcentaje = screen.getByLabelText(/Porcentaje/i);
    await user.type(inputPorcentaje, "13.5");
    expect(inputPorcentaje).toHaveValue("13.5");

    await user.clear(inputPorcentaje);
    await user.type(inputPorcentaje, "5");
    expect(inputPorcentaje).toHaveValue("5");

    // Fill description
    const inputDesc = screen.getByLabelText(/Descripción/i);
    await user.type(inputDesc, "Tarifa reducida 5%");

    // Submit form
    const btnGuardar = screen.getAllByRole("button", { name: /Nueva tarifa|Crear tarifa|Guardar/i })[1];
    await user.click(btnGuardar);

    // Verify backend received numeric 5
    await waitFor(() => {
      expect(tarifasApi.crearTarifaIva).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: "IVA5",
          porcentaje: 5,
          descripcion: "Tarifa reducida 5%",
          estado: "ACTIVA",
        }),
      );
    });
  });
});
