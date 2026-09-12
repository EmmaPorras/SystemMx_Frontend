import {
  Pencil,
  Trash2,
} from "lucide-react";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";

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
  return (
    <DataTableShell
      data={categorias}
      emptyMessage="Todavía no hay categorías registradas."
      getRowKey={(row) => row.idCategoria}
      columns={[
        {
          key: "nombre",
          header: "Nombre",
          render: (row) => row.nombre,
        },
        {
          key: "descripcion",
          header: "Descripción",
          render: (row) =>
            row.descripcion?.trim() || "—",
        },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={row.activo ? "ACTIVA" : "INACTIVA"}
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
            label="Editar categoría"
            variant="edit"
            icon={<Pencil size={17} />}
            onClick={() => onEdit(row)}
          />

          {row.activo ? (
            <TableActionButton
              label="Desactivar categoría"
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
