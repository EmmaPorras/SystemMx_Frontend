import { describe, expect, it } from "vitest";
import es from "./locales/es.json";
import en from "./locales/en.json";
import pt from "./locales/pt.json";

function getFlattenedKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const k in obj) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    const val = obj[k];
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      keys = keys.concat(getFlattenedKeys(val as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("Auditoría transversal de traducciones i18n", () => {
  const esKeys = getFlattenedKeys(es);
  const enKeys = new Set(getFlattenedKeys(en));
  const ptKeys = new Set(getFlattenedKeys(pt));

  it("todas las claves en español existen en inglés", () => {
    const missingInEn = esKeys.filter((k) => !enKeys.has(k));
    expect(missingInEn).toEqual([]);
  });

  it("todas las claves en español existen en portugués", () => {
    const missingInPt = esKeys.filter((k) => !ptKeys.has(k));
    expect(missingInPt).toEqual([]);
  });

  it("contiene la clave common.code para formularios y tablas", () => {
    expect(es.common.code).toBe("Código");
    expect(en.common.code).toBe("Code");
    expect(pt.common.code).toBe("Código");
  });

  it("contiene las claves requeridas para tarifas, ventas y pedidos", () => {
    expect(es.vatRates.title).toBe("Tarifas");
    expect(es.sales.selectFifo).toBe("Automático FIFO");
    expect(es.sales.selectManual).toBe("Seleccionar lote manualmente");
    expect(es.sales.vatRate).toBe("Tarifa");
    expect(es.sales.addToSale).toBe("Agregar a venta");
    expect(es.sales.updateProduct).toBe("Actualizar producto");
    expect(es.sales.processSale).toBe("Procesar venta");
    expect(es.orders.addOrder).toBe("Nuevo pedido");
    expect(es.orders.detailTitle).toBe("Detalle del pedido");
  });

  it("la regla de contraseñas refleja un mínimo de 8 caracteres", () => {
    expect(es.auth.passwordMinLength).toContain("8");
    expect(en.auth.passwordMinLength).toContain("8");
    expect(pt.auth.passwordMinLength).toContain("8");
  });
});
