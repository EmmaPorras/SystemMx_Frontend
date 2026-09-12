import type {
  ConsultaAuditoria,
  ConsultaAuditoriaMovimientos,
} from "../reportes/reportes.types";

export type AuditoriaFiltros = {
  fechaDesde: string;
  fechaHasta: string;
  usuarioId: string;
  tipoMovimiento: string;
};

export const AUDITORIA_FILTROS_INICIALES:
  AuditoriaFiltros = {
  fechaDesde: "",
  fechaHasta: "",
  usuarioId: "",
  tipoMovimiento: "",
};

export function validarFiltrosAuditoria(
  filtros: AuditoriaFiltros,
): string | null {
  if (
    filtros.fechaDesde &&
    filtros.fechaHasta &&
    filtros.fechaDesde >
      filtros.fechaHasta
  ) {
    return "La fecha desde no puede ser posterior a la fecha hasta.";
  }

  if (filtros.usuarioId) {
    const usuarioId =
      Number(filtros.usuarioId);

    if (
      !Number.isInteger(usuarioId) ||
      usuarioId <= 0
    ) {
      return "El ID de usuario debe ser un entero positivo.";
    }
  }

  return null;
}

export function crearConsultaAuditoria(
  filtros: AuditoriaFiltros,
): ConsultaAuditoria {
  const query: ConsultaAuditoria = {};

  if (filtros.fechaDesde) {
    query.fechaDesde =
      filtros.fechaDesde;
  }

  if (filtros.fechaHasta) {
    query.fechaHasta =
      filtros.fechaHasta;
  }

  if (filtros.usuarioId) {
    query.usuarioId =
      Number(filtros.usuarioId);
  }

  return query;
}

export function crearConsultaMovimientosAuditoria(
  filtros: AuditoriaFiltros,
): ConsultaAuditoriaMovimientos {
  const query:
    ConsultaAuditoriaMovimientos = {
      ...crearConsultaAuditoria(
        filtros,
      ),
    };

  if (filtros.tipoMovimiento) {
    query.tipoMovimiento =
      filtros.tipoMovimiento as
        | "ENTRADA_COMPRA"
        | "SALIDA_VENTA"
        | "REINGRESO_ANULACION_VENTA";
  }

  return query;
}
