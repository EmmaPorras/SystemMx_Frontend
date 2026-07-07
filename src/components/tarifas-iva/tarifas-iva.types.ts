export type EstadoTarifaIVA = "ACTIVA" | "INACTIVA";

export type TarifaIVA = {
  id: number;
  codigo: string;
  porcentaje: number;
  descripcion: string;
  estado: EstadoTarifaIVA;
};

export type TarifaIVAFormField = keyof Omit<TarifaIVA, "id">;

export type TarifaIVAFormErrors = Partial<Record<TarifaIVAFormField, string>>;