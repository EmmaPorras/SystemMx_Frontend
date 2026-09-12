import { Pencil, Trash2 } from "lucide-react";
import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import type { TarifaIVA } from "./tarifas-iva.types";

type TablaTarifasProps = {
  tarifas: TarifaIVA[];
  onEdit: (tarifa: TarifaIVA) => void;
  onDelete: (tarifa: TarifaIVA) => void;
};

function TablaTarifas({ tarifas, onEdit, onDelete }: TablaTarifasProps) {
  return (
    <DataTableShell
      data={tarifas}
      emptyMessage="Todavía no hay tarifas IVA registradas."
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "id",
          header: "ID",
          render: (row) => row.id,
          className: "font-semibold text-slate-500",
        },
        {
          key: "codigo",
          header: "Código",
          render: (row) => (
            <span className="font-semibold text-slate-900">{row.codigo}</span>
          ),
        },
        {
          key: "porcentaje",
          header: "Porcentaje",
          render: (row) => `${row.porcentaje}%`,
        },
        {
          key: "descripcion",
          header: "Descripción",
          render: (row) => row.descripcion,
          className: "max-w-xs",
        },
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
      actions={(row) => (
        <>
          <TableActionButton
            label="Editar tarifa"
            variant="edit"
            icon={<Pencil size={17} />}
            onClick={() => onEdit(row)}
          />

          {row.estado === "ACTIVA" ? (
            <TableActionButton
              label="Desactivar tarifa"
              variant="delete"
              icon={<Trash2 size={17} />}
              onClick={() => onDelete(row)}
            />
          ) : null}
        </>
      )}
    />
  );
}

export default TablaTarifas;