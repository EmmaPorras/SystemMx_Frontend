export type EstadoTarifaIVA = "ACTIVA" | "INACTIVA";

export type TarifaIVA = {
  id: number;
  codigo: string;
  porcentaje: number;
  descripcion: string;
  estado: EstadoTarifaIVA;
};
