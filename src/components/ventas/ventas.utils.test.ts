import {
  describe,
  expect,
  it,
} from "vitest";

import {
  puedeAnularVenta,
  puedeEnviarPapelera,
  puedeRegistrarPago,
  puedeRestaurarVenta,
} from "./ventas.utils";

import type { Venta } from "./ventas.types";

function crearVentaMock(overrides: Partial<Venta> = {}): Venta {
  return {
    id: 1,
    numeroVenta: "1",
    fechaVenta: "2026-09-11",
    clienteNombre: "Cliente Test",
    medioPago: "EFECTIVO",
    estadoPago: "PARCIAL",
    estadoVenta: "REGISTRADA",
    subtotal: 10000,
    descuentoTotal: 0,
    ivaTotal: 1300,
    totalVenta: 11300,
    montoPagado: 5000,
    saldoPendiente: 6300,
    costoTotal: 4000,
    gananciaBruta: 6000,
    margenBruto: 60,
    fechaEntrega: null,
    fechaVencimientoPago: null,
    observaciones: "",
    enPapelera: false,
    detalles: [],
    ...overrides,
  };
}

describe("ventas.utils", () => {
  it("permite registrar pago solo en ventas registradas activas con saldo pendiente", () => {
    const ventaConSaldo = crearVentaMock({ saldoPendiente: 5000 });
    expect(puedeRegistrarPago(ventaConSaldo)).toBe(true);

    const ventaPagada = crearVentaMock({ saldoPendiente: 0, estadoPago: "PAGADA" });
    expect(puedeRegistrarPago(ventaPagada)).toBe(false);

    const ventaEnPapelera = crearVentaMock({ enPapelera: true });
    expect(puedeRegistrarPago(ventaEnPapelera)).toBe(false);

    const ventaAnulada = crearVentaMock({ estadoVenta: "ANULADA" });
    expect(puedeRegistrarPago(ventaAnulada)).toBe(false);
  });

  it("permite enviar a papelera solo ventas registradas que no estén ya en papelera", () => {
    const ventaActiva = crearVentaMock({ enPapelera: false });
    expect(puedeEnviarPapelera(ventaActiva)).toBe(true);

    const ventaEnPapelera = crearVentaMock({ enPapelera: true });
    expect(puedeEnviarPapelera(ventaEnPapelera)).toBe(false);

    const ventaAnulada = crearVentaMock({ estadoVenta: "ANULADA" });
    expect(puedeEnviarPapelera(ventaAnulada)).toBe(false);
  });

  it("permite restaurar solo ventas registradas que estén en papelera", () => {
    const ventaEnPapelera = crearVentaMock({ enPapelera: true });
    expect(puedeRestaurarVenta(ventaEnPapelera)).toBe(true);

    const ventaActiva = crearVentaMock({ enPapelera: false });
    expect(puedeRestaurarVenta(ventaActiva)).toBe(false);
  });

  it("permite anular solo ventas registradas que no estén en papelera", () => {
    const ventaActiva = crearVentaMock({ estadoVenta: "REGISTRADA", enPapelera: false });
    expect(puedeAnularVenta(ventaActiva)).toBe(true);

    const ventaEnPapelera = crearVentaMock({ enPapelera: true });
    expect(puedeAnularVenta(ventaEnPapelera)).toBe(false);

    const ventaYaAnulada = crearVentaMock({ estadoVenta: "ANULADA" });
    expect(puedeAnularVenta(ventaYaAnulada)).toBe(false);
  });
});
