import { useEffect, useMemo, useState } from "react";
import { PiAirplaneTiltFill } from "react-icons/pi";
import { TbClipboardList, TbPackages, TbTruckDelivery } from "react-icons/tb";
import { LuPackageCheck } from "react-icons/lu";

import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import ConfirmDialog from "../common/ConfirmDialog";
import InputField from "../common/InputField";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import StatCard from "../common/StatCard";
import { formatCurrency } from "../common/formatters";
import FormularioCategoria from "../categorias/FormularioCategoria";
import { useAuth } from "../../auth/useAuth";
import {
  crearCategoriaApi,
  obtenerCategorias,
} from "../../services/categoriasApi";
import type {
  CategoriaFormData,
  CategoriaFormErrors,
} from "../categorias/categorias.types";
import { obtenerProveedores } from "../../services/proveedoresApi";
import {
  actualizarPedidoApi,
  cancelarPedidoApi,
  crearPedidoApi,
  obtenerPedidos,
  obtenerSiguienteNumeroPedidoApi,
} from "../../services/pedidosApi";
import FormularioDetallePedido from "./FormularioDetallePedido";
import FormularioPedido from "./FormularioPedido";
import ModalRecepcionPedido from "./ModalRecepcionPedido";
import PedidoDetalleTable from "./PedidoDetalleTable";
import ProductoPedidoFilter from "./ProductoPedidoFilter";
import TablaPedidos, { puedeEditarPedido } from "./TablaPedidos";
import type {
  CategoriaPedidoOption,
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
  categoriaId: "",
  marca: "",
  loteCodigo: "",
  cantidad: "1",
  cantidadRecibida: "",
  cantidadRecibidaPrevia: "0",
  costoUnitarioOrigen: "",
  precioVentaRecomendado: "",
  estadoLote: "EN_PROCESO",
};

const categoriaRapidaInicial: CategoriaFormData = {
  nombre: "",
  descripcion: "",
  activo: true,
};

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

function esCostaRica(pais: string) {
  return pais
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() === "costa rica";
}

function PedidosPage() {
  const { user } = useAuth();

  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtroNumeroPedido, setFiltroNumeroPedido] = useState("");
  const [filtroProveedorId, setFiltroProveedorId] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [pasoModal, setPasoModal] = useState<1 | 2>(1);

  const [pedidos, setPedidos] = useState<PedidoCompra[]>([]);
  const [proveedoresActivos, setProveedoresActivos] = useState<
    Array<{
      id: number;
      nombre: string;
      pais: string;
      monedaPreferida: MonedaCompra;
    }>
  >([]);
  const [proveedoresFiltro, setProveedoresFiltro] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [categoriasActivas, setCategoriasActivas] = useState<
    CategoriaPedidoOption[]
  >([]);
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoCompra | null>(null);

  const [pageAlert, setPageAlert] = useState<string | null>(null);
  const [modalAlert, setModalAlert] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const [categoriaRapidaAbierta, setCategoriaRapidaAbierta] = useState(false);
  const [categoriaRapida, setCategoriaRapida] = useState<CategoriaFormData>(
    categoriaRapidaInicial,
  );
  const [categoriaRapidaErrors, setCategoriaRapidaErrors] =
    useState<CategoriaFormErrors>({});
  const [categoriaRapidaAlert, setCategoriaRapidaAlert] =
    useState<string | null>(null);
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);

  const [pedido, setPedido] = useState<PedidoCompra>({ ...pedidoInicial });
  const [pedidoEditandoId, setPedidoEditandoId] = useState<number | null>(null);
  const [pedidoRecepcionId, setPedidoRecepcionId] = useState<number | null>(null);
  const [pedidoACancelar, setPedidoACancelar] =
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

      const [pedidosData, proveedoresData, categoriasData] = await Promise.all([
        obtenerPedidos(),
        obtenerProveedores(),
        obtenerCategorias(),
      ]);

      setPedidos(pedidosData);

      const proveedoresMapeados = proveedoresData
        .map((item) => ({
          id: item.id,
          nombre: item.nombre,
          pais: item.pais,
          monedaPreferida: item.monedaPreferida as MonedaCompra,
          estado: item.estado,
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

      setProveedoresFiltro(
        proveedoresMapeados.map(({ id, nombre }) => ({ id, nombre })),
      );

      setProveedoresActivos(
        proveedoresMapeados
          .filter((item) => item.estado === "ACTIVO")
          .map(({ id, nombre, pais, monedaPreferida }) => ({
            id,
            nombre,
            pais,
            monedaPreferida,
          })),
      );

      setCategoriasActivas(
        categoriasData
          .filter((categoria) => categoria.activo)
          .map((categoria) => ({
            id: categoria.idCategoria,
            nombre: categoria.nombre,
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
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
    void cargarDatos();
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

  async function abrirModalNuevoPedido() {
    try {
      const { numeroPedido } = await obtenerSiguienteNumeroPedidoApi();

      setPedido({
        ...pedidoInicial,
        numeroPedido: String(numeroPedido),
      });
      setDetalleForm({ ...detalleInicial });
      setCategoriaRapidaAbierta(false);
      setCategoriaRapida({ ...categoriaRapidaInicial });
      setCategoriaRapidaErrors({});
      setCategoriaRapidaAlert(null);
      setPedidoEditandoId(null);
      setDetalleEditandoId(null);
      setCabeceraErrors({});
      setDetalleErrors({});
      setModalAlert(null);
      setPasoModal(1);
      setModalAbierto(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo calcular el siguiente número de pedido.";

      setPageAlert(message);
    }
  }

  function abrirModalEditarPedido(pedidoSeleccionado: PedidoCompra) {
    if (!puedeEditarPedido(pedidoSeleccionado)) {
      return;
    }

    const compraLocal = esCostaRica(pedidoSeleccionado.origen);

    setPedido({
      ...pedidoSeleccionado,
      monedaCompra: compraLocal
        ? "CRC"
        : pedidoSeleccionado.monedaCompra,
      tipoCambio: compraLocal
        ? "1"
        : pedidoSeleccionado.tipoCambio,
      detalles: pedidoSeleccionado.detalles.map((detalle) => ({
        ...detalle,
      })),
    });

    setDetalleForm({ ...detalleInicial });
    setCategoriaRapidaAbierta(false);
    setCategoriaRapida({ ...categoriaRapidaInicial });
    setCategoriaRapidaErrors({});
    setCategoriaRapidaAlert(null);
    setPedidoEditandoId(pedidoSeleccionado.id);
    setDetalleEditandoId(null);
    setCabeceraErrors({});
    setDetalleErrors({});
    setModalAlert(null);
    setPasoModal(1);
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    setModalAbierto(false);
    setPasoModal(1);
    setPedido({ ...pedidoInicial });
    setDetalleForm({ ...detalleInicial });
    setCategoriaRapidaAbierta(false);
    setCategoriaRapida({ ...categoriaRapidaInicial });
    setCategoriaRapidaErrors({});
    setCategoriaRapidaAlert(null);
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
      if (field === "proveedorId") {
        const proveedorId = Number(value);
        const proveedor = proveedoresActivos.find(
          (item) => item.id === proveedorId,
        );

        const pais = proveedor?.pais ?? "";
        const compraLocal = esCostaRica(pais);

        return {
          ...prev,
          proveedorId,
          proveedorNombre: proveedor?.nombre ?? "",
          origen: pais,
          monedaCompra: compraLocal
            ? "CRC"
            : (proveedor?.monedaPreferida ?? prev.monedaCompra),
          tipoCambio: compraLocal ? "1" : "",
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
      categoriaId: undefined,
      marca: undefined,
    }));

    setDetalleForm((prev) => ({
      ...prev,
      productoId: productoSugerido.id,
      productoNombre: productoSugerido.nombre,
      categoriaId: productoSugerido.categoriaId
        ? String(productoSugerido.categoriaId)
        : "",
      marca: productoSugerido.marca ?? "",
      precioVentaRecomendado:
        !prev.precioVentaRecomendado.trim() &&
        productoSugerido.precioVentaSugerido > 0
          ? String(productoSugerido.precioVentaSugerido)
          : prev.precioVentaRecomendado,
    }));
  }

  function abrirCategoriaRapida() {
    if (user?.rol !== "ADMIN") {
      return;
    }

    setCategoriaRapida({ ...categoriaRapidaInicial });
    setCategoriaRapidaErrors({});
    setCategoriaRapidaAlert(null);
    setCategoriaRapidaAbierta(true);
  }

  function cerrarCategoriaRapida() {
    if (guardandoCategoria) return;

    setCategoriaRapidaAbierta(false);
    setCategoriaRapida({ ...categoriaRapidaInicial });
    setCategoriaRapidaErrors({});
    setCategoriaRapidaAlert(null);
  }

  function actualizarCategoriaRapida(
    field: keyof CategoriaFormData,
    value: string | boolean,
  ) {
    setCategoriaRapida((prev) => ({
      ...prev,
      [field]: value,
    }));

    setCategoriaRapidaAlert(null);

    if (field === "nombre" || field === "descripcion") {
      setCategoriaRapidaErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }

  function validarCategoriaRapida() {
    const errors: CategoriaFormErrors = {};
    const nombre = categoriaRapida.nombre.trim();
    const descripcion = categoriaRapida.descripcion.trim();

    if (!nombre) {
      errors.nombre = "El nombre de la categoría es obligatorio.";
    } else if (nombre.length > 100) {
      errors.nombre = "El nombre no puede superar 100 caracteres.";
    }

    if (descripcion.length > 255) {
      errors.descripcion = "La descripción no puede superar 255 caracteres.";
    }

    setCategoriaRapidaErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    if (!categoriaRapida.activo) {
      setCategoriaRapidaAlert(
        "La categoría debe quedar activa para poder utilizarla en el pedido.",
      );
      return false;
    }

    return true;
  }

  async function guardarCategoriaRapida() {
    if (!validarCategoriaRapida()) return;

    setGuardandoCategoria(true);
    setCategoriaRapidaAlert(null);

    try {
      const creada = await crearCategoriaApi(categoriaRapida);

      setCategoriasActivas((prev) =>
        [
          ...prev.filter((categoria) => categoria.id !== creada.idCategoria),
          {
            id: creada.idCategoria,
            nombre: creada.nombre,
          },
        ].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
      );

      setDetalleForm((prev) => ({
        ...prev,
        categoriaId: String(creada.idCategoria),
      }));

      setDetalleErrors((prev) => ({
        ...prev,
        categoriaId: undefined,
      }));

      setCategoriaRapidaAbierta(false);
      setCategoriaRapida({ ...categoriaRapidaInicial });
      setCategoriaRapidaErrors({});
    } catch (error) {
      setCategoriaRapidaAlert(
        error instanceof Error
          ? error.message
          : "No fue posible crear la categoría.",
      );
    } finally {
      setGuardandoCategoria(false);
    }
  }

  function cerrarModalActual() {
    if (categoriaRapidaAbierta) {
      cerrarCategoriaRapida();
      return;
    }

    cerrarModal();
  }

  function validarCabecera() {
    const errors: PedidoCabeceraFormErrors = {};
    if (!pedido.fecha || !pedido.fecha.trim()) {
      errors.fecha = "La fecha es obligatoria.";
    }

    if (!pedido.origen.trim()) {
      errors.origen = "El origen es obligatorio.";
    } else if (pedido.origen.trim().length > 100) {
      errors.origen = "Máximo 100 caracteres.";
    }

    if (!pedido.proveedorId || Number(pedido.proveedorId) < 1) {
      errors.proveedorId = "Debe seleccionar un proveedor.";
    }

    if (!pedido.monedaCompra) {
      errors.monedaCompra = "Debe seleccionar una moneda.";
    }

    const compraLocal = esCostaRica(pedido.origen);
    const tc = Number(pedido.tipoCambio);

    if (!compraLocal) {
      if (!pedido.tipoCambio.trim()) {
        errors.tipoCambio =
          "El tipo de cambio es obligatorio para compras internacionales.";
      } else if (
        Number.isNaN(tc) ||
        tc <= 0 ||
        tc > 999.99
      ) {
        errors.tipoCambio =
          "Debe ser un número mayor a 0 y menor o igual a 999.99.";
      }
    }

    if (pedido.observaciones && pedido.observaciones.length > 150) {
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

    const nombre = detalleForm.productoNombre.trim();
    if (!nombre) {
      errors.productoNombre = "El nombre del artículo es obligatorio.";
    } else if (nombre.length > 150) {
      errors.productoNombre = "Máximo 150 caracteres.";
    }

    const categoriaId = Number(detalleForm.categoriaId);
    const categoriaValida = categoriasActivas.some(
      (categoria) => categoria.id === categoriaId,
    );

    if (!detalleForm.categoriaId || !categoriaValida) {
      errors.categoriaId = "Debe seleccionar una categoría activa.";
    }

    if (detalleForm.marca.trim().length > 100) {
      errors.marca = "Máximo 100 caracteres.";
    }

    if (
      !detalleForm.loteCodigo ||
      !/^L([1-9]|10)$/.test(detalleForm.loteCodigo)
    ) {
      errors.loteCodigo = "Debe seleccionar un lote válido (L1 a L10).";
    }

    const cant = Number(detalleForm.cantidad);
    if (!detalleForm.cantidad.trim()) {
      errors.cantidad = "La cantidad es obligatoria.";
    } else if (!Number.isInteger(cant) || cant < 1 || cant > 99999) {
      errors.cantidad = "Debe ser un número entero entre 1 y 99999.";
    }

    const costo = Number(detalleForm.costoUnitarioOrigen);
    if (!detalleForm.costoUnitarioOrigen.trim()) {
      errors.costoUnitarioOrigen = "El precio de costo es obligatorio.";
    } else if (Number.isNaN(costo) || costo < 0) {
      errors.costoUnitarioOrigen = "Debe ser mayor o igual a cero.";
    }

    const precio = Number(detalleForm.precioVentaRecomendado);
    if (!detalleForm.precioVentaRecomendado.trim()) {
      errors.precioVentaRecomendado = "El precio de venta es obligatorio.";
    } else if (Number.isNaN(precio) || precio < 0) {
      errors.precioVentaRecomendado = "Debe ser mayor o igual a cero.";
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

    const cantidadRecibida = detalleBase
      ? Number(detalleBase.cantidadRecibida ?? 0)
      : 0;
    const estadoLote = detalleBase ? detalleBase.estadoLote : "EN_PROCESO";
    const cantidadPendiente = Math.max(cantidad - cantidadRecibida, 0);
    const cantidadDisponible = detalleBase
      ? Number(detalleBase.cantidadDisponible ?? 0)
      : 0;

    const categoriaId = Number(detalleForm.categoriaId);
    const categoriaNombre =
      categoriasActivas.find((categoria) => categoria.id === categoriaId)
        ?.nombre ??
      detalleBase?.categoriaNombre ??
      "";

    return {
      ...(detalleBase ?? {
        idTemporal: crypto.randomUUID(),
      }),
      productoId: detalleForm.productoId
        ? Number(detalleForm.productoId)
        : undefined,
      productoNombre: detalleForm.productoNombre.trim(),
      categoriaId,
      categoriaNombre,
      marca: detalleForm.marca.trim(),
      loteCodigo: detalleForm.loteCodigo,
      cantidad,
      cantidadRecibida,
      cantidadPendiente,
      cantidadDisponible,
      costoUnitarioOrigen,
      costoUnitarioReal,
      precioVentaRecomendado,
      estadoLote,
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
      categoriaId: detalle.categoriaId ? String(detalle.categoriaId) : "",
      marca: detalle.marca ?? "",
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

  async function confirmarCancelacionPedido() {
    if (!pedidoACancelar || cancelando) return;

    setCancelando(true);
    try {
      await cancelarPedidoApi(pedidoACancelar.id);
      await cargarDatos();

      setPageAlert(
        `El pedido #${pedidoACancelar.numeroPedido} fue cancelado correctamente.`,
      );

      setPedidoACancelar(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cancelar el pedido.";

      setPageAlert(message);
    } finally {
      setCancelando(false);
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
          variant="info"
          title="Aviso"
          message={pageAlert}
          onClose={() => setPageAlert(null)}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <LoadingState message="Cargando pedidos..." />
        ) : (
          <TablaPedidos
            pedidos={pedidosFiltrados}
            onView={abrirDetallePedido}
            onEdit={abrirModalEditarPedido}
            onCancel={setPedidoACancelar}
            onReceive={(pedidoParaRecibir) =>
              setPedidoRecepcionId(pedidoParaRecibir.id)
            }
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
        onClose={cerrarModalActual}
        isSubmitting={guardando || guardandoCategoria}
        title={
          categoriaRapidaAbierta
            ? "Nueva categoría"
            : pasoModal === 1
              ? pedidoEditandoId
                ? "Editar pedido"
                : "Nuevo pedido"
              : "Artículos del pedido"
        }
        description={
          categoriaRapidaAbierta
            ? "Creá una categoría sin perder la información del pedido. Al guardarla quedará seleccionada automáticamente."
            : pasoModal === 1
              ? "Primero registra la información general del pedido."
              : "Ahora agrega los artículos, lotes, costos y precios de venta."
        }
        maxWidthClassName={
          categoriaRapidaAbierta
            ? "max-w-xl"
            : pasoModal === 1
              ? "max-w-4xl"
              : "max-w-6xl"
        }
      >
        {categoriaRapidaAbierta ? (
          <div className="space-y-4">
            {categoriaRapidaAlert ? (
              <AlertMessage
                variant="error"
                title="No se pudo crear la categoría"
                message={categoriaRapidaAlert}
              />
            ) : null}

            <FormularioCategoria
              value={categoriaRapida}
              errors={categoriaRapidaErrors}
              isSubmitting={guardandoCategoria}
              submitLabel="Crear categoría"
              onChange={actualizarCategoriaRapida}
              onSubmit={guardarCategoriaRapida}
              onCancel={cerrarCategoriaRapida}
            />
          </div>
        ) : pasoModal === 1 ? (
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
            categorias={categoriasActivas}
            canCreateCategory={user?.rol === "ADMIN"}
            errors={detalleErrors}
            alertMessage={modalAlert}
            isEditingDetail={Boolean(detalleEditandoId)}
            onDetalleChange={actualizarDetalle}
            onSeleccionarProducto={seleccionarProductoSugerido}
            onCreateCategory={abrirCategoriaRapida}
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
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(pedidoACancelar)}
        title="Cancelar pedido"
        message={
          pedidoACancelar
            ? `¿Seguro que querés cancelar el pedido #${pedidoACancelar.numeroPedido}? El pedido conservará su historial y quedará marcado como CANCELADO.`
            : ""
        }
        confirmLabel="Cancelar pedido"
        cancelLabel="Volver"
        variant="warning"
        isLoading={cancelando}
        onConfirm={confirmarCancelacionPedido}
        onCancel={() => setPedidoACancelar(null)}
      />

      <ModalRecepcionPedido
        isOpen={pedidoRecepcionId !== null}
        pedidoId={pedidoRecepcionId}
        onClose={() => setPedidoRecepcionId(null)}
        onSuccess={(pedidoActualizado) => {
          setPedidos((current) =>
            current.map((item) =>
              item.id === pedidoActualizado.id
                ? pedidoActualizado
                : item,
            ),
          );

          setPedidoRecepcionId(null);

          setPageAlert(
            pedidoActualizado.estado === "RECIBIDO"
              ? `El pedido #${pedidoActualizado.numeroPedido} fue recibido completamente.`
              : `La recepción parcial del pedido #${pedidoActualizado.numeroPedido} se registró correctamente.`,
          );
        }}
      />
    </div>
  );
}

export default PedidosPage;