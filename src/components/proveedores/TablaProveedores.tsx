import { Pencil, Trash2 } from "lucide-react";
import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import {
  getMonedaPreferidaCorta,
  type Proveedor,
} from "./proveedores.types";

type TablaProveedoresProps = {
  proveedores: Proveedor[];
  onEdit: (proveedor: Proveedor) => void;
  onDelete: (proveedor: Proveedor) => void;
};

function TablaProveedores({
  proveedores,
  onEdit,
  onDelete,
}: TablaProveedoresProps) {
  return (
    <DataTableShell
      data={proveedores}
      emptyMessage="Todavía no hay proveedores cargados."
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "id",
          header: "ID",
          render: (row) => row.id,
          className: "font-semibold text-slate-500",
        },
        {
          key: "nombre",
          header: "Nombre",
          render: (row) => (
            <span className="font-semibold text-slate-900">{row.nombre}</span>
          ),
        },
        {
          key: "telefono",
          header: "Teléfono",
          render: (row) => row.telefono,
        },
        {
          key: "correo",
          header: "Correo",
          render: (row) => row.correo,
        },
        {
          key: "direccion",
          header: "Dirección",
          render: (row) => row.direccion,
          className: "max-w-xs",
        },
        {
          key: "monedaPreferida",
          header: "Mon/Pref.",
          render: (row) => (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {getMonedaPreferidaCorta(row.monedaPreferida)}
            </span>
          ),
        },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={row.estado}
              variant={row.estado === "ACTIVO" ? "success" : "warning"}
            />
          ),
        },
      ]}
      actions={(row) => (
        <>
          <TableActionButton
            label="Editar proveedor"
            variant="edit"
            icon={<Pencil size={17} />}
            onClick={() => onEdit(row)}
          />

          <TableActionButton
            label="Eliminar proveedor"
            variant="delete"
            icon={<Trash2 size={17} />}
            onClick={() => onDelete(row)}
          />
        </>
      )}
    />
  );
}

export default TablaProveedores;