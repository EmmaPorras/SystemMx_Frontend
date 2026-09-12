import type { Venta } from "./ventas.types";

export function puedeRegistrarPago(
  venta: Venta,
): boolean {
  return (
    venta.estadoVenta ===
      "REGISTRADA" &&
    !venta.enPapelera &&
    venta.saldoPendiente > 0
  );
}

export function puedeEnviarPapelera(
  venta: Venta,
): boolean {
  return (
    venta.estadoVenta ===
      "REGISTRADA" &&
    !venta.enPapelera
  );
}

export function puedeRestaurarVenta(
  venta: Venta,
): boolean {
  return (
    venta.estadoVenta ===
      "REGISTRADA" &&
    venta.enPapelera
  );
}

export function puedeAnularVenta(
  venta: Venta,
): boolean {
  return (
    venta.estadoVenta ===
      "REGISTRADA" &&
    !venta.enPapelera
  );
}
