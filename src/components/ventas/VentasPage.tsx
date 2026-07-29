import { useEffect, useMemo, useState } from "react";
import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import ConfirmDialog from "../common/ConfirmDialog";
import InputField from "../common/InputField";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import { formatCurrency } from "../common/formatters";
import {
  actualizarPagoVentaApi,
  anularVentaApi,
  crearVentaApi,
  enviarVentaAPapeleraApi,
  obtenerInventarioDisponibleVenta,
  obtenerVentas,
  restaurarVentaApi,
} from "../../services/ventasApi";
import FormularioVenta from "./FormularioVenta";
import TablaVentas from "./TablaVentas";
import VentaDetalleTable from "./VentaDetalleTable";
import type {
  CrearVentaPayload,
  InventarioDisponibleVenta,
  Venta,
} from "./ventas.types";

type VistaVentas = "ACTIVAS" | "DEUDORES" | "PAPELERA";

function formatCurrencySinDecimales(value: number) {
  return `₡${new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)}`;
}

function getNumeroVentaSugerido(ventas: Venta[]) {
  const numeros = ventas
    .map((venta) => Number(venta.numeroVenta))
    .filter((numero) => Number.isFinite(numero));

  if (numeros.length === 0) return "1";

  return String(Math.max(...numeros) + 1);
}

function VentasPage() {
  const [ventasActivas, setVentasActivas] = useState<Venta[]>([]);
  const [ventasPapelera, setVentasPapelera] = useState<Venta[]>([]);
  const [inventarioDisponible, setInventarioDisponible] = useState<
    InventarioDisponibleVenta[]
  >([]);

  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState<VistaVentas>("ACTIVAS");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pageAlert, setPageAlert] = useState<string | null>(null);
  const [modalAlert, setModalAlert] = useState<string | null>(null);

  const [ventaParaAnular, setVentaParaAnular] = useState<Venta | null>(null);
  const [ventaParaDetalle, setVentaParaDetalle] = useState<Venta | null>(null);

  async function cargarDatos() {
    try {
      setCargando(true);

      const [ventasData, papeleraData, inventarioData] = await Promise.all([
        obtenerVentas(),
        obtenerVentas({ papelera: true }),
        obtenerInventarioDisponibleVenta(),
      ]);

      setVentasActivas(ventasData);
      setVentasPapelera(papeleraData);
      setInventarioDisponible(inventarioData);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las ventas.";

      setPageAlert(message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const ventasBase = useMemo(() => {
    if (vista === "PAPELERA") return ventasPapelera;

    if (vista === "DEUDORES") {
      return ventasActivas.filter(
        (venta) =>
          venta.estadoVenta === "REGISTRADA" &&
          venta.saldoPendiente > 0 &&
          (venta.estadoPago === "PARCIAL" || venta.estadoPago === "EN_DEUDA"),
      );
    }

    return ventasActivas;
  }, [ventasActivas, ventasPapelera, vista]);

  const ventasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return ventasBase;

    return ventasBase.filter((venta) =>
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
  }, [busqueda, ventasBase]);

  const ventasRegistradas = ventasActivas.filter(
    (venta) => venta.estadoVenta === "REGISTRADA",
  );

  const totalVendido = ventasRegistradas.reduce(
    (acc, venta) => acc + venta.totalVenta,
    0,
  );

  const gananciaBruta = ventasRegistradas.reduce(
    (acc, venta) => acc + venta.gananciaBruta,
    0,
  );

  const deudaTotal = ventasRegistradas.reduce(
    (acc, venta) => acc + venta.saldoPendiente,
    0,
  );

  const productosVendidos = ventasRegistradas.reduce(
    (acc, venta) =>
      acc +
      venta.detalles.reduce(
        (detalleAcc, detalle) => detalleAcc + detalle.cantidad,
        0,
      ),
    0,
  );

  function abrirModalNuevaVenta() {
    setModalAlert(null);
    setFormKey((prev) => prev + 1);
    setModalAbierto(true);
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
        error instanceof Error ? error.message : "No se pudo guardar la venta.";

      setModalAlert(message);
    } finally {
      setGuardando(false);
    }
  }

  async function enviarAPapelera(venta: Venta) {
    try {
      await enviarVentaAPapeleraApi(venta.id);
      await cargarDatos();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo enviar la venta a papelera.";

      setPageAlert(message);
    }
  }

  async function restaurarVenta(venta: Venta) {
    try {
      await restaurarVentaApi(venta.id);
      await cargarDatos();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo restaurar la venta.";

      setPageAlert(message);
    }
  }

  async function marcarPagada(venta: Venta) {
    try {
      await actualizarPagoVentaApi(venta.id, venta.totalVenta);
      await cargarDatos();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el pago.";

      setPageAlert(message);
    }
  }

  async function confirmarAnularVenta() {
    if (!ventaParaAnular) return;

    try {
      await anularVentaApi(ventaParaAnular.id);
      setVentaParaAnular(null);
      await cargarDatos();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo anular la venta.";

      setPageAlert(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description="Registra ventas, descuenta inventario por FIFO o lote manual, calcula IVA, ganancia real y controla deudores."
        action={
          <PrimaryButton onClick={abrirModalNuevaVenta}>
            + Nueva venta
          </PrimaryButton>
        }
      />

      {pageAlert ? (
        <AlertMessage
          variant="error"
          title="Aviso"
          message={pageAlert}
          onClose={() => setPageAlert(null)}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          label="Ventas registradas"
          value={String(ventasRegistradas.length)}
          hint="Ventas activas no anuladas"
        />

        <StatCard
          label="Total vendido"
          value={formatCurrencySinDecimales(totalVendido)}
          hint="Incluye IVA cobrado"
        />

        <StatCard
          label="Ganancia bruta"
          value={formatCurrencySinDecimales(gananciaBruta)}
          hint="Sin contar IVA como ganancia"
        />

        <StatCard
          label="Morosos / deudas"
          value={formatCurrencySinDecimales(deudaTotal)}
          hint="Saldo pendiente activo"
        />

        <StatCard
          label="Productos vendidos"
          value={String(productosVendidos)}
          hint="Unidades vendidas"
        />
      </div>

      <SectionCard
        title="Listado de ventas"
        description="Filtra ventas activas, deudores o ventas enviadas a papelera."
      >
        <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_auto]">
          <InputField
            label="Buscar venta"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Venta, cliente, producto, lote, estado o método de pago"
          />

          <div className="flex flex-wrap items-end gap-2">
            {[
              { value: "ACTIVAS", label: "Activas" },
              { value: "DEUDORES", label: "Deudores" },
              { value: "PAPELERA", label: "Papelera" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setVista(item.value as VistaVentas)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  vista === item.value
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              Cargando ventas...
            </p>
          </div>
        ) : (
          <TablaVentas
            ventas={ventasFiltradas}
            vistaPapelera={vista === "PAPELERA"}
            onVerDetalle={setVentaParaDetalle}
            onEnviarPapelera={enviarAPapelera}
            onRestaurar={restaurarVenta}
            onAnular={setVentaParaAnular}
            onMarcarPagada={marcarPagada}
          />
        )}
      </SectionCard>

      <AppModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title="Nueva venta"
        description="Primero agrega los productos vendidos. Después registra cliente, método de pago y monto recibido."
        maxWidthClassName="max-w-6xl"
      >
        <FormularioVenta
          key={formKey}
          inventarioDisponible={inventarioDisponible}
          numeroVentaSugerido={getNumeroVentaSugerido([
            ...ventasActivas,
            ...ventasPapelera,
          ])}
          alertMessage={modalAlert}
          guardando={guardando}
          onSubmit={guardarVenta}
          onCancel={cerrarModal}
        />
      </AppModal>

      <AppModal
        isOpen={Boolean(ventaParaDetalle)}
        onClose={() => setVentaParaDetalle(null)}
        title={`Detalle de venta ${ventaParaDetalle?.numeroVenta ?? ""}`}
        description="Cada línea representa el lote real descontado del inventario."
        maxWidthClassName="max-w-6xl"
      >
        {ventaParaDetalle ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Cliente
                </p>
                <p className="mt-1 font-bold text-slate-950">
                  {ventaParaDetalle.clienteNombre || "Venta mostrador"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Total
                </p>
                <p className="mt-1 font-bold text-slate-950">
                  {formatCurrency(ventaParaDetalle.totalVenta)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Ganancia
                </p>
                <p className="mt-1 font-bold text-slate-950">
                  {formatCurrency(ventaParaDetalle.gananciaBruta)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Saldo
                </p>
                <p className="mt-1 font-bold text-slate-950">
                  {formatCurrency(ventaParaDetalle.saldoPendiente)}
                </p>
              </div>
            </div>

            <VentaDetalleTable detalles={ventaParaDetalle.detalles} />
          </div>
        ) : null}
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(ventaParaAnular)}
        title="Anular venta"
        message={`¿Seguro que desea anular la venta ${
          ventaParaAnular?.numeroVenta ?? ""
        }? Esta acción devuelve el stock a los lotes correspondientes.`}
        confirmLabel="Anular"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmarAnularVenta}
        onCancel={() => setVentaParaAnular(null)}
      />
    </div>
  );
}

export default VentasPage;