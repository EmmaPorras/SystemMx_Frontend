export type EstadoProveedor = "ACTIVO" | "INACTIVO";

export type MonedaPreferida = "CRC" | "USD" | "EUR" | "COP" | "BRL";

export const monedasPermitidas: MonedaPreferida[] = [
  "CRC",
  "USD",
  "EUR",
  "COP",
  "BRL",
];

export const monedaPreferidaOptions: {
  value: MonedaPreferida;
  label: string;
}[] = [
  {
    value: "CRC",
    label: "₡ CRC - Colones",
  },
  {
    value: "USD",
    label: "$ USD - Dólares",
  },
  {
    value: "EUR",
    label: "€ EUR - Euros",
  },
  {
    value: "COP",
    label: "COP - Pesos colombianos",
  },
  {
    value: "BRL",
    label: "R$ BRL - Reales brasileños",
  },
];

export function getMonedaPreferidaLabel(moneda: MonedaPreferida) {
  const opcion = monedaPreferidaOptions.find((item) => item.value === moneda);

  return opcion?.label ?? moneda;
}

export function getMonedaPreferidaCorta(moneda: MonedaPreferida) {
  const labels: Record<MonedaPreferida, string> = {
    CRC: "₡ CRC",
    USD: "$ USD",
    EUR: "€ EUR",
    COP: "COP",
    BRL: "R$ BRL",
  };

  return labels[moneda];
}

export type Proveedor = {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  pais: string;
  direccion: string;
  monedaPreferida: MonedaPreferida;
  estado: EstadoProveedor;
};

export type ProveedorFormField = keyof Omit<Proveedor, "id">;

export type ProveedorFormErrors = Partial<Record<ProveedorFormField, string>>;
