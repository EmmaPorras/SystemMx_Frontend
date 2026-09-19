import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import LoadingState from "../common/LoadingState";
import PrimaryButton from "../common/PrimaryButton";
import { formatCurrency, formatDateTime } from "../common/formatters";

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
            : "No fue posible cargar los pagos.",
        );
      } finally {
        setLoading(false);
      }
    }, [ventaId]);

  useEffect(() => {
    void cargarPagos();
  }, [
    cargarPagos,
    refreshKey,
  ]);

  if (loading) {
    return <LoadingState message="Cargando pagos..." />;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <AlertMessage
          variant="error"
          title="No fue posible cargar los pagos"
          message={error}
        />

        <PrimaryButton
          onClick={() => {
            void cargarPagos();
          }}
        >
          Reintentar
        </PrimaryButton>
      </div>
    );
  }

  return (
    <DataTableShell
      data={pagos}
      emptyMessage="Esta venta todavía no registra pagos."
      getRowKey={(row) =>
        row.idPagoVenta
      }
      columns={[
        {
          key: "fecha",
          header: "Fecha",
          render: (row) =>
            formatDateTime(row.createdAt),
        },
        {
          key: "metodo",
          header: "Método",
          render: (row) =>
            row.metodoPago,
        },
        {
          key: "monto",
          header: "Monto",
          render: (row) =>
            formatCurrency(
              row.monto,
            ),
        },
        {
          key: "referencia",
          header: "Referencia",
          render: (row) =>
            row.referencia ?? "—",
        },
        {
          key: "usuario",
          header: "Usuario",
          render: (row) =>
            row.usuario ??
            (row.idUsuario
              ? `Usuario #${row.idUsuario}`
              : "Sistema"),
        },
        {
          key: "observaciones",
          header: "Observaciones",
          render: (row) =>
            row.observaciones ??
            "—",
        },
      ]}
    />
  );
}

export default HistorialPagosVenta;
