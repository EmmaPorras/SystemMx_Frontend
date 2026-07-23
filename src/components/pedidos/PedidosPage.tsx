import { useEffect, useMemo, useState } from "react";
import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import ConfirmDialog from "../common/ConfirmDialog";
import InputField from "../common/InputField";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import { obtenerProveedores } from "../../services/proveedoresApi";
import {
  actualizarPedidoApi,
  crearPedidoApi,
  eliminarPedidoApi,
  obtenerPedidos,
} from "../../services/pedidosApi";
import FormularioDetallePedido from "./FormularioDetallePedido";
import FormularioPedido from "./FormularioPedido";
import TablaPedidos from "./TablaPedidos";
import type {
  MonedaCompra,
  PedidoCabeceraFormErrors,
  PedidoCompra,
  PedidoDetalle,
  PedidoDetalleForm,
  PedidoDetalleFormErrors,
  ProductoSugerido,
} from "./pedidos.types";

const pedidoInicial: PedidoCompra = {
  id: 0,
  numeroPedido: "",
  fecha: new Date().toISOString().slice(0, 10),
  origen: "",
  proveedorId: 0,
  proveedorNombre: "",
  monedaCompra: "USD",
  tipoCambio: "",
  inversionTotal: 0,
  observaciones: "",
  estado: "REGISTRADO",
  detalles: [],
};

const detalleInicial: PedidoDetalleForm = {
  productoId: undefined,
  productoNombre: "",
  loteCodigo: "",
  cantidad: "1",
  costoUnitarioOrigen: "",
  precioVentaRecomendado: "",
  estadoLote: "EN_PROCESO",
};

function contarDigitos(value: string) {
  return value.replace(/\D/g, "").length;
}

function limpiarEntero(value: string, maxDigits: number) {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

function limpiarDecimalPorDigitos(
  value: string,
  maxDigits: number,
  maxDecimals = 2,
) {
  const limpio = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [enteroOriginal = "", ...decimalParts] = limpio.split(".");
  const decimalOriginal = decimalParts.join("");

  let entero = enteroOriginal;
  let decimal = decimalOriginal;

  if (entero.length > maxDigits) {
    entero = entero.slice(0, maxDigits);
    decimal = "";
  } else {
    const digitosDisponibles = maxDigits - entero.length;
    decimal = decimal.slice(0, Math.min(maxDecimals, digitosDisponibles));
  }

  if (limpio.includes(".") && decimal.length > 0) {
    return `${entero}.${decimal}`;
  }

  if (limpio.includes(".") && decimal.length === 0) {
    return `${entero}.`;
  }

  return entero;
}

function PedidosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pasoModal, setPasoModal] = useState<1 | 2>(1);

  const [pedidos, setPedidos] = useState<PedidoCompra[]>([]);
  const [proveedores, setProveedores] = useState<
    Array<{ id: number; nombre: string }>
  >([]);

  const [pageAlert, setPageAlert] = useState<string | null>(null);
  const [modalAlert, setModalAlert] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [pedido, setPedido] = useState<PedidoCompra>({ ...pedidoInicial });
  const [pedidoEditandoId, setPedidoEditandoId] = useState<number | null>(null);
  const [pedidoParaEliminar, setPedidoParaEliminar] =
    useState<PedidoCompra | null>(null);

  const [detalleForm, setDetalleForm] =
    useState<PedidoDetalleForm>({ ...detalleInicial });

  const [detalleEditandoId, setDetalleEditandoId] = useState<string | null>(
    null,
  );

  const [cabeceraErrors, setCabeceraErrors] =
    useState<PedidoCabeceraFormErrors>({});

  const [detalleErrors, setDetalleErrors] =
    useState<PedidoDetalleFormErrors>({});

  async function cargarDatos() {
    try {
      setCargando(true);

      const [pedidosData, proveedoresData] = await Promise.all([
        obtenerPedidos(),
        obtenerProveedores(),
      ]);

      setPedidos(pedidosData);

      setProveedores(
        proveedoresData
          .filter((item) => item.estado === "ACTIVO")
          .map((item) => ({
            id: item.id,
            nombre: item.nombre,
          })),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los pedidos.";

      setPageAlert(message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return pedidos;

    return pedidos.filter((item) =>
      [
        item.numeroPedido,
        item.origen,
        item.proveedorNombre,
        item.estado,
        item.monedaCompra,
        ...item.detalles.map((detalle) =>
          [detalle.productoNombre, detalle.loteCodigo, detalle.estadoLote].join(
            " ",
          ),
        ),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda, pedidos]);

  const totalEnTransito = pedidos.filter(
    (item) => item.estado === "EN_TRANSITO",
  ).length;

  const totalRecibidos = pedidos.filter(
    (item) => item.estado === "RECIBIDO",
  ).length;

  const totalLotes = pedidos.reduce(
    (acc, item) => acc + item.detalles.length,
    0,
  );

  function abrirModalNuevoPedido() {
    setPedido({ ...pedidoInicial });
    setDetalleForm({ ...detalleInicial });
    setPedidoEditandoId(null);
    setDetalleEditandoId(null);
    setCabeceraErrors({});
    setDetalleErrors({});
    setModalAlert(null);
    setPasoModal(1);
    setModalAbierto(true);
  }

  function abrirModalEditarPedido(pedidoSeleccionado: PedidoCompra) {
    setPedido({
      ...pedidoSeleccionado,
      detalles: pedidoSeleccionado.detalles.map((detalle) => ({
        ...detalle,
      })),
    });

    setDetalleForm({ ...detalleInicial });
    setPedidoEditandoId(pedidoSeleccionado.id);
    setDetalleEditandoId(null);
    setCabeceraErrors({});
    setDetalleErrors({});
    setModalAlert(null);
    setPasoModal(1);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setPasoModal(1);
    setPedido({ ...pedidoInicial });
    setDetalleForm({ ...detalleInicial });
    setPedidoEditandoId(null);
    setDetalleEditandoId(null);
    setCabeceraErrors({});
    setDetalleErrors({});
    setModalAlert(null);
    setGuardando(false);
  }

  function actualizarPedido(field: keyof PedidoCompra, value: string) {
    setModalAlert(null);

    setCabeceraErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setPedido((prev) => {
      if (field === "numeroPedido") {
        return {
          ...prev,
          numeroPedido: limpiarEntero(value, 3),
        };
      }

      if (field === "proveedorId") {
        const proveedorId = Number(value);
        const proveedor = proveedores.find((item) => item.id === proveedorId);

        return {
          ...prev,
          proveedorId,
          proveedorNombre: proveedor?.nombre ?? "",
        };
      }

      if (field === "monedaCompra") {
        return {
          ...prev,
          monedaCompra: value as MonedaCompra,
        };
      }

      if (field === "tipoCambio") {
        return {
          ...prev,
          tipoCambio: limpiarDecimalPorDigitos(value, 5, 2),
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  function actualizarDetalle(field: keyof PedidoDetalleForm, value: string) {
    setModalAlert(null);

    setDetalleErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setDetalleForm((prev) => {
      if (field === "productoNombre") {
        return {
          ...prev,
          productoId: undefined,
          productoNombre: value,
        };
      }

      if (field === "productoId") {
        return {
          ...prev,
          productoId: value ? Number(value) : undefined,
        };
      }

      if (field === "cantidad") {
        return {
          ...prev,
          cantidad: limpiarEntero(value, 5),
        };
      }

      if (
        field === "costoUnitarioOrigen" ||
        field === "precioVentaRecomendado"
      ) {
        return {
          ...prev,
          [field]: limpiarDecimalPorDigitos(value, 8, 2),
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  function seleccionarProductoSugerido(productoSugerido: ProductoSugerido) {
    setModalAlert(null);

    setDetalleErrors((prev) => ({
      ...prev,
      productoNombre: undefined,
    }));

    setDetalleForm((prev) => ({
      ...prev,
      productoId: productoSugerido.id,
      productoNombre: productoSugerido.nombre,
      precioVentaRecomendado:
        !prev.precioVentaRecomendado.trim() &&
        productoSugerido.precioVentaSugerido > 0
          ? String(productoSugerido.precioVentaSugerido)
          : prev.precioVentaRecomendado,
    }));
  }

  function validarCabecera() {
    const errors: PedidoCabeceraFormErrors = {};

    if (!pedido.numeroPedido.trim()) {
      errors.numeroPedido = "El número de pedido es obligatorio.";
    } else if (pedido.numeroPedido.trim().length > 3) {
      errors.numeroPedido = "Máximo 3 dígitos.";
    } else if (Number(pedido.numeroPedido) <= 0) {
      errors.numeroPedido = "Debe ser mayor a cero.";
    } else {
      const numeroDuplicado = pedidos.some(
        (item) =>
          item.numeroPedido === pedido.numeroPedido &&
          item.id !== pedidoEditandoId,
      );

      if (numeroDuplicado) {
        errors.numeroPedido = `Ya existe el Pedido ${pedido.numeroPedido}.`;
      }
    }

    if (!pedido.fecha) {
      errors.fecha = "La fecha es obligatoria.";
    }

    if (!pedido.origen.trim()) {
      errors.origen = "El origen es obligatorio.";
    }

    if (!pedido.proveedorId) {
      errors.proveedorId = "Debe seleccionar un proveedor.";
    }

    if (!pedido.monedaCompra) {
      errors.monedaCompra = "Debe seleccionar una moneda.";
    }

    if (!pedido.tipoCambio.trim()) {
      errors.tipoCambio = "El tipo de cambio es obligatorio.";
    } else if (contarDigitos(pedido.tipoCambio) > 5) {
      errors.tipoCambio = "Máximo 5 dígitos. Ejemplo: 445.00.";
    } else if (Number.isNaN(Number(pedido.tipoCambio))) {
      errors.tipoCambio = "Debe ser un número válido.";
    }

    if (pedido.observaciones.length > 150) {
      errors.observaciones = "Máximo 150 caracteres.";
    }

    setCabeceraErrors(errors);

    if (Object.keys(errors).length > 0) {
      setModalAlert("Completá los campos marcados en rojo para continuar.");
      return false;
    }

    return true;
  }

  function validarDetalle() {
    const errors: PedidoDetalleFormErrors = {};

    if (!detalleForm.productoNombre.trim()) {
      errors.productoNombre = "El nombre del artículo es obligatorio.";
    } else if (detalleForm.productoNombre.trim().length > 50) {
      errors.productoNombre = "Máximo 50 caracteres.";
    }

    if (!detalleForm.loteCodigo) {
      errors.loteCodigo = "Debe seleccionar un lote.";
    }

    if (!detalleForm.cantidad.trim()) {
      errors.cantidad = "La cantidad es obligatoria.";
    } else if (detalleForm.cantidad.length > 5) {
      errors.cantidad = "Máximo 5 dígitos.";
    } else if (Number(detalleForm.cantidad) <= 0) {
      errors.cantidad = "Debe ser mayor a cero.";
    }

    if (!detalleForm.costoUnitarioOrigen.trim()) {
      errors.costoUnitarioOrigen = "El precio de costo es obligatorio.";
    } else if (contarDigitos(detalleForm.costoUnitarioOrigen) > 8) {
      errors.costoUnitarioOrigen = "Máximo 8 dígitos.";
    } else if (Number.isNaN(Number(detalleForm.costoUnitarioOrigen))) {
      errors.costoUnitarioOrigen = "Debe ser un número válido.";
    }

    if (!detalleForm.precioVentaRecomendado.trim()) {
      errors.precioVentaRecomendado = "El precio de venta es obligatorio.";
    } else if (contarDigitos(detalleForm.precioVentaRecomendado) > 8) {
      errors.precioVentaRecomendado = "Máximo 8 dígitos.";
    } else if (Number.isNaN(Number(detalleForm.precioVentaRecomendado))) {
      errors.precioVentaRecomendado = "Debe ser un número válido.";
    }

    if (!detalleForm.estadoLote) {
      errors.estadoLote = "Debe seleccionar un estado.";
    }

    setDetalleErrors(errors);

    if (Object.keys(errors).length > 0) {
      setModalAlert(
        "Completá los campos marcados en rojo antes de agregar el artículo.",
      );
      return false;
    }

    return true;
  }

  function continuarADetalle() {
    if (!validarCabecera()) return;

    setModalAlert(null);
    setPasoModal(2);
  }

  function calcularCostoReal(costoOrigen: number) {
    const tipoCambio = Number(pedido.tipoCambio);

    if (Number.isNaN(tipoCambio)) {
      return costoOrigen;
    }

    return Number((costoOrigen * tipoCambio).toFixed(2));
  }

  function agregarOActualizarDetalle() {
    if (!validarDetalle()) return;

    const cantidad = Number(detalleForm.cantidad);
    const costoUnitarioOrigen = Number(detalleForm.costoUnitarioOrigen);
    const precioVentaRecomendado = Number(detalleForm.precioVentaRecomendado);
    const costoUnitarioReal = calcularCostoReal(costoUnitarioOrigen);

    if (detalleEditandoId) {
      setPedido((prev) => ({
        ...prev,
        detalles: prev.detalles.map((detalle) =>
          detalle.idTemporal === detalleEditandoId
            ? {
                ...detalle,
                productoId: detalleForm.productoId,
                productoNombre: detalleForm.productoNombre.trim(),
                loteCodigo: detalleForm.loteCodigo,
                cantidad,
                cantidadDisponible:
                  detalleForm.estadoLote === "AGOTADO" ? 0 : cantidad,
                costoUnitarioOrigen,
                costoUnitarioReal,
                precioVentaRecomendado,
                estadoLote: detalleForm.estadoLote,
              }
            : detalle,
        ),
      }));
    } else {
      setPedido((prev) => ({
        ...prev,
        detalles: [
          ...prev.detalles,
          {
            idTemporal: crypto.randomUUID(),
            productoId: detalleForm.productoId,
            productoNombre: detalleForm.productoNombre.trim(),
            loteCodigo: detalleForm.loteCodigo,
            cantidad,
            cantidadDisponible:
              detalleForm.estadoLote === "AGOTADO" ? 0 : cantidad,
            costoUnitarioOrigen,
            costoUnitarioReal,
            precioVentaRecomendado,
            estadoLote: detalleForm.estadoLote,
          },
        ],
      }));
    }

    setDetalleForm({ ...detalleInicial });
    setDetalleEditandoId(null);
    setDetalleErrors({});
    setModalAlert(null);
  }

  function iniciarEdicionDetalle(detalle: PedidoDetalle) {
    setDetalleEditandoId(detalle.idTemporal);

    setDetalleForm({
      productoId: detalle.productoId,
      productoNombre: detalle.productoNombre,
      loteCodigo: detalle.loteCodigo,
      cantidad: String(detalle.cantidad),
      costoUnitarioOrigen: String(detalle.costoUnitarioOrigen),
      precioVentaRecomendado: String(detalle.precioVentaRecomendado),
      estadoLote: detalle.estadoLote,
    });

    setDetalleErrors({});
    setModalAlert(null);
  }

  function cancelarEdicionDetalle() {
    setDetalleEditandoId(null);
    setDetalleForm({ ...detalleInicial });
    setDetalleErrors({});
    setModalAlert(null);
  }

  function eliminarDetalle(idTemporal: string) {
    setPedido((prev) => ({
      ...prev,
      detalles: prev.detalles.filter(
        (detalle) => detalle.idTemporal !== idTemporal,
      ),
    }));

    if (detalleEditandoId === idTemporal) {
      cancelarEdicionDetalle();
    }
  }

  function obtenerPedidoConDetallePendiente() {
    if (!detalleEditandoId) {
      return pedido;
    }

    if (!validarDetalle()) {
      return null;
    }

    const cantidad = Number(detalleForm.cantidad);
    const costoUnitarioOrigen = Number(detalleForm.costoUnitarioOrigen);
    const precioVentaRecomendado = Number(detalleForm.precioVentaRecomendado);
    const costoUnitarioReal = calcularCostoReal(costoUnitarioOrigen);

    return {
      ...pedido,
      detalles: pedido.detalles.map((detalle) =>
        detalle.idTemporal === detalleEditandoId
          ? {
              ...detalle,
              productoId: detalleForm.productoId,
              productoNombre: detalleForm.productoNombre.trim(),
              loteCodigo: detalleForm.loteCodigo,
              cantidad,
              cantidadDisponible:
                detalleForm.estadoLote === "AGOTADO" ? 0 : cantidad,
              costoUnitarioOrigen,
              costoUnitarioReal,
              precioVentaRecomendado,
              estadoLote: detalleForm.estadoLote,
            }
          : detalle,
      ),
    };
  }

  async function guardarPedido() {
    if (!validarCabecera()) {
      setPasoModal(1);
      return;
    }

    const pedidoFinal = obtenerPedidoConDetallePendiente();

    if (!pedidoFinal) return;

    if (pedidoFinal.detalles.length === 0) {
      setModalAlert("Debe agregar al menos un artículo al pedido.");
      return;
    }

    const inversionTotal = pedidoFinal.detalles.reduce(
      (acc, detalle) => acc + detalle.cantidad * detalle.costoUnitarioReal,
      0,
    );

    const pedidoParaGuardar: PedidoCompra = {
      ...pedidoFinal,
      inversionTotal,
    };

    try {
      setGuardando(true);

      if (pedidoEditandoId) {
        const actualizado = await actualizarPedidoApi(
          pedidoEditandoId,
          pedidoParaGuardar,
        );

        setPedidos((prev) =>
          prev.map((item) =>
            item.id === pedidoEditandoId ? actualizado : item,
          ),
        );
      } else {
        const creado = await crearPedidoApi(pedidoParaGuardar);

        setPedidos((prev) => [creado, ...prev]);
      }

      cerrarModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar el pedido.";

      setModalAlert(message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminarPedido() {
    if (!pedidoParaEliminar) return;

    try {
      await eliminarPedidoApi(pedidoParaEliminar.id);

      setPedidos((prev) =>
        prev.filter((item) => item.id !== pedidoParaEliminar.id),
      );

      setPedidoParaEliminar(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el pedido.";

      setPageAlert(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de compra"
        description="Registra y consulta compras completas. Cada pedido puede contener artículos divididos en diferentes lotes para mantener costos reales."
        action={
          <PrimaryButton onClick={abrirModalNuevoPedido}>
            + Nuevo pedido
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

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Pedidos registrados"
          value={String(pedidos.length)}
          hint="Compras registradas en el sistema"
        />

        <StatCard
          label="En tránsito"
          value={String(totalEnTransito)}
          hint="Pedidos en camino a Costa Rica"
        />

        <StatCard
          label="Recibidos"
          value={String(totalRecibidos)}
          hint="Pedidos ya disponibles para stock"
        />

        <StatCard
          label="Lotes registrados"
          value={String(totalLotes)}
          hint="Lotes generados desde pedidos"
        />
      </div>

      <SectionCard
        title="Listado de pedidos"
        description="Al abrir un pedido se muestran los artículos y los lotes asociados."
      >
        <div className="mb-4">
          <InputField
            label="Buscar pedido"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Pedido, proveedor, producto, lote, estado u origen"
          />
        </div>

        {cargando ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              Cargando pedidos...
            </p>
          </div>
        ) : (
          <TablaPedidos
            pedidos={pedidosFiltrados}
            onEdit={abrirModalEditarPedido}
            onDelete={setPedidoParaEliminar}
          />
        )}
      </SectionCard>

      <AppModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={
          pasoModal === 1
            ? pedidoEditandoId
              ? "Editar pedido"
              : "Nuevo pedido"
            : "Artículos del pedido"
        }
        description={
          pasoModal === 1
            ? "Primero registra la información general del pedido."
            : "Ahora agrega los artículos, lotes, costos y precios de venta."
        }
        maxWidthClassName={pasoModal === 1 ? "max-w-4xl" : "max-w-6xl"}
      >
        {pasoModal === 1 ? (
          <FormularioPedido
            pedido={pedido}
            proveedores={proveedores}
            errors={cabeceraErrors}
            alertMessage={modalAlert}
            onChange={actualizarPedido}
            onSubmit={continuarADetalle}
            onCancel={cerrarModal}
          />
        ) : (
          <FormularioDetallePedido
            pedido={pedido}
            detalleForm={detalleForm}
            errors={detalleErrors}
            alertMessage={modalAlert}
            isEditingDetail={Boolean(detalleEditandoId)}
            onDetalleChange={actualizarDetalle}
            onSeleccionarProducto={seleccionarProductoSugerido}
            onAgregarDetalle={agregarOActualizarDetalle}
            onEditarDetalle={iniciarEdicionDetalle}
            onCancelarEdicionDetalle={cancelarEdicionDetalle}
            onEliminarDetalle={eliminarDetalle}
            onBack={() => {
              setModalAlert(null);
              setPasoModal(1);
            }}
            onSave={guardarPedido}
            onCancel={cerrarModal}
          />
        )}

        {guardando ? (
          <p className="mt-4 text-center text-sm font-medium text-slate-500">
            Guardando pedido...
          </p>
        ) : null}
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(pedidoParaEliminar)}
        title="Eliminar pedido"
        message={`¿Seguro que desea eliminar ${
          pedidoParaEliminar?.numeroPedido
            ? `Pedido ${pedidoParaEliminar.numeroPedido}`
            : "este pedido"
        }? Esta acción también eliminará sus artículos y lotes asociados.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmarEliminarPedido}
        onCancel={() => setPedidoParaEliminar(null)}
      />
    </div>
  );
}

export default PedidosPage;