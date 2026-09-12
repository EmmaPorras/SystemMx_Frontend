import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CalendarClock,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import InputField from "../common/InputField";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";

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
            : "No fue posible cargar las cuentas por cobrar.",
        );
      } finally {
        setLoading(false);
      }
    }, [fechaCorte]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas por cobrar"
        description="Consultá saldos pendientes y vencimientos calculados por el backend."
        icon={WalletCards}
      />

      {error ? (
        <AlertMessage
          variant="error"
          title="No fue posible cargar cuentas por cobrar"
          message={error}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventas con saldo"
          value={String(
            data?.resumen
              .ventasConSaldo ?? 0,
          )}
          hint="Ventas con deuda pendiente"
          icon={WalletCards}
          variant="info"
        />

        <StatCard
          label="Total por cobrar"
          value={
            data
              ? formatCurrency(
                  data.resumen
                    .totalPorCobrar,
                )
              : "—"
          }
          hint="Saldo oficial pendiente"
          icon={CircleDollarSign}
          variant="warning"
        />

        <StatCard
          label="Saldo vencido"
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
              ? `${vencimientos.vencidas.cantidad} ventas vencidas`
              : "Según fecha de corte"
          }
          icon={CalendarClock}
          variant="danger"
        />

        <StatCard
          label="Por vencer"
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
              ? `${vencimientos.porVencer.cantidad} ventas`
              : "Según fecha de corte"
          }
          icon={CalendarClock}
          variant="success"
        />
      </div>

      <SectionCard
        title="Vencimientos"
        description="La clasificación proviene directamente del reporte oficial del backend."
      >
        <div className="mb-5 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
          <InputField
            label="Fecha de corte"
            type="date"
            value={fechaCorte}
            onChange={setFechaCorte}
          />

          <PrimaryButton
            onClick={() => {
              void cargar();
            }}
          >
            Consultar
          </PrimaryButton>
        </div>

        {vencimientos ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Sin vencimiento"
              value={formatCurrency(
                vencimientos
                  .sinVencimiento
                  .saldo,
              )}
              hint={`${vencimientos.sinVencimiento.cantidad} ventas`}
              icon={CalendarClock}
              variant="neutral"
            />

            <StatCard
              label="Vencidas"
              value={formatCurrency(
                vencimientos
                  .vencidas
                  .saldo,
              )}
              hint={`${vencimientos.vencidas.cantidad} ventas`}
              icon={CalendarClock}
              variant="danger"
            />

            <StatCard
              label="Vencen en corte"
              value={formatCurrency(
                vencimientos
                  .venceEnFechaCorte
                  .saldo,
              )}
              hint={`${vencimientos.venceEnFechaCorte.cantidad} ventas`}
              icon={CalendarClock}
              variant="warning"
            />

            <StatCard
              label="Por vencer"
              value={formatCurrency(
                vencimientos
                  .porVencer
                  .saldo,
              )}
              hint={`${vencimientos.porVencer.cantidad} ventas`}
              icon={CalendarClock}
              variant="success"
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Detalle de cuentas por cobrar"
        description="Saldos oficiales devueltos por el backend."
      >
        {loading ? (
          <p className="py-10 text-center text-sm font-semibold text-zinc-500">
            Cargando cuentas por cobrar...
          </p>
        ) : data ? (
          <DataTableShell
            data={data.detalle}
            emptyMessage="No existen ventas con saldo pendiente."
            getRowKey={(row) =>
              row.idVenta
            }
            columns={[
              {
                key: "venta",
                header: "Venta",
                render: (row) =>
                  `#${row.numeroVenta}`,
              },
              {
                key: "cliente",
                header: "Cliente",
                render: (row) =>
                  row.cliente ||
                  "Sin cliente",
              },
              {
                key: "fecha",
                header: "Fecha",
                render: (row) =>
                  row.fechaVenta,
              },
              {
                key: "estado",
                header: "Estado",
                render: (row) => (
                  <StatusBadge
                    label={
                      row.estadoPago
                    }
                    variant="warning"
                  />
                ),
              },
              {
                key: "total",
                header: "Total venta",
                render: (row) =>
                  formatCurrency(
                    row.totalVenta,
                  ),
              },
              {
                key: "pagado",
                header: "Pagado",
                render: (row) =>
                  formatCurrency(
                    row.montoPagado,
                  ),
              },
              {
                key: "saldo",
                header: "Saldo",
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
                header: "Vencimiento",
                render: (row) =>
                  row.fechaVencimientoPago ??
                  "Sin vencimiento",
              },
            ]}
          />
        ) : null}
      </SectionCard>
    </div>
  );
}

export default CuentasPorCobrarPage;
