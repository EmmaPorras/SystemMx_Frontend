import {
  FaEye,
  FaRegEdit,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";

import {
  getMonedaPreferidaCorta,
  type Proveedor,
} from "./proveedores.types";

type TablaProveedoresProps = {
  proveedores: Proveedor[];
  onView: (
    proveedor: Proveedor,
  ) => void;
  onEdit: (
    proveedor: Proveedor,
  ) => void;
  onDelete: (
    proveedor: Proveedor,
  ) => void;
};

function TablaProveedores({
  proveedores,
  onView,
  onEdit,
  onDelete,
}: TablaProveedoresProps) {
  return (
    <DataTableShell
      data={proveedores}
      emptyMessage="No hay proveedores que coincidan con los filtros seleccionados."
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "id",
          header: "ID",
          render: (row) => row.id,
          className:
            "font-semibold text-zinc-500",
        },
        {
          key: "nombre",
          header: "Nombre",
          render: (row) => (
            <span className="font-semibold text-zinc-950">
              {row.nombre}
            </span>
          ),
        },
        {
          key: "telefono",
          header: "Teléfono",
          render: (row) =>
            row.telefono,
        },
        {
          key: "correo",
          header: "Correo",
          render: (row) =>
            row.correo,
        },
        {
          key: "pais",
          header: "País",
          render: (row) =>
            row.pais ||
            "Sin registrar",
          className:
            "whitespace-nowrap",
        },
        {
          key: "monedaPreferida",
          header: "Mon/Pref.",
          render: (row) => (
            <span
              className="
                inline-flex
                rounded-full
                border
                border-zinc-200
                bg-zinc-100
                px-3
                py-1
                text-xs
                font-bold
                text-zinc-950
                shadow-sm
              "
            >
              {getMonedaPreferidaCorta(
                row.monedaPreferida,
              )}
            </span>
          ),
        },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={row.estado}
              variant={
                row.estado === "ACTIVO"
                  ? "success"
                  : "warning"
              }
            />
          ),
        },
      ]}
      actionsHeader="Acciones"
      actions={(row) => (
        <>
          <TableActionButton
            label="Ver detalle del proveedor"
            variant="view"
            icon={
              <FaEye className="h-4 w-4" />
            }
            onClick={() =>
              onView(row)
            }
          />

          <TableActionButton
            label="Editar proveedor"
            variant="edit"
            icon={
              <FaRegEdit className="h-4 w-4" />
            }
            onClick={() =>
              onEdit(row)
            }
          />

          {row.estado === "ACTIVO" ? (
            <TableActionButton
              label="Desactivar proveedor"
              variant="delete"
              icon={
                <MdDelete className="h-5 w-5" />
              }
              onClick={() =>
                onDelete(row)
              }
            />
          ) : null}
        </>
      )}
    />
  );
}

export default TablaProveedores;