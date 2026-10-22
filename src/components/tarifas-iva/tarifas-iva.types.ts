export type EstadoTarifaIVA = "ACTIVA" | "INACTIVA";

export type TarifaIVA = {
  id: number;
  codigo: string;
  porcentaje: number;
  descripcion: string;
  estado: EstadoTarifaIVA;
};

export type TarifaIVAFormState = {
  id: number;
  codigo: string;
  porcentaje: string;
  descripcion: string;
  estado: EstadoTarifaIVA;
};

export type TarifaIVAFormField = keyof Omit<TarifaIVAFormState, "id">;

export type TarifaIVAFormErrors = Partial<Record<TarifaIVAFormField, string>>;