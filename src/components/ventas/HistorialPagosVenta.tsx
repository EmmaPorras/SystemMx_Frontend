import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import LoadingState from "../common/LoadingState";
import PrimaryButton from "../common/PrimaryButton";
import { formatCurrency, formatDateTime } from "../common/formatters";
import { getPaymentMethodLabel } from "../../i18n/statusMap";

import {
  obtenerPagosVentaApi,
} from "../../services/ventasApi";

import type {
  PagoVenta,
} from "./ventas.types";

type HistorialPagosVentaProps = {
  ventaId: number;
  refreshKey?: number;
};

function HistorialPagosVenta({
  ventaId,
  refreshKey = 0,
}: HistorialPagosVentaProps) {
  const { t } = useTranslation();
  const [pagos, setPagos] =
    useState<PagoVenta[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const cargarPagos =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        setPagos(
          await obtenerPagosVentaApi(
            ventaId,
          ),
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("common.errorOccurred", "No fue posible cargar los pagos."),
        );
      } finally {
        setLoading(false);
      }
    }, [ventaId, t]);

  useEffect(() => {
    void cargarPagos();
  }, [
    cargarPagos,
    refreshKey,
  ]);

  if (loading) {
    return <LoadingState message={t("common.loading", "Cargando pagos...")} />;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <AlertMessage
          variant="error"
          title={t("common.errorOccurred", "No fue posible cargar los pagos")}
          message={error}
        />

        <PrimaryButton
          onClick={() => {
            void cargarPagos();
          }}
        >
          {t("common.reload", "Reintentar")}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <DataTableShell
      data={pagos}
      emptyMessage={t("sales.emptyDesc", "Esta venta todavía no registra pagos.")}
      getRowKey={(row) =>
        row.idPagoVenta
      }
      columns={[
        {
          key: "fecha",
          header: t("sales.date", "Fecha"),
          render: (row) =>
            formatDateTime(row.createdAt),
        },
        {
          key: "metodo",
          header: t("sales.paymentMethod", "Método"),
          render: (row) =>
            getPaymentMethodLabel(t, row.metodoPago),
        },
        {
          key: "monto",
          header: t("sales.paid", "Monto"),
          render: (row) =>
            formatCurrency(
              row.monto,
            ),
        },
        {
          key: "referencia",
          header: t("movements.reference", "Referencia"),
          render: (row) =>
            row.referencia ?? "—",
        },
        {
          key: "usuario",
          header: t("movements.user", "Usuario"),
          render: (row) =>
            row.usuario ??
            (row.idUsuario
              ? `${t("movements.user", "Usuario")} #${row.idUsuario}`
              : t("movements.system", "Sistema")),
        },
        {
          key: "observaciones",
          header: t("orders.observations", "Observaciones"),
          render: (row) =>
            row.observaciones ??
            "—",
        },
      ]}
    />
  );
}

export default HistorialPagosVenta;
