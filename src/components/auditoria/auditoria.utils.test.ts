import {
  describe,
  expect,
  it,
} from "vitest";

import {
  AUDITORIA_FILTROS_INICIALES,
  crearConsultaAuditoria,
  crearConsultaMovimientosAuditoria,
  validarFiltrosAuditoria,
} from "./auditoria.utils";

describe("auditoria utils", () => {
  it("acepta filtros vacíos", () => {
    expect(
      validarFiltrosAuditoria(
        AUDITORIA_FILTROS_INICIALES,
      ),
    ).toBeNull();
  });

  it("rechaza rango de fechas invertido", () => {
    expect(
      validarFiltrosAuditoria({
        ...AUDITORIA_FILTROS_INICIALES,
        fechaDesde:
          "2026-09-11",
        fechaHasta:
          "2026-09-01",
      }),
    ).toMatch(
      /fecha desde/i,
    );
  });

  it("rechaza ids de usuario inválidos", () => {
    expect(
      validarFiltrosAuditoria({
        ...AUDITORIA_FILTROS_INICIALES,
        usuarioId: "0",
      }),
    ).toMatch(
      /usuario/i,
    );
  });

  it("omite filtros vacíos del query", () => {
    expect(
      crearConsultaAuditoria(
        AUDITORIA_FILTROS_INICIALES,
      ),
    ).toEqual({});
  });

  it("construye filtros de auditoría", () => {
    expect(
      crearConsultaAuditoria({
        ...AUDITORIA_FILTROS_INICIALES,

        fechaDesde:
          "2026-09-01",

        fechaHasta:
          "2026-09-11",

        usuarioId: "1",
      }),
    ).toEqual({
      fechaDesde:
        "2026-09-01",

      fechaHasta:
        "2026-09-11",

      usuarioId: 1,
    });
  });

  it("incluye tipo de movimiento cuando corresponde", () => {
    expect(
      crearConsultaMovimientosAuditoria({
        ...AUDITORIA_FILTROS_INICIALES,

        usuarioId: "1",

        tipoMovimiento:
          "SALIDA_VENTA",
      }),
    ).toEqual({
      usuarioId: 1,

      tipoMovimiento:
        "SALIDA_VENTA",
    });
  });
});
