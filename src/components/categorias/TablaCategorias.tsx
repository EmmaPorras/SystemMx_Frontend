import {
  Pencil,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import { getCatalogStatusLabel } from "../../i18n/statusMap";

import type { Categoria } from "./categorias.types";

type TablaCategoriasProps = {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDeactivate: (categoria: Categoria) => void;
};

function TablaCategorias({
  categorias,
  onEdit,
  onDeactivate,
}: TablaCategoriasProps) {
  const { t } = useTranslation();

  return (
    <DataTableShell
      data={categorias}
      emptyMessage={t("categories.emptyTitle")}
      emptyDescription={t("categories.emptyDesc")}
      getRowKey={(row) => row.idCategoria}
      columns={[
        {
          key: "nombre",
          header: t("common.name"),
          render: (row) => row.nombre,
        },
        {
          key: "descripcion",
          header: t("common.description"),
          render: (row) =>
            row.descripcion?.trim() || "—",
        },
        {
          key: "estado",
          header: t("common.status"),
          render: (row) => (
            <StatusBadge
              label={getCatalogStatusLabel(t, row.activo)}
              variant={
                row.activo
                  ? "success"
                  : "neutral"
              }
            />
          ),
        },
      ]}
      actions={(row) => (
        <>
          <TableActionButton
            label={t("categories.editCategory")}
            variant="edit"
            icon={<Pencil size={17} />}
            onClick={() => onEdit(row)}
          />

          {row.activo ? (
            <TableActionButton
              label={t("common.delete")}
              variant="delete"
              icon={<Trash2 size={17} />}
              onClick={() => onDeactivate(row)}
            />
          ) : null}
        </>
      )}
    />
  );
}

export default TablaCategorias;
