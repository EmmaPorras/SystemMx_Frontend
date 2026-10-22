import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
  Ban,
  CircleDollarSign,
  Plus,
  ShoppingCart,
  Users,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import ConfirmDialog from "../common/ConfirmDialog";
import InputField from "../common/InputField";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getSaleStatusLabel,
} from "../../i18n/statusMap";

import {
  anularVentaApi,
  crearVentaApi,
  enviarVentaPapeleraApi,
  obtenerInventarioDisponibleVentaApi,
  obtenerSiguienteNumeroVentaApi,
  obtenerVentasApi,
  restaurarVentaApi,
} from "../../services/ventasApi";
import { obtenerTarifasIva } from "../../services/tarifasIvaApi";

import FormularioVenta from "./FormularioVenta";
import HistorialPagosVenta from "./HistorialPagosVenta";
import ModalRegistrarPago from "./ModalRegistrarPago";
import TablaVentas from "./TablaVentas";
import VentaDetalleTable from "./VentaDetalleTable";

import type { TarifaIVA } from "../tarifas-iva/tarifas-iva.types";
import type {
  CrearVentaPayload,
  InventarioDisponibleVenta,
  Venta,
} from "./ventas.types";

type VistaVentas = "ACTIVAS" | "DEUDORES" | "PAPELERA";

function VentasPage() {
  const { t } = useTranslation();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [inventarioDisponible, setInventarioDisponible] = useState<
    InventarioDisponibleVenta[]
  >([]);

  const [tarifasIva, setTarifasIva] = useState<TarifaIVA[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState<VistaVentas>("ACTIVAS");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [numeroVentaSugerido, setNumeroVentaSugerido] = useState("");
  const [preparandoVenta, setPreparandoVenta] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pageAlert, setPageAlert] = useState<string | null>(null);
  const [modalAlert, setModalAlert] = useState<string | null>(null);

  const [ventaParaDetalle, setVentaParaDetalle] = useState<Venta | null>(null);
  const [ventaAPagar, setVentaAPagar] = useState<Venta | null>(null);
  const [ventaAPapelera, setVentaAPapelera] = useState<Venta | null>(null);
  const [ventaARestaurar, setVentaARestaurar] = useState<Venta | null>(null);
  const [ventaAAnular, setVentaAAnular] = useState<Venta | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [historialRefreshKey, setHistorialRefreshKey] = useState(0);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setPageAlert(null);

      const query = {
        papelera: vista === "PAPELERA" ? true : undefined,
        deudores: vista === "DEUDORES" ? true : undefined,
      };

      const [ventasData, inventarioData, tarifasData] = await Promise.all([
        obtenerVentasApi(query),
        obtenerInventarioDisponibleVentaApi(),
        obtenerTarifasIva().catch(() => []),
      ]);

      setVentas(ventasData);
      setInventarioDisponible(inventarioData);
      setTarifasIva(tarifasData.filter((t) => t.estado === "ACTIVA"));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("sales.loadError", "No fue posible cargar las ventas.");

      setPageAlert(message);
    } finally {
      setCargando(false);
    }
  }, [t, vista]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const ventasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return ventas;

    return ventas.filter((venta) =>
      [
        venta.numeroVenta,
        venta.fechaVenta,
        venta.clienteNombre,
        venta.medioPago,
        venta.estadoPago,
        venta.estadoVenta,
        ...venta.detalles.map((detalle) =>
          [
            detalle.productoNombre,
            detalle.loteCodigo,
            detalle.detalle,
            detalle.modoDescuentoLote,
          ].join(" "),
        ),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda, ventas]);

  const ventasConDeuda = ventas.filter(
    (venta) =>
      venta.estadoVenta === "REGISTRADA" &&
      !venta.enPapelera &&
      venta.saldoPendiente > 0,
  ).length;

  const ventasAnuladas = ventas.filter(
    (venta) => venta.estadoVenta === "ANULADA",
  ).length;

  async function abrirModalNuevaVenta() {
    if (preparandoVenta) return;

    try {
      setPreparandoVenta(true);
      setPageAlert(null);
      setModalAlert(null);

      const { numeroVenta } =
        await obtenerSiguienteNumeroVentaApi();

      setNumeroVentaSugerido(String(numeroVenta));
      setFormKey((prev) => prev + 1);
      setModalAbierto(true);
    } catch (error) {
      setPageAlert(
        error instanceof Error
          ? error.message
          : t("sales.prepareError", "No fue posible preparar el número de la nueva venta."),
      );
    } finally {
      setPreparandoVenta(false);
    }
  }

  function cerrarModal() {
    setModalAbierto(false);
    setModalAlert(null);
    setGuardando(false);
  }

  async function guardarVenta(payload: CrearVentaPayload) {
    try {
      setGuardando(true);
      setModalAlert(null);

      await crearVentaApi(payload);

      cerrarModal();
      await cargarDatos();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("sales.saveError", "No se pudo guardar la venta.");

      setModalAlert(message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarPapelera() {
    if (!ventaAPapelera) return;

    try {
      setActionLoading(true);
      await enviarVentaPapeleraApi(ventaAPapelera.id);
      setVentaAPapelera(null);
      await cargarDatos();
    } catch (error) {
      setPageAlert(
        error instanceof Error
          ? error.message
          : t("sales.trashError", "No fue posible enviar la venta a papelera."),
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmarRestauracion() {
    if (!ventaARestaurar) return;

    try {
      setActionLoading(true);
      await restaurarVentaApi(ventaARestaurar.id);
      setVentaARestaurar(null);
      await cargarDatos();
    } catch (error) {
      setPageAlert(
        error instanceof Error
          ? error.message
          : t("sales.restoreError", "No fue posible restaurar la venta."),
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmarAnulacion() {
    if (!ventaAAnular) return;

    try {
      setActionLoading(true);
      await anularVentaApi(ventaAAnular.id);
      setVentaAAnular(null);
      await cargarDatos();
    } catch (error) {
      setPageAlert(
        error instanceof Error
          ? error.message
          : t("sales.voidError", "No fue posible anular la venta."),
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handlePagoSuccess(ventaActualizada: Venta) {
    setVentas((current) =>
      current.map((v) =>
        v.id === ventaActualizada.id ? ventaActualizada : v,
      ),
    );

    if (ventaParaDetalle && ventaParaDetalle.id === ventaActualizada.id) {
      setVentaParaDetalle(ventaActualizada);
      setHistorialRefreshKey((prev) => prev + 1);
    }

    setVentaAPagar(null);
    if (vista === "DEUDORES") {
      void cargarDatos();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("sales.title", "Ventas")}
        description={t("sales.pageDesc", "Registrar ventas, gestionar cobros y consultar el historial oficial.")}
        icon={ShoppingCart}
        action={
          <PrimaryButton
            onClick={() => {
              void abrirModalNuevaVenta();
            }}
            loading={preparandoVenta}
            loadingText={t("sales.preparing", "Preparando...")}
          >
            <span className="flex items-center gap-1.5">
              <Plus size={18} />
              <span>{t("sales.newSale", "Nueva venta")}</span>
            </span>
          </PrimaryButton>
        }
      />

      {pageAlert ? (
        <AlertMessage
          variant="error"
          title={t("common.notice", "Aviso")}
          message={pageAlert}
          onClose={() => setPageAlert(null)}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("sales.totalInView", "Total en vista")}
          value={String(ventas.length)}
          hint={
            vista === "PAPELERA"
              ? t("sales.trashHint", "Ventas en papelera")
              : vista === "DEUDORES"
                ? t("sales.debtorsHint", "Ventas con deuda activa")
                : t("sales.registeredHint", "Ventas registradas")
          }
          icon={ShoppingCart}
          variant="info"
        />

        <StatCard
          label={t("sales.withPendingBalance", "Con saldo pendiente")}
          value={String(ventasConDeuda)}
          hint={t("sales.withDebtHint", "Ventas que registran deuda")}
          icon={CircleDollarSign}
          variant="warning"
        />

        <StatCard
          label={t("sales.availableLots", "Lotes disponibles")}
          value={String(inventarioDisponible.length)}
          hint={t("sales.lotsInStockHint", "Lotes en stock para venta")}
          icon={Users}
          variant="success"
        />

        <StatCard
          label={t("sales.voided", "Anuladas")}
          value={String(ventasAnuladas)}
          hint={t("sales.voidedHint", "Ventas anuladas formalmente")}
          icon={Ban}
          variant="neutral"
        />
      </div>

      <SectionCard
        title={t("sales.salesList", "Listado de ventas")}
        description={t("sales.salesListDesc", "Gestión oficial de ventas generadas y sus cobros asociados.")}
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setVista("ACTIVAS");
                setBusqueda("");
              }}
              className={`h-[38px] rounded-xl px-4 text-xs sm:text-sm font-semibold transition ${
                vista === "ACTIVAS"
                  ? "bg-zinc-950 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {t("sales.activeSales", "Ventas activas")}
            </button>

            <button
              type="button"
              onClick={() => {
                setVista("DEUDORES");
                setBusqueda("");
              }}
              className={`h-[38px] rounded-xl px-4 text-xs sm:text-sm font-semibold transition ${
                vista === "DEUDORES"
                  ? "bg-zinc-950 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {t("sales.debtors", "Deudores")}
            </button>

            <button
              type="button"
              onClick={() => {
                setVista("PAPELERA");
                setBusqueda("");
              }}
              className={`h-[38px] rounded-xl px-4 text-xs sm:text-sm font-semibold transition ${
                vista === "PAPELERA"
                  ? "bg-zinc-950 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {t("sales.trash", "Papelera")}
            </button>
          </div>

          <div className="w-full sm:w-72">
            <InputField
              label={t("sales.searchSale", "Buscar venta")}
              value={busqueda}
              onChange={setBusqueda}
              placeholder={t("sales.searchPlaceholderFull", "Número, cliente, producto o detalle")}
            />
          </div>
        </div>

        {cargando ? (
          <LoadingState message={t("sales.loadingSales", "Cargando ventas...")} />
        ) : (
          <TablaVentas
            ventas={ventasFiltradas}
            onView={(venta) => setVentaParaDetalle(venta)}
            onPay={(venta) => setVentaAPagar(venta)}
            onTrash={(venta) => setVentaAPapelera(venta)}
            onRestore={(venta) => setVentaARestaurar(venta)}
            onVoid={(venta) => setVentaAAnular(venta)}
          />
        )}
      </SectionCard>

      <AppModal
        isOpen={modalAbierto}
        title={t("sales.newSaleTitle", "Registrar nueva venta")}
        description={t("sales.newSaleDesc", "Creación de venta con descuento de inventario según modo FIFO o lote manual.")}
        onClose={cerrarModal}
        isSubmitting={guardando}
        maxWidthClassName="max-w-6xl"
      >
        <FormularioVenta
          key={formKey}
          inventarioDisponible={inventarioDisponible}
          numeroVentaSugerido={numeroVentaSugerido}
          tarifasIva={tarifasIva}
          alertMessage={modalAlert}
          guardando={guardando}
          onSubmit={guardarVenta}
          onCancel={cerrarModal}
        />
      </AppModal>

      <AppModal
        isOpen={ventaParaDetalle !== null}
        title={t("sales.saleDetailTitle", "Detalle de venta")}
        description={
          ventaParaDetalle
            ? t("sales.saleDetailSubtitle", {
                number: ventaParaDetalle.numeroVenta,
                date: ventaParaDetalle.fechaVenta,
                defaultValue: `Venta #${ventaParaDetalle.numeroVenta} · ${ventaParaDetalle.fechaVenta}`,
              })
            : t("sales.saleDetailFallback", "Información de la venta")
        }
        onClose={() => setVentaParaDetalle(null)}
        maxWidthClassName="max-w-5xl"
      >
        {ventaParaDetalle ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
              <div>
                <p className="text-xl font-bold text-zinc-950">
                  {ventaParaDetalle.clienteNombre || t("sales.overTheCounter", "Venta mostrador")}
                </p>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {t("sales.paymentMethodWithColon", {
                    method: getPaymentMethodLabel(t, ventaParaDetalle.medioPago),
                    defaultValue: `Método de pago: ${ventaParaDetalle.medioPago}`,
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge
                  label={getPaymentStatusLabel(t, ventaParaDetalle.estadoPago)}
                  variant={
                    ventaParaDetalle.estadoPago === "PAGADA"
                      ? "success"
                      : ventaParaDetalle.estadoPago === "PARCIAL" ||
                          ventaParaDetalle.estadoPago === "EN_DEUDA"
                        ? "warning"
                        : "danger"
                  }
                />

                <StatusBadge
                  label={getSaleStatusLabel(t, ventaParaDetalle.estadoVenta)}
                  variant={
                    ventaParaDetalle.estadoVenta === "REGISTRADA"
                      ? "success"
                      : "danger"
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {t("sales.subtotal", "Subtotal")}
                </p>
                <p className="mt-1 text-base font-bold text-zinc-950">
                  {formatCurrency(ventaParaDetalle.subtotal)}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {t("sales.ivaTotal", "IVA Total")}
                </p>
                <p className="mt-1 text-base font-bold text-zinc-950">
                  {formatCurrency(ventaParaDetalle.ivaTotal)}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {t("sales.totalSale", "Total Venta")}
                </p>
                <p className="mt-1 text-base font-bold text-zinc-950">
                  {formatCurrency(ventaParaDetalle.totalVenta)}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {t("sales.pendingBalance", "Saldo Pendiente")}
                </p>
                <p
                  className={`mt-1 text-base font-bold ${
                    ventaParaDetalle.saldoPendiente > 0
                      ? "text-amber-700"
                      : "text-zinc-950"
                  }`}
                >
                  {formatCurrency(ventaParaDetalle.saldoPendiente)}
                </p>
              </div>
            </div>

            {ventaParaDetalle.observaciones?.trim() ? (
              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {t("sales.observations", "Observaciones")}
                </p>
                <p className="mt-1 text-sm text-zinc-700">
                  {ventaParaDetalle.observaciones}
                </p>
              </div>
            ) : null}

            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                {t("sales.productsAndDetails", "Productos y detalles")}
              </h4>
              <VentaDetalleTable detalles={ventaParaDetalle.detalles} />
            </div>

            <div className="space-y-3 border-t border-zinc-200 pt-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  {t("sales.paymentHistory", "Historial de pagos")}
                </h4>

                {ventaParaDetalle.saldoPendiente > 0 &&
                ventaParaDetalle.estadoVenta === "REGISTRADA" &&
                !ventaParaDetalle.enPapelera ? (
                  <PrimaryButton
                    onClick={() => setVentaAPagar(ventaParaDetalle)}
                  >
                    <span className="flex items-center gap-1.5">
                      <CircleDollarSign size={16} />
                      <span>{t("sales.registerPayment", "Registrar pago")}</span>
                    </span>
                  </PrimaryButton>
                ) : null}
              </div>

              <HistorialPagosVenta
                ventaId={ventaParaDetalle.id}
                refreshKey={historialRefreshKey}
              />
            </div>
          </div>
        ) : null}
      </AppModal>

      <ModalRegistrarPago
        isOpen={ventaAPagar !== null}
        venta={ventaAPagar}
        onClose={() => setVentaAPagar(null)}
        onSuccess={handlePagoSuccess}
      />

      <ConfirmDialog
        isOpen={ventaAPapelera !== null}
        title={t("sales.trashConfirmTitle", "Enviar venta a papelera")}
        message={
          ventaAPapelera
            ? t("sales.trashConfirmMessage", {
                number: ventaAPapelera.numeroVenta,
                defaultValue: `¿Quieres enviar la venta #${ventaAPapelera.numeroVenta} a la papelera? Esta operación no anula la venta ni restaura inventario.`,
              })
            : ""
        }
        confirmLabel={actionLoading ? t("sales.sendingToTrash", "Enviando...") : t("sales.sendToTrash", "Enviar a papelera")}
        cancelLabel={t("common.cancel", "Cancelar")}
        variant="warning"
        onConfirm={confirmarPapelera}
        onCancel={() => {
          if (!actionLoading) setVentaAPapelera(null);
        }}
      />

      <ConfirmDialog
        isOpen={ventaARestaurar !== null}
        title={t("sales.restoreConfirmTitle", "Restaurar venta")}
        message={
          ventaARestaurar
            ? t("sales.restoreConfirmMessage", {
                number: ventaARestaurar.numeroVenta,
                defaultValue: `¿Quieres restaurar la venta #${ventaARestaurar.numeroVenta} desde la papelera?`,
              })
            : ""
        }
        confirmLabel={actionLoading ? t("sales.restoring", "Restaurando...") : t("sales.restore", "Restaurar")}
        cancelLabel={t("common.cancel", "Cancelar")}
        variant="warning"
        onConfirm={confirmarRestauracion}
        onCancel={() => {
          if (!actionLoading) setVentaARestaurar(null);
        }}
      />

      <ConfirmDialog
        isOpen={ventaAAnular !== null}
        title={t("sales.voidConfirmTitle", "Anular venta")}
        message={
          ventaAAnular
            ? t("sales.voidConfirmMessage", {
                number: ventaAAnular.numeroVenta,
                defaultValue: `¿Seguro que quieres anular la venta #${ventaAAnular.numeroVenta}? El backend restaurará el inventario correspondiente y conservará el historial de la operación.`,
              })
            : ""
        }
        confirmLabel={actionLoading ? t("sales.voiding", "Anulando...") : t("sales.voidSale", "Anular venta")}
        cancelLabel={t("common.cancel", "Cancelar")}
        variant="danger"
        onConfirm={confirmarAnulacion}
        onCancel={() => {
          if (!actionLoading) setVentaAAnular(null);
        }}
      />
    </div>
  );
}

export default VentasPage;
