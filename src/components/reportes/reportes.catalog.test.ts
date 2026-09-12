import {
  describe,
  expect,
  it,
} from "vitest";

import {
  reportesCatalog,
} from "./reportes.catalog";

describe("catálogo de reportes", () => {
  it("contiene exactamente los 28 reportes del backend", () => {
    expect(
      reportesCatalog,
    ).toHaveLength(28);
  });

  it("no contiene ids duplicados", () => {
    const ids =
      reportesCatalog.map(
        (report) => report.id,
      );

    expect(
      new Set(ids).size,
    ).toBe(ids.length);
  });

  it("incluye las siete familias funcionales", () => {
    const familias =
      new Set(
        reportesCatalog.map(
          (report) =>
            report.family,
        ),
      );

    expect(familias).toEqual(
      new Set([
        "resumen",
        "ventas",
        "inventario",
        "compras",
        "pagos",
        "cuentas",
        "auditoria",
      ]),
    );
  });
});
