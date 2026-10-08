import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
  CalendarClock,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import InputField from "../common/InputField";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import { getPaymentStatusLabel } from "../../i18n/statusMap";

import {
  obtenerCuentasPorCobrarApi,
  obtenerVencimientosCuentasPorCobrarApi,
} from "../../services/cuentasPorCobrarApi";

import type {
  CuentasPorCobrarResumenResponse,
  VencimientosCuentasPorCobrarResponse,
} from "./cuentasPorCobrar.types";

function fechaLocalActual(): string {
  const now = new Date();

  return [
    now.getFullYear(),
    String(
      now.getMonth() + 1,
    ).padStart(2, "0"),
    String(
      now.getDate(),
    ).padStart(2, "0"),
  ].join("-");
}

function CuentasPorCobrarPage() {
  const { t } = useTranslation();
  const [data, setData] =
    useState<
      CuentasPorCobrarResumenResponse | null
    >(null);

  const [
    vencimientos,
    setVencimientos,
  ] = useState<
    VencimientosCuentasPorCobrarResponse | null
  >(null);

  const [
    fechaCorte,
    setFechaCorte,
  ] = useState(
    fechaLocalActual(),
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const cargar =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          cuentasResponse,
          vencimientosResponse,
        ] = await Promise.all([
          obtenerCuentasPorCobrarApi(),

          obtenerVencimientosCuentasPorCobrarApi(
            fechaCorte,
          ),
        ]);

        setData(
          cuentasResponse,
        );

        setVencimientos(
          vencimientosResponse,
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("receivables.loadError", "No fue posible cargar las cuentas por cobrar."),
        );
      } finally {
        setLoading(false);
      }
    }, [fechaCorte, t]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("receivables.title", "Cuentas por cobrar")}
        description={t("receivables.pageDesc", "Consultá saldos pendientes y vencimientos calculados por el backend.")}
        icon={WalletCards}
      />

      {error ? (
        <AlertMessage
          variant="error"
          title={t("receivables.loadErrorTitle", "No fue posible cargar cuentas por cobrar")}
          message={error}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("receivables.salesWithBalance", "Ventas con saldo")}
          value={String(
            data?.resumen
              .ventasConSaldo ?? 0,
          )}
          hint={t("receivables.salesWithDebtHint", "Ventas con deuda pendiente")}
          icon={WalletCards}
          variant="info"
        />

        <StatCard
          label={t("receivables.totalReceivable", "Total por cobrar")}
          value={
            data
              ? formatCurrency(
                  data.resumen
                    .totalPorCobrar,
                )
              : "—"
          }
          hint={t("receivables.officialPendingHint", "Saldo oficial pendiente")}
          icon={CircleDollarSign}
          variant="warning"
        />

        <StatCard
          label={t("receivables.overdueBalance", "Saldo vencido")}
          value={
            vencimientos
              ? formatCurrency(
                  vencimientos.vencidas
                    .saldo,
                )
              : "—"
          }
          hint={
            vencimientos
              ? t("receivables.overdueCountHint", {
                  count: vencimientos.vencidas.cantidad,
                  defaultValue: `${vencimientos.vencidas.cantidad} ventas vencidas`,
                })
              : t("receivables.accordingToCutoff", "Según fecha de corte")
          }
          icon={CalendarClock}
          variant="danger"
        />

        <StatCard
          label={t("receivables.toExpire", "Por vencer")}
          value={
            vencimientos
              ? formatCurrency(
                  vencimientos.porVencer
                    .saldo,
                )
              : "—"
          }
          hint={
            vencimientos
              ? t("receivables.toExpireCountHint", {
                  count: vencimientos.porVencer.cantidad,
                  defaultValue: `${vencimientos.porVencer.cantidad} ventas`,
                })
              : t("receivables.accordingToCutoff", "Según fecha de corte")
          }
          icon={CalendarClock}
          variant="success"
        />
      </div>

      <SectionCard
        title={t("receivables.maturities", "Vencimientos")}
        description={t("receivables.maturitiesDesc", "La clasificación proviene directamente del reporte oficial del backend.")}
      >
        <div className="mb-5 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
          <InputField
            label={t("receivables.cutoffDate", "Fecha de corte")}
            type="date"
            value={fechaCorte}
            onChange={setFechaCorte}
            disabled={loading}
          />

          <PrimaryButton
            onClick={() => {
              void cargar();
            }}
            loading={loading}
            loadingText={t("receivables.consulting", "Consultando...")}
            disabled={loading}
          >
            {t("receivables.consult", "Consultar")}
          </PrimaryButton>
        </div>

        {vencimientos ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t("receivables.noDueDate", "Sin vencimiento")}
              value={formatCurrency(
                vencimientos
                  .sinVencimiento
                  .saldo,
              )}
              hint={t("receivables.salesCountHint", {
                count: vencimientos.sinVencimiento.cantidad,
                defaultValue: `${vencimientos.sinVencimiento.cantidad} ventas`,
              })}
              icon={CalendarClock}
              variant="neutral"
            />

            <StatCard
              label={t("receivables.overdue", "Vencidas")}
              value={formatCurrency(
                vencimientos
                  .vencidas
                  .saldo,
              )}
              hint={t("receivables.salesCountHint", {
                count: vencimientos.vencidas.cantidad,
                defaultValue: `${vencimientos.vencidas.cantidad} ventas`,
              })}
              icon={CalendarClock}
              variant="danger"
            />

            <StatCard
              label={t("receivables.dueOnCutoff", "Vencen en corte")}
              value={formatCurrency(
                vencimientos
                  .venceEnFechaCorte
                  .saldo,
              )}
              hint={t("receivables.salesCountHint", {
                count: vencimientos.venceEnFechaCorte.cantidad,
                defaultValue: `${vencimientos.venceEnFechaCorte.cantidad} ventas`,
              })}
              icon={CalendarClock}
              variant="warning"
            />

            <StatCard
              label={t("receivables.toExpire", "Por vencer")}
              value={formatCurrency(
                vencimientos
                  .porVencer
                  .saldo,
              )}
              hint={t("receivables.salesCountHint", {
                count: vencimientos.porVencer.cantidad,
                defaultValue: `${vencimientos.porVencer.cantidad} ventas`,
              })}
              icon={CalendarClock}
              variant="success"
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title={t("receivables.receivablesDetail", "Detalle de cuentas por cobrar")}
        description={t("receivables.officialBalancesDesc", "Saldos oficiales devueltos por el backend.")}
      >
        {loading ? (
          <LoadingState message={t("receivables.loading", "Cargando cuentas por cobrar...")} />
        ) : data ? (
          <DataTableShell
            data={data.detalle}
            emptyMessage={t("receivables.emptyDetail", "No existen ventas con saldo pendiente.")}
            getRowKey={(row) =>
              row.idVenta
            }
            columns={[
              {
                key: "venta",
                header: t("receivables.sale", "Venta"),
                render: (row) =>
                  `#${row.numeroVenta}`,
              },
              {
                key: "cliente",
                header: t("receivables.client", "Cliente"),
                render: (row) =>
                  row.cliente ||
                  t("receivables.noClient", "Sin cliente"),
              },
              {
                key: "fecha",
                header: t("receivables.date", "Fecha"),
                render: (row) =>
                  row.fechaVenta,
              },
              {
                key: "estado",
                header: t("common.status", "Estado"),
                render: (row) => (
                  <StatusBadge
                    label={
                      getPaymentStatusLabel(t, row.estadoPago)
                    }
                    variant="warning"
                  />
                ),
              },
              {
                key: "total",
                header: t("receivables.total", "Total venta"),
                render: (row) =>
                  formatCurrency(
                    row.totalVenta,
                  ),
              },
              {
                key: "pagado",
                header: t("receivables.paid", "Pagado"),
                render: (row) =>
                  formatCurrency(
                    row.montoPagado,
                  ),
              },
              {
                key: "saldo",
                header: t("receivables.balance", "Saldo"),
                render: (row) => (
                  <span className="font-bold">
                    {formatCurrency(
                      row.saldoPendiente,
                    )}
                  </span>
                ),
              },
              {
                key: "vencimiento",
                header: t("receivables.dueDate", "Vencimiento"),
                render: (row) =>
                  row.fechaVencimientoPago ??
                  t("receivables.noDueDate", "Sin vencimiento"),
              },
            ]}
          />
        ) : null}
      </SectionCard>
    </div>
  );
}

export default CuentasPorCobrarPage;
