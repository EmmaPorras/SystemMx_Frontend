import {
  FaEye,
  FaRegEdit,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useTranslation } from "react-i18next";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import { getCatalogStatusLabel } from "../../i18n/statusMap";

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
  const { t } = useTranslation();

  return (
    <DataTableShell
      data={proveedores}
      emptyMessage={t("suppliers.emptyTitle")}
      emptyDescription={t("suppliers.emptyDesc")}
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
          header: t("common.name"),
          render: (row) => (
            <span className="font-semibold text-zinc-950">
              {row.nombre}
            </span>
          ),
        },
        {
          key: "telefono",
          header: t("suppliers.phone"),
          render: (row) =>
            row.telefono,
        },
        {
          key: "correo",
          header: t("suppliers.email"),
          render: (row) =>
            row.correo,
        },
        {
          key: "pais",
          header: t("suppliers.country"),
          render: (row) =>
            row.pais || "—",
          className:
            "whitespace-nowrap",
        },
        {
          key: "monedaPreferida",
          header: t("suppliers.currency"),
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
          header: t("common.status"),
          render: (row) => (
            <StatusBadge
              label={getCatalogStatusLabel(t, row.estado)}
              variant={
                row.estado === "ACTIVO"
                  ? "success"
                  : "warning"
              }
            />
          ),
        },
      ]}
      actionsHeader={t("dataTable.actions")}
      actions={(row) => (
        <>
          <TableActionButton
            label={t("suppliers.details")}
            variant="view"
            icon={
              <FaEye className="h-4 w-4" />
            }
            onClick={() =>
              onView(row)
            }
          />

          <TableActionButton
            label={t("suppliers.editSupplier")}
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
              label={t("common.delete")}
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