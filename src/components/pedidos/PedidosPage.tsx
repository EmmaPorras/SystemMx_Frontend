import { useEffect, useMemo, useState } from "react";

import { PiAirplaneTiltFill } from "react-icons/pi";
import { TbClipboardList, TbPackages, TbTruckDelivery } from "react-icons/tb";
import { LuPackageCheck } from "react-icons/lu";
import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import ConfirmDialog from "../common/ConfirmDialog";
import InputField from "../common/InputField";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import StatCard from "../common/StatCard";
import { formatCurrency } from "../common/formatters";
import { obtenerProveedores } from "../../services/proveedoresApi";
import {
  actualizarPedidoApi,
  crearPedidoApi,
  eliminarPedidoApi,
  obtenerPedidos,
} from "../../services/pedidosApi";
import FormularioDetallePedido from "./FormularioDetallePedido";
import FormularioPedido from "./FormularioPedido";
import PedidoDetalleTable from "./PedidoDetalleTable";
import ProductoPedidoFilter from "./ProductoPedidoFilter";
import TablaPedidos from "./TablaPedidos";
import type {
  EstadoLoteProducto,
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
  cantidadRecibida: "",
  cantidadRecibidaPrevia: "0",
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

function getNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function estadoPermiteCantidadRecibida(estado: EstadoLoteProducto) {
  return estado === "EN_STOCK" || estado === "VENDIDO_PARCIAL";
}

function calcularResumenRecepcion(
  estadoLote: EstadoLoteProducto,
  cantidad: number,
  cantidadRecibidaActual: string,
  cantidadRecibidaPrevia: string,
) {
  const recibidaPrevia = getNumber(cantidadRecibidaPrevia);
  const recibidaActual = getNumber(cantidadRecibidaActual);

  if (estadoLote === "EN_PROCESO") {
    return {
      cantidadRecibidaTotal: 0,
      cantidadPendiente: cantidad,
      cantidadDisponible: 0,
    };
  }

  if (estadoLote === "AGOTADO") {
    const cantidadRecibidaTotal = recibidaPrevia + recibidaActual;

    return {
      cantidadRecibidaTotal,
      cantidadPendiente: Math.max(cantidad - cantidadRecibidaTotal, 0),
      cantidadDisponible: 0,
    };
  }

  if (estadoPermiteCantidadRecibida(estadoLote)) {
    const cantidadRecibidaTotal = recibidaPrevia + recibidaActual;

    return {
      cantidadRecibidaTotal,
      cantidadPendiente: Math.max(cantidad - cantidadRecibidaTotal, 0),
      cantidadDisponible: cantidadRecibidaTotal,
    };
  }

  return {
    cantidadRecibidaTotal: 0,
    cantidadPendiente: cantidad,
    cantidadDisponible: 0,
  };
}

function PedidosPage() {
  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtroNumeroPedido, setFiltroNumeroPedido] = useState("");
  const [filtroProveedorId, setFiltroProveedorId] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [pasoModal, setPasoModal] = useState<1 | 2>(1);

  const [pedidos, setPedidos] = useState<PedidoCompra[]>([]);
  const [proveedoresActivos, setProveedoresActivos] = useState<
    Array<{ id: number; nombre: string; pais: string }>
  >([]);
  const [proveedoresFiltro, setProveedoresFiltro] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoCompra | null>(null);

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

      const proveedoresMapeados = proveedoresData
        .map((item) => ({
          id: item.id,
          nombre: item.nombre,
          pais: item.pais,
          estado: item.estado,
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

      setProveedoresFiltro(
        proveedoresMapeados.map(({ id, nombre }) => ({ id, nombre })),
      );

      setProveedoresActivos(
        proveedoresMapeados
          .filter((item) => item.estado === "ACTIVO")
          .map(({ id, nombre, pais }) => ({ id, nombre, pais })),
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

  const productosFiltroOptions = useMemo(() => {
    const nombres = new Map<string, string>();

    pedidos.forEach((item) => {
      item.detalles.forEach((detalle) => {
        const nombre = detalle.productoNombre.trim();

        if (nombre) {
          nombres.set(nombre.toLowerCase(), nombre);
        }
      });
    });

    return Array.from(nombres.values()).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" }),
    );
  }, [pedidos]);

  const proveedoresFiltroOptions = useMemo(
    () =>
      proveedoresFiltro.map((item) => ({
        value: String(item.id),
        label: item.nombre,
      })),
    [proveedoresFiltro],
  );

  const pedidosFiltrados = useMemo(() => {
    const productoTerm = filtroProducto.trim().toLowerCase();

    return pedidos.filter((item) => {
      const coincideProducto = productoTerm
        ? item.detalles.some((detalle) =>
            detalle.productoNombre.toLowerCase().includes(productoTerm),
          )
        : true;

      const coincideNumero = filtroNumeroPedido
        ? String(item.numeroPedido) === filtroNumeroPedido
        : true;

      const coincideProveedor = filtroProveedorId
        ? item.proveedorId === Number(filtroProveedorId)
        : true;

      return coincideProducto && coincideNumero && coincideProveedor;
    });
  }, [filtroNumeroPedido, filtroProducto, filtroProveedorId, pedidos]);

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

  function actualizarFiltroNumeroPedido(value: string) {
    const numeroLimpio = limpiarEntero(value, 4);

    if (!numeroLimpio || Number(numeroLimpio) === 0) {
      setFiltroNumeroPedido("");
      return;
    }

    setFiltroNumeroPedido(numeroLimpio);
  }

  function abrirDetallePedido(pedidoSeleccionado: PedidoCompra) {
    setPedidoDetalle(pedidoSeleccionado);
  }

  function cerrarDetallePedido() {
    setPedidoDetalle(null);
  }

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
        const proveedor = proveedoresActivos.find(
          (item) => item.id === proveedorId,
        );

        return {
          ...prev,
          proveedorId,
          proveedorNombre: proveedor?.nombre ?? "",
          origen: proveedor?.pais ?? "",
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
        const cantidadLimpia = limpiarEntero(value, 5);
        const cantidad = getNumber(cantidadLimpia);
        const recibidaPrevia = getNumber(prev.cantidadRecibidaPrevia);
        const recibidaActual = getNumber(prev.cantidadRecibida);
        const maxActual = Math.max(cantidad - recibidaPrevia, 0);

        return {
          ...prev,
          cantidad: cantidadLimpia,
          cantidadRecibida:
            recibidaActual > maxActual && estadoPermiteCantidadRecibida(prev.estadoLote)
              ? String(maxActual)
              : prev.cantidadRecibida,
        };
      }

      if (field === "cantidadRecibida") {
        return {
          ...prev,
          cantidadRecibida: limpiarEntero(value, 5),
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

      if (field === "estadoLote") {
        const nuevoEstado = value as EstadoLoteProducto;

        if (nuevoEstado === "EN_PROCESO") {
          return {
            ...prev,
            estadoLote: nuevoEstado,
            cantidadRecibida: "",
            cantidadRecibidaPrevia: "0",
          };
        }

        return {
          ...prev,
          estadoLote: nuevoEstado,
          cantidadRecibida: estadoPermiteCantidadRecibida(nuevoEstado)
            ? prev.cantidadRecibida
            : "",
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

    const cantidad = getNumber(detalleForm.cantidad);
    const cantidadRecibidaPrevia = getNumber(
      detalleForm.cantidadRecibidaPrevia,
    );
    const cantidadRecibidaActual = getNumber(detalleForm.cantidadRecibida);
    const maxCantidadRecibidaActual = Math.max(
      cantidad - cantidadRecibidaPrevia,
      0,
    );

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
    } else if (cantidad <= 0) {
      errors.cantidad = "Debe ser mayor a cero.";
    }

    if (estadoPermiteCantidadRecibida(detalleForm.estadoLote)) {
      if (
        cantidadRecibidaPrevia <= 0 &&
        !detalleForm.cantidadRecibida.trim()
      ) {
        errors.cantidadRecibida =
          "Indicá cuántas unidades llegaron.";
      } else if (
        detalleForm.cantidadRecibida.trim() &&
        cantidadRecibidaActual <= 0
      ) {
        errors.cantidadRecibida =
          "Debe ser mayor a cero.";
      } else if (cantidadRecibidaActual > maxCantidadRecibidaActual) {
        errors.cantidadRecibida = `Máximo pendiente: ${maxCantidadRecibidaActual}.`;
      }
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

  function construirDetalleDesdeFormulario(
    detalleBase?: PedidoDetalle,
  ): PedidoDetalle {
    const cantidad = Number(detalleForm.cantidad);
    const costoUnitarioOrigen = Number(detalleForm.costoUnitarioOrigen);
    const precioVentaRecomendado = Number(detalleForm.precioVentaRecomendado);
    const costoUnitarioReal = calcularCostoReal(costoUnitarioOrigen);

    const resumenRecepcion = calcularResumenRecepcion(
      detalleForm.estadoLote,
      cantidad,
      detalleForm.cantidadRecibida,
      detalleForm.cantidadRecibidaPrevia,
    );

    return {
      ...(detalleBase ?? {
        idTemporal: crypto.randomUUID(),
      }),
      productoId: detalleForm.productoId,
      productoNombre: detalleForm.productoNombre.trim(),
      loteCodigo: detalleForm.loteCodigo,
      cantidad,
      cantidadRecibida: resumenRecepcion.cantidadRecibidaTotal,
      cantidadPendiente: resumenRecepcion.cantidadPendiente,
      cantidadDisponible: resumenRecepcion.cantidadDisponible,
      costoUnitarioOrigen,
      costoUnitarioReal,
      precioVentaRecomendado,
      estadoLote: detalleForm.estadoLote,
    };
  }

  function agregarOActualizarDetalle() {
    if (!validarDetalle()) return;

    if (detalleEditandoId) {
      setPedido((prev) => ({
        ...prev,
        detalles: prev.detalles.map((detalle) =>
          detalle.idTemporal === detalleEditandoId
            ? construirDetalleDesdeFormulario(detalle)
            : detalle,
        ),
      }));
    } else {
      setPedido((prev) => ({
        ...prev,
        detalles: [
          ...prev.detalles,
          construirDetalleDesdeFormulario(),
        ],
      }));
    }

    setDetalleForm({ ...detalleInicial });
    setDetalleEditandoId(null);
    setDetalleErrors({});
    setModalAlert(null);
  }

  function iniciarEdicionDetalle(detalle: PedidoDetalle) {
    const cantidadRecibidaPrevia = getNumber(
      detalle.cantidadRecibida ?? detalle.cantidadDisponible,
    );

    setDetalleEditandoId(detalle.idTemporal);

    setDetalleForm({
      productoId: detalle.productoId,
      productoNombre: detalle.productoNombre,
      loteCodigo: detalle.loteCodigo,
      cantidad: String(detalle.cantidad),
      cantidadRecibida: "",
      cantidadRecibidaPrevia: String(cantidadRecibidaPrevia),
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

    return {
      ...pedido,
      detalles: pedido.detalles.map((detalle) =>
        detalle.idTemporal === detalleEditandoId
          ? construirDetalleDesdeFormulario(detalle)
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
        title="Pedidos"
        description="Registra y consulta compras completas. Cada pedido puede contener artículos divididos en diferentes lotes para mantener costos reales."
        icon={PiAirplaneTiltFill}
        iconTo="/"
        iconAriaLabel="Volver al inicio"
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pedidos registrados"
          value={String(pedidos.length)}
          hint="Compras registradas en el sistema"
          icon={TbClipboardList}
          variant="info"
        />

        <StatCard
          label="Lotes registrados"
          value={String(totalLotes)}
          hint="Lotes generados desde pedidos"
          icon={TbPackages}
          variant="info"
        />

        <StatCard
          label="En tránsito"
          value={String(totalEnTransito)}
          hint="Pedidos pendientes de recepción"
          icon={TbTruckDelivery}
          variant="warning"
        />

        <StatCard
          label="Recibidos"
          value={String(totalRecibidos)}
          hint="Pedidos recibidos y disponibles"
          icon={LuPackageCheck}
          variant="success"
        />
      </div>

      <SectionCard
        title="Listado de pedidos"
        description="Filtrá por producto, número de pedido o proveedor y abrí el detalle en una ventana independiente."
      >
        <div className="mb-5 grid gap-4 lg:grid-cols-3">
          <ProductoPedidoFilter
            label="Filtrar por producto"
            value={filtroProducto}
            options={productosFiltroOptions}
            onChange={setFiltroProducto}
            placeholder="Barra led, careta negra..."
          />

          <InputField
            label="Número de pedido"
            type="text"
            value={filtroNumeroPedido}
            onChange={actualizarFiltroNumeroPedido}
            placeholder="1 - 9999"
            maxLength={4}
          />

          <SelectField
            label="Filtrar por proveedor"
            value={filtroProveedorId}
            onChange={setFiltroProveedorId}
            placeholder="Todos los proveedores"
            options={proveedoresFiltroOptions}
          />
        </div>

        {cargando ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-zinc-500">
              Cargando pedidos...
            </p>
          </div>
        ) : (
          <TablaPedidos
            pedidos={pedidosFiltrados}
            onView={abrirDetallePedido}
            onEdit={abrirModalEditarPedido}
            onDelete={setPedidoParaEliminar}
          />
        )}
      </SectionCard>

      <AppModal
        isOpen={Boolean(pedidoDetalle)}
        onClose={cerrarDetallePedido}
        title={
          pedidoDetalle
            ? `Detalle del Pedido ${pedidoDetalle.numeroPedido}`
            : "Detalle del pedido"
        }
        description="Información general, artículos y lotes asociados al pedido."
        maxWidthClassName="max-w-7xl"
      >
        {pedidoDetalle ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                  Proveedor
                </p>
                <p className="mt-2 font-semibold text-zinc-950">
                  {pedidoDetalle.proveedorNombre}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                  Fecha
                </p>
                <p className="mt-2 font-semibold text-zinc-950">
                  {pedidoDetalle.fecha}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                  Origen
                </p>
                <p className="mt-2 font-semibold text-zinc-950">
                  {pedidoDetalle.origen}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">
                  Inversión total
                </p>
                <p className="mt-2 font-bold text-emerald-900">
                  {formatCurrency(pedidoDetalle.inversionTotal)}
                </p>
              </div>
            </div>

            {pedidoDetalle.observaciones ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                  Observaciones
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                  {pedidoDetalle.observaciones}
                </p>
              </div>
            ) : null}

            <PedidoDetalleTable
              detalles={pedidoDetalle.detalles}
              monedaCompra={pedidoDetalle.monedaCompra}
            />
          </div>
        ) : null}
      </AppModal>

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
            proveedores={proveedoresActivos}
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