import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import type { TarifaIVA } from "./tarifas-iva.types";

type TablaTarifasProps = {
  tarifas: TarifaIVA[];
};

function TablaTarifas({ tarifas }: TablaTarifasProps) {
  return (
    <DataTableShell
      data={tarifas}
      emptyMessage="Todavía no hay tarifas IVA registradas."
      columns={[
        { key: "id", header: "ID", render: (row) => row.id },
        { key: "codigo", header: "Código", render: (row) => row.codigo },
        { key: "porcentaje", header: "Porcentaje", render: (row) => `${row.porcentaje}%` },
        { key: "descripcion", header: "Descripción", render: (row) => row.descripcion },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={row.estado}
              variant={row.estado === "ACTIVA" ? "success" : "warning"}
            />
          ),
        },
      ]}
    />
  );
}

export default TablaTarifas;
