import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormularioVenta from "./FormularioVenta";
import type { InventarioDisponibleVenta } from "./ventas.types";
import type { TarifaIVA } from "../tarifas-iva/tarifas-iva.types";

const mockInventario: InventarioDisponibleVenta[] = [
  {
    loteId: 101,
    productoId: 1,
    productoNombre: "Cable UTP Cat 6",
    loteCodigo: "LOT-001",
    pedidoId: 10,
    numeroPedido: "PED-10",
    proveedorNombre: "Tech Supplies",
    cantidadDisponible: 50,
    costoUnitarioReal: 10000,
    precioVentaRecomendado: 20000,
    estadoLote: "DISPONIBLE",
  },
];

const mockTarifas: TarifaIVA[] = [
  { id: 1, codigo: "EXENTO", porcentaje: 0, descripcion: "Exento 0%", estado: "ACTIVA" },
  { id: 2, codigo: "IVA13", porcentaje: 13, descripcion: "General 13%", estado: "ACTIVA" },
  { id: 3, codigo: "IVA5", porcentaje: 5, descripcion: "Reducido 5%", estado: "ACTIVA" },
  { id: 4, codigo: "INACTIVA_TEST", porcentaje: 8, descripcion: "Inactiva 8%", estado: "INACTIVA" },
];

describe("FormularioVenta - Tarifas Dinámicas y MoneyInputField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra las tarifas activas en el selector y no muestra las inactivas", async () => {
    render(
      <FormularioVenta
        inventarioDisponible={mockInventario}
        numeroVentaSugerido="0001"
        tarifasIva={mockTarifas}
        guardando={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    // Check that active rates appear in the select options
    expect(screen.getByText(/IVA5/)).toBeInTheDocument();
    expect(screen.getByText(/IVA13/)).toBeInTheDocument();
    expect(screen.getByText(/EXENTO/)).toBeInTheDocument();
    expect(screen.queryByText(/INACTIVA_TEST/)).not.toBeInTheDocument();
  });

  it("calcula exactamente 5% de IVA y envía idTarifaIva al seleccionar tarifa activa de 5%", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <FormularioVenta
        inventarioDisponible={mockInventario}
        numeroVentaSugerido="0001"
        tarifasIva={mockTarifas}
        guardando={false}
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />,
    );

    // 1. Select product
    const selectProducto = screen.getByLabelText(/Producto/i);
    await user.selectOptions(selectProducto, "1");

    // 2. Select 5% tax rate (ID: "3")
    const selectTarifa = screen.getByLabelText(/Tarifa/i);
    await user.selectOptions(selectTarifa, "3");

    // 3. Click add to sale (+ Agregar a venta)
    const btnAgregar = screen.getByRole("button", { name: /\+.*Agregar a venta/i });
    await user.click(btnAgregar);

    // 4. Verify added line displays 5% IVA and calculated total:
    // Subtotal: 20 000, 5% IVA = 1 000, Total: 21 000
    await waitFor(() => {
      expect(screen.getByText("Cable UTP Cat 6")).toBeInTheDocument();
      expect(screen.getByText("ESPECIAL (5%)")).toBeInTheDocument();
    });

    // 5. Click Next (Siguiente) to go to step 2
    const btnSiguiente = screen.getByRole("button", { name: /Siguiente/i });
    await user.click(btnSiguiente);

    // 6. Complete General data: Customer name and full payment
    const inputCliente = screen.getByLabelText(/Cliente/i);
    await user.type(inputCliente, "Cliente Prueba 5%");

    // Enter paid amount 21000
    const inputMonto = screen.getByLabelText(/Pagado/i);
    await user.clear(inputMonto);
    await user.type(inputMonto, "21000");

    // 7. Click Process Sale (Procesar venta)
    const btnProcesar = screen.getByRole("button", { name: /Procesar venta/i });
    await user.click(btnProcesar);

    // 8. Verify submitted payload
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const payload = handleSubmit.mock.calls[0][0];
    expect(payload.clienteNombre).toBe("Cliente Prueba 5%");
    expect(payload.detalles).toHaveLength(1);
    expect(payload.detalles[0].productoId).toBe(1);
    expect(payload.detalles[0].precioUnitario).toBe(20000);
    expect(payload.detalles[0].idTarifaIva).toBe(3);
    expect(payload.detalles[0].porcentajeIva).toBe(5);
  });
});
