import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import { getCatalogStatusLabel } from "../../i18n/statusMap";
import type { TarifaIVA } from "./tarifas-iva.types";

type TablaTarifasProps = {
  tarifas: TarifaIVA[];
  onEdit: (tarifa: TarifaIVA) => void;
  onDelete: (tarifa: TarifaIVA) => void;
};

function TablaTarifas({ tarifas, onEdit, onDelete }: TablaTarifasProps) {
  const { t } = useTranslation();

  return (
    <DataTableShell
      data={tarifas}
      emptyMessage={t("vatRates.emptyTitle")}
      emptyDescription={t("vatRates.emptyDesc")}
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
          header: t("common.code"),
          render: (row) => (
            <span className="font-semibold text-slate-900">{row.codigo}</span>
          ),
        },
        {
          key: "porcentaje",
          header: t("vatRates.percentage"),
          render: (row) => `${row.porcentaje}%`,
        },
        {
          key: "descripcion",
          header: t("common.description"),
          render: (row) => row.descripcion,
          className: "max-w-xs",
        },
        {
          key: "estado",
          header: t("common.status"),
          render: (row) => (
            <StatusBadge
              label={getCatalogStatusLabel(t, row.estado)}
              variant={row.estado === "ACTIVA" ? "success" : "warning"}
            />
          ),
        },
      ]}
      actions={(row) => (
        <>
          <TableActionButton
            label={t("vatRates.editRate")}
            variant="edit"
            icon={<Pencil size={17} />}
            onClick={() => onEdit(row)}
          />

          {row.estado === "ACTIVA" ? (
            <TableActionButton
              label={t("common.delete")}
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