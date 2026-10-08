import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import InputField from "../common/InputField";
import MoneyInputField from "../common/MoneyInputField";
import PrimaryButton from "../common/PrimaryButton";
import SelectField from "../common/SelectField";
import { formatCurrency } from "../common/formatters";
import { getPaymentMethodLabel } from "../../i18n/statusMap";
import { obtenerTarifasIva } from "../../services/tarifasIvaApi";
import type { TarifaIVA } from "../tarifas-iva/tarifas-iva.types";
import type {
  CrearVentaPayload,
  InventarioDisponibleVenta,
  MedioPagoVenta,
  ModoDescuentoLote,
  TipoTarifaVenta,
  VentaDetalleForm,
} from "./ventas.types";

type FormularioVentaProps = {
  inventarioDisponible: InventarioDisponibleVenta[];
  numeroVentaSugerido: string;
  tarifasIva?: TarifaIVA[];
  alertMessage?: string | null;
  guardando: boolean;
  onSubmit: (payload: CrearVentaPayload) => void;
  onCancel: () => void;
};

type CabeceraVentaForm = {
  numeroVenta: string;
  fechaVenta: string;
  clienteNombre: string;
  metodoPago: MedioPagoVenta;
  montoPagado: string;
  montoEfectivo: string;
  montoSinpeTransferencia: string;
  fechaEntrega: string;
  fechaVencimientoPago: string;
  observaciones: string;
};


function crearDetalleInicial(): VentaDetalleForm {
  return {
    idTemporal: crypto.randomUUID(),
    productoId: "",
    productoNombre: "",
    loteId: "",
    loteDescripcion: "",
    cantidad: "1",
    precioUnitario: "",
    porcentajeDescuento: "0",
    tipoTarifa: "EXENTO",
    idTarifaIva: undefined,
    tarifaSeleccionada: "EXENTO",
    porcentajeIva: "0",
    modoDescuentoLote: "FIFO",
    detalle: "",
  };
}

function limpiarEntero(value: string, maxDigits: number) {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

function parseMonto(value: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const limpio = String(value).replace(/\s/g, "").replace(",", ".");
  const numberValue = Number(limpio);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function limpiarPorcentaje(value: string) {
  const limpio = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [entero = "", ...decimalParts] = limpio.split(".");
  const decimal = decimalParts.join("").slice(0, 2);

  if (limpio.includes(".")) {
    return `${entero.slice(0, 3)}${decimal ? `.${decimal}` : "."}`;
  }

  return entero.slice(0, 3);
}

function parsePorcentaje(value: string) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function redondear(value: number) {
  return Number(value.toFixed(2));
}

function getDateValue(date?: string | null) {
  if (!date) return 0;

  const value = new Date(date).getTime();

  return Number.isFinite(value) ? value : 0;
}

function getPorcentajeIva(detalle: VentaDetalleForm) {
  if (detalle.porcentajeIva !== undefined && detalle.porcentajeIva !== "") {
    return parsePorcentaje(detalle.porcentajeIva);
  }
  if (detalle.tipoTarifa === "EXENTO") return 0;
  if (detalle.tipoTarifa === "IVA") return 13;
  return parsePorcentaje(detalle.porcentajeIva);
}

function calcularLineaTemporal(detalle: VentaDetalleForm) {
  const cantidad = Number(detalle.cantidad);
  const precioUnitario = parseMonto(detalle.precioUnitario);
  const porcentajeDescuento = parsePorcentaje(
    detalle.porcentajeDescuento,
  );
  const porcentajeIva = getPorcentajeIva(detalle);

  const subtotal = redondear(cantidad * precioUnitario);
  const descuento = redondear(
    subtotal * (porcentajeDescuento / 100),
  );
  const baseImponible = redondear(Math.max(subtotal - descuento, 0));
  const iva = redondear(baseImponible * (porcentajeIva / 100));
  const total = redondear(baseImponible + iva);

  return {
    subtotal,
    descuento,
    porcentajeDescuento,
    baseImponible,
    iva,
    total,
  };
}



function calcularInventarioAjustado(
  inventarioDisponible: InventarioDisponibleVenta[],
  detalles: VentaDetalleForm[],
  detalleEditandoId: string | null,
): InventarioDisponibleVenta[] {
  const lotes = inventarioDisponible
    .map((lote) => ({
      ...lote,
      cantidadDisponible: Number(lote.cantidadDisponible),
    }))
    .sort((a, b) => {
      const fechaDiff = getDateValue(a.fechaEntrada) - getDateValue(b.fechaEntrada);

      if (fechaDiff !== 0) return fechaDiff;

      return a.loteId - b.loteId;
    });

  const detallesReservados = detalles.filter(
    (detalle) => detalle.idTemporal !== detalleEditandoId,
  );

  const stockMap = new Map<number, number>(
    lotes.map((lote) => [lote.loteId, lote.cantidadDisponible]),
  );

  detallesReservados.forEach((detalle) => {
    const productoId = Number(detalle.productoId);
    let cantidadPendiente = Number(detalle.cantidad);

    if (!productoId || !Number.isFinite(cantidadPendiente) || cantidadPendiente <= 0) {
      return;
    }

    if (detalle.modoDescuentoLote === "MANUAL" && detalle.loteId) {
      const loteId = Number(detalle.loteId);
      const stockActual = stockMap.get(loteId) ?? 0;
      stockMap.set(loteId, Math.max(stockActual - cantidadPendiente, 0));
      return;
    }

    for (const lote of lotes) {
      if (cantidadPendiente <= 0) break;
      if (lote.productoId !== productoId) continue;

      const stockActual = stockMap.get(lote.loteId) ?? 0;
      if (stockActual <= 0) continue;

      const cantidadUsada = Math.min(stockActual, cantidadPendiente);
      stockMap.set(lote.loteId, stockActual - cantidadUsada);
      cantidadPendiente -= cantidadUsada;
    }
  });

  return lotes
    .map((lote) => ({
      ...lote,
      cantidadDisponible: stockMap.get(lote.loteId) ?? 0,
    }))
    .filter((lote) => lote.cantidadDisponible > 0);
}

function FormularioVenta({
  inventarioDisponible,
  numeroVentaSugerido,
  tarifasIva,
  alertMessage,
  guardando,
  onSubmit,
  onCancel,
}: FormularioVentaProps) {
  const { t } = useTranslation();

  const [catalogoTarifas, setCatalogoTarifas] = useState<TarifaIVA[]>(
    tarifasIva ?? [],
  );

  useEffect(() => {
    if (tarifasIva && tarifasIva.length > 0) {
      setCatalogoTarifas(tarifasIva);
    } else {
      obtenerTarifasIva()
        .then((data) =>
          setCatalogoTarifas(data.filter((tarifa) => tarifa.estado === "ACTIVA")),
        )
        .catch(() => {});
    }
  }, [tarifasIva]);

  const tarifasActivas = useMemo(() => {
    return (catalogoTarifas || []).filter((tarifa) => tarifa.estado === "ACTIVA");
  }, [catalogoTarifas]);

  const metodosPagoOptions = useMemo(
    () => [
      { value: "EFECTIVO", label: getPaymentMethodLabel(t, "EFECTIVO") },
      { value: "SINPE", label: getPaymentMethodLabel(t, "SINPE") },
      { value: "TRANSFERENCIA", label: getPaymentMethodLabel(t, "TRANSFERENCIA") },
      { value: "TARJETA", label: getPaymentMethodLabel(t, "TARJETA") },
      { value: "MIXTO", label: getPaymentMethodLabel(t, "MIXTO") },
      { value: "OTRO", label: getPaymentMethodLabel(t, "OTRO") },
    ],
    [t],
  );

  const tipoTarifaOptions = useMemo(() => {
    if (tarifasActivas.length > 0) {
      const dinamicas = tarifasActivas.map((tarifa) => ({
        value: String(tarifa.id),
        label: `${tarifa.codigo} — ${tarifa.descripcion || tarifa.codigo} (${tarifa.porcentaje}%)`,
      }));

      return [
        ...dinamicas,
        {
          value: "ESPECIAL",
          label: t("sales.specialRate", "Tarifa especial personalizada"),
        },
      ];
    }

    return [
      {
        value: "EXENTO",
        label: `${t("vatRates.title", "Tarifa")} ${t("vatRates.exempt", "Exento")} 0%`,
      },
      { value: "IVA", label: `${t("sales.tax", "IVA")} 13%` },
      { value: "ESPECIAL", label: t("sales.specialRate", "Tarifa especial") },
    ];
  }, [tarifasActivas, t]);

  const modoDescuentoOptions = useMemo(
    () => [
      { value: "FIFO", label: t("sales.selectFifo", "Automático FIFO") },
      { value: "MANUAL", label: t("sales.selectManual", "Seleccionar lote manualmente") },
    ],
    [t],
  );

  const today = new Date().toISOString().slice(0, 10);

  const [paso, setPaso] = useState<1 | 2>(1);

  const [cabecera, setCabecera] = useState<CabeceraVentaForm>({
    numeroVenta: numeroVentaSugerido,
    fechaVenta: today,
    clienteNombre: "",
    metodoPago: "SINPE",
    montoPagado: "0",
    montoEfectivo: "0",
    montoSinpeTransferencia: "0",
    fechaEntrega: today,
    fechaVencimientoPago: "",
    observaciones: "",
  });

  const [detalleForm, setDetalleForm] = useState<VentaDetalleForm>(
    crearDetalleInicial(),
  );

  const [detalles, setDetalles] = useState<VentaDetalleForm[]>([]);
  const [detalleEditandoId, setDetalleEditandoId] = useState<string | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmarDeuda, setConfirmarDeuda] = useState(false);

  const inventarioAjustado = useMemo(
    () =>
      calcularInventarioAjustado(
        inventarioDisponible,
        detalles,
        detalleEditandoId,
      ),
    [inventarioDisponible, detalles, detalleEditandoId],
  );

  const productosDisponibles = useMemo(() => {
    const productosMap = new Map<
      number,
      {
        id: number;
        nombre: string;
        stockTotal: number;
      }
    >();

    inventarioAjustado.forEach((lote) => {
      const previo = productosMap.get(lote.productoId);

      productosMap.set(lote.productoId, {
        id: lote.productoId,
        nombre: lote.productoNombre,
        stockTotal: (previo?.stockTotal ?? 0) + lote.cantidadDisponible,
      });
    });

    return Array.from(productosMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    );
  }, [inventarioAjustado]);

  const productoSeleccionadoId = Number(detalleForm.productoId);

  const lotesDelProducto = useMemo(
    () =>
      inventarioAjustado.filter(
        (lote) => lote.productoId === productoSeleccionadoId,
      ),
    [inventarioAjustado, productoSeleccionadoId],
  );

  const productoSeleccionado = productosDisponibles.find(
    (producto) => producto.id === productoSeleccionadoId,
  );

  const stockProductoSeleccionado = productoSeleccionado?.stockTotal ?? 0;

  const resumenVenta = useMemo(() => {
    const lineas = detalles.map(calcularLineaTemporal);

    const subtotal = redondear(
      lineas.reduce((acc, linea) => acc + linea.subtotal, 0),
    );

    const descuentoTotal = redondear(
      lineas.reduce((acc, linea) => acc + linea.descuento, 0),
    );

    const ivaTotal = redondear(lineas.reduce((acc, linea) => acc + linea.iva, 0));

    const totalVenta = redondear(
      lineas.reduce((acc, linea) => acc + linea.total, 0),
    );

    return {
      subtotal,
      descuentoTotal,
      ivaTotal,
      totalVenta,
    };
  }, [detalles]);

  const montoRecibido = useMemo(() => {
    if (cabecera.metodoPago === "MIXTO") {
      return (
        parseMonto(cabecera.montoEfectivo) +
        parseMonto(cabecera.montoSinpeTransferencia)
      );
    }

    return parseMonto(cabecera.montoPagado);
  }, [
    cabecera.metodoPago,
    cabecera.montoEfectivo,
    cabecera.montoPagado,
    cabecera.montoSinpeTransferencia,
  ]);

  const saldoPendiente = Math.max(resumenVenta.totalVenta - montoRecibido, 0);
  const cambio = Math.max(montoRecibido - resumenVenta.totalVenta, 0);
  const hayDeuda = saldoPendiente > 0;

  function actualizarCabecera(field: keyof CabeceraVentaForm, value: string) {
    setFormError(null);
    setConfirmarDeuda(false);

    setCabecera((prev) => {
      if (
        field === "montoPagado" ||
        field === "montoEfectivo" ||
        field === "montoSinpeTransferencia"
      ) {
        return {
          ...prev,
          [field]: value,
        };
      }

      if (field === "metodoPago") {
        return {
          ...prev,
          metodoPago: value as MedioPagoVenta,
          montoPagado: "0",
          montoEfectivo: "0",
          montoSinpeTransferencia: "0",
          fechaVencimientoPago: "",
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  function actualizarDetalle(field: keyof VentaDetalleForm, value: string) {
    setFormError(null);
    setConfirmarDeuda(false);

    setDetalleForm((prev) => {
      if (field === "productoId") {
        const productoId = Number(value);
        const producto = productosDisponibles.find(
          (item) => item.id === productoId,
        );
        const primerLote = inventarioAjustado.find(
          (lote) => lote.productoId === productoId,
        );

        return {
          ...prev,
          productoId: value,
          productoNombre: producto?.nombre ?? "",
          loteId: "",
          loteDescripcion: "",
          precioUnitario: primerLote?.precioVentaRecomendado
            ? String(primerLote.precioVentaRecomendado)
            : prev.precioUnitario,
        };
      }

      if (field === "loteId") {
        const lote = inventarioAjustado.find(
          (item) => item.loteId === Number(value),
        );

        return {
          ...prev,
          loteId: value,
          loteDescripcion: lote
            ? `Pedido ${lote.numeroPedido}  ${lote.loteCodigo}`
            : "",
          precioUnitario: lote?.precioVentaRecomendado
            ? String(lote.precioVentaRecomendado)
            : prev.precioUnitario,
        };
      }

      if (field === "cantidad") {
        return {
          ...prev,
          cantidad: limpiarEntero(value, 5),
        };
      }

      if (field === "precioUnitario") {
        return {
          ...prev,
          precioUnitario: value,
        };
      }

      if (field === "porcentajeDescuento") {
        return {
          ...prev,
          porcentajeDescuento: limpiarPorcentaje(value),
        };
      }

      if (field === "tarifaSeleccionada" || field === "tipoTarifa") {
        if (value === "ESPECIAL") {
          return {
            ...prev,
            tarifaSeleccionada: "ESPECIAL",
            tipoTarifa: "ESPECIAL",
            idTarifaIva: undefined,
            porcentajeIva: "",
          };
        }

        if (value === "EXENTO") {
          return {
            ...prev,
            tarifaSeleccionada: "EXENTO",
            tipoTarifa: "EXENTO",
            idTarifaIva: undefined,
            porcentajeIva: "0",
          };
        }

        if (value === "IVA") {
          return {
            ...prev,
            tarifaSeleccionada: "IVA",
            tipoTarifa: "IVA",
            idTarifaIva: undefined,
            porcentajeIva: "13",
          };
        }

        const tarifaEncontrada = tarifasActivas.find(
          (tarifa) => String(tarifa.id) === value,
        );

        if (tarifaEncontrada) {
          const tipo: TipoTarifaVenta =
            tarifaEncontrada.porcentaje === 0
              ? "EXENTO"
              : tarifaEncontrada.porcentaje === 13
                ? "IVA"
                : "ESPECIAL";

          return {
            ...prev,
            tarifaSeleccionada: value,
            tipoTarifa: tipo,
            idTarifaIva: tarifaEncontrada.id,
            porcentajeIva: String(tarifaEncontrada.porcentaje),
          };
        }

        return {
          ...prev,
          tarifaSeleccionada: value,
        };
      }

      if (field === "porcentajeIva") {
        return {
          ...prev,
          porcentajeIva: limpiarPorcentaje(value),
        };
      }

      if (field === "modoDescuentoLote") {
        const modo = value as ModoDescuentoLote;

        return {
          ...prev,
          modoDescuentoLote: modo,
          loteId: modo === "FIFO" ? "" : prev.loteId,
          loteDescripcion: modo === "FIFO" ? "" : prev.loteDescripcion,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  function validarDetalleActual() {
    const cantidad = Number(detalleForm.cantidad);
    const precioUnitario = parseMonto(detalleForm.precioUnitario);
    const porcentajeDescuento = parsePorcentaje(
      detalleForm.porcentajeDescuento,
    );

    if (!detalleForm.productoId) {
      return "Debe seleccionar un producto.";
    }

    if (cantidad <= 0) {
      return "La cantidad debe ser mayor a cero.";
    }

    if (detalleForm.modoDescuentoLote === "FIFO") {
      if (cantidad > stockProductoSeleccionado) {
        return `Stock insuficiente. Disponible total: ${stockProductoSeleccionado}.`;
      }
    }

    if (detalleForm.modoDescuentoLote === "MANUAL") {
      if (!detalleForm.loteId) {
        return t("validation.required", "Debe seleccionar un lote en modo manual.");
      }

      const lote = lotesDelProducto.find(
        (item) => item.loteId === Number(detalleForm.loteId),
      );

      if (!lote) {
        return t("sales.lotUnavailable", "El lote seleccionado no existe o ya no tiene stock disponible.");
      }

      if (cantidad > lote.cantidadDisponible) {
        return `${t("sales.insufficientStock", "Stock insuficiente")} (${lote.loteCodigo}). ${t("lots.availableQuantity", "Disponible")}: ${lote.cantidadDisponible}.`;
      }
    }

    if (precioUnitario <= 0) {
      return t("validation.positiveNumber", "El precio unitario debe ser mayor a cero.");
    }

    if (
      !Number.isFinite(porcentajeDescuento) ||
      porcentajeDescuento < 0 ||
      porcentajeDescuento > 100
    ) {
      return t("sales.discountInvalid", "El descuento debe ser un porcentaje entre 0 y 100.");
    }

    if (
      detalleForm.tarifaSeleccionada === "ESPECIAL" ||
      (!detalleForm.idTarifaIva && detalleForm.tipoTarifa === "ESPECIAL")
    ) {
      if (!detalleForm.porcentajeIva.trim()) {
        return t("sales.specialRateRequired", "Debe indicar el porcentaje de la tarifa especial.");
      }

      if (parsePorcentaje(detalleForm.porcentajeIva) < 0) {
        return t("sales.specialRateInvalid", "La tarifa especial debe ser válida.");
      }
    }

    return null;
  }

  function agregarOActualizarDetalle() {
    const error = validarDetalleActual();

    if (error) {
      setFormError(error);
      return;
    }

    if (detalleEditandoId) {
      setDetalles((prev) =>
        prev.map((detalle) =>
          detalle.idTemporal === detalleEditandoId ? detalleForm : detalle,
        ),
      );
    } else {
      setDetalles((prev) => [
        ...prev,
        {
          ...detalleForm,
          idTemporal: crypto.randomUUID(),
        },
      ]);
    }

    setDetalleForm(crearDetalleInicial());
    setDetalleEditandoId(null);
    setFormError(null);
  }

  function editarDetalle(detalle: VentaDetalleForm) {
    setDetalleForm({
      ...detalle,
      tarifaSeleccionada:
        detalle.tarifaSeleccionada ||
        (detalle.idTarifaIva ? String(detalle.idTarifaIva) : detalle.tipoTarifa),
    });
    setDetalleEditandoId(detalle.idTemporal);
    setFormError(null);
    setConfirmarDeuda(false);
  }

  function eliminarDetalle(idTemporal: string) {
    setDetalles((prev) =>
      prev.filter((detalle) => detalle.idTemporal !== idTemporal),
    );

    if (detalleEditandoId === idTemporal) {
      setDetalleEditandoId(null);
      setDetalleForm(crearDetalleInicial());
    }
  }

  function pasarADatosGenerales() {
    if (detalles.length === 0) {
      setFormError(t("sales.productsRequired", "Debe agregar al menos un producto vendido."));
      return;
    }

    setFormError(null);
    setPaso(2);
  }

  function validarVentaCompleta() {
    if (!cabecera.fechaVenta) {
      return t("sales.dateRequired", "La fecha de venta es obligatoria.");
    }

    if (!cabecera.metodoPago) {
      return t("sales.paymentMethodRequired", "Debe seleccionar un método de pago.");
    }

    if (cabecera.observaciones.length > 150) {
      return t("validation.maxLength", { count: 150 });
    }

    if (detalles.length === 0) {
      return t("sales.productsRequired", "Debe agregar al menos un producto vendido.");
    }

    if (resumenVenta.totalVenta <= 0) {
      return t("sales.totalPositive", "El total de la venta debe ser mayor a cero.");
    }

    return null;
  }

  function construirPayload(): CrearVentaPayload {
    const montoPagadoBackend = Math.min(montoRecibido, resumenVenta.totalVenta);

    return {
      fechaVenta: cabecera.fechaVenta,
      clienteNombre: cabecera.clienteNombre.trim() || undefined,
      medioPago: cabecera.metodoPago,
      montoPagado: montoPagadoBackend,
      fechaEntrega: cabecera.fechaEntrega || undefined,
      fechaVencimientoPago:
        hayDeuda && cabecera.fechaVencimientoPago
          ? cabecera.fechaVencimientoPago
          : undefined,
      observaciones: cabecera.observaciones.trim() || undefined,
      detalles: detalles.map((detalle) => ({
        productoId: Number(detalle.productoId),
        loteId:
          detalle.modoDescuentoLote === "MANUAL"
            ? Number(detalle.loteId)
            : undefined,
        cantidad: Number(detalle.cantidad),
        precioUnitario: parseMonto(detalle.precioUnitario),
        porcentajeDescuento: parsePorcentaje(
          detalle.porcentajeDescuento,
        ),
        tipoTarifa: detalle.tipoTarifa,
        idTarifaIva: detalle.idTarifaIva,
        porcentajeIva: getPorcentajeIva(detalle),
        modoDescuentoLote: detalle.modoDescuentoLote,
        detalle: detalle.detalle.trim() || undefined,
      })),
    };
  }

  function guardarVenta(confirmadoConDeuda = false) {
    const error = validarVentaCompleta();

    if (error) {
      setFormError(error);
      return;
    }

    if (hayDeuda && !confirmadoConDeuda) {
      setConfirmarDeuda(true);
      setFormError(null);
      return;
    }

    onSubmit(construirPayload());
  }

  function renderResumenVenta() {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {t("sales.subtotal", "Subtotal")}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {formatCurrency(resumenVenta.subtotal)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {t("sales.discount", "Descuento")}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {formatCurrency(resumenVenta.descuentoTotal)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {t("sales.tax", "IVA")}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {formatCurrency(resumenVenta.ivaTotal)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-4 text-white">
          <p className="text-xs font-semibold uppercase text-slate-300">
            {t("sales.total", "Total")}
          </p>
          <p className="mt-1 text-lg font-bold">
            {formatCurrency(resumenVenta.totalVenta)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {alertMessage ? (
        <AlertMessage
          variant="error"
          title={t("common.errorOccurred", "No se pudo guardar la venta")}
          message={alertMessage}
        />
      ) : null}

      {formError ? (
        <AlertMessage
          variant="error"
          title={t("common.errorOccurred", "Revise la información")}
          message={formError}
          onClose={() => setFormError(null)}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            paso === 1
              ? "bg-slate-900 text-white"
              : "border border-slate-300 text-slate-600"
          }`}
        >
          1. {t("products.title", "Producto vendido")}
        </span>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            paso === 2
              ? "bg-slate-900 text-white"
              : "border border-slate-300 text-slate-600"
          }`}
        >
          2. {t("common.details", "Datos generales")}
        </span>
      </div>

      {paso === 1 ? (
        <>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-950">
                {t("products.title", "Producto vendido")}
              </h3>
              <p className="text-sm text-slate-600">
                {t("sales.fifoNotice", "Por defecto se descuenta usando FIFO. Lo agregado en esta venta se reserva temporalmente para no vender más stock del disponible.")}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SelectField
                label={t("products.title", "Producto")}
                value={detalleForm.productoId}
                onChange={(value) => actualizarDetalle("productoId", value)}
                placeholder={t("products.categoryPlaceholder", "Seleccione producto")}
                required
                options={productosDisponibles.map((producto) => ({
                  value: String(producto.id),
                  label: `${producto.nombre}  ${t("products.stock", "Stock")} ${producto.stockTotal}`,
                }))}
              />

              <SelectField
                label={t("sales.discountMode", "Modo de descuento")}
                value={detalleForm.modoDescuentoLote}
                onChange={(value) =>
                  actualizarDetalle("modoDescuentoLote", value)
                }
                options={modoDescuentoOptions}
                required
              />

              {detalleForm.modoDescuentoLote === "MANUAL" ? (
                <SelectField
                  label={t("lots.title", "Lote")}
                  value={detalleForm.loteId}
                  onChange={(value) => actualizarDetalle("loteId", value)}
                  placeholder={t("lots.details", "Seleccione lote")}
                  required
                  options={lotesDelProducto.map((lote) => ({
                    value: String(lote.loteId),
                    label: `${t("navigation.orders", "Pedido")} ${lote.numeroPedido}  ${lote.loteCodigo}  ${t("products.stock", "Stock")} ${lote.cantidadDisponible}`,
                  }))}
                />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Stock FIFO
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("lots.availableQuantity", "Disponible total")}: {stockProductoSeleccionado}
                  </p>
                </div>
              )}

              <InputField
                label={t("common.quantity", "Cantidad")}
                value={detalleForm.cantidad}
                onChange={(value) => actualizarDetalle("cantidad", value)}
                required
                maxLength={5}
                showCharacterCount
              />

              <MoneyInputField
                label={t("lots.salePrice", "Precio unitario")}
                value={detalleForm.precioUnitario}
                onChange={(value) => actualizarDetalle("precioUnitario", value)}
                placeholder="0"
                required
                currencySymbol="₡"
                allowDecimals={true}
              />

              <InputField
                label={`${t("sales.discount", "Descuento")} (%)`}
                value={detalleForm.porcentajeDescuento}
                onChange={(value) =>
                  actualizarDetalle("porcentajeDescuento", value)
                }
                placeholder="0"
                prefix="%"
                helperText={t("sales.discountHint", "Porcentaje de descuento sobre el subtotal de esta línea (0 a 100).")}
              />

              <SelectField
                label={t("sales.vatRate", "Tarifa")}
                value={detalleForm.tarifaSeleccionada || detalleForm.tipoTarifa}
                onChange={(value) => actualizarDetalle("tarifaSeleccionada", value)}
                options={tipoTarifaOptions}
                required
              />

              {detalleForm.tarifaSeleccionada === "ESPECIAL" ||
              (!detalleForm.idTarifaIva && detalleForm.tipoTarifa === "ESPECIAL") ? (
                <InputField
                  label={t("vatRates.percentage", "Porcentaje tarifa especial")}
                  value={detalleForm.porcentajeIva}
                  onChange={(value) => actualizarDetalle("porcentajeIva", value)}
                  placeholder="5"
                  prefix="%"
                  required
                />
              ) : null}

              <InputField
                label={t("common.details", "Detalle")}
                value={detalleForm.detalle}
                onChange={(value) => actualizarDetalle("detalle", value)}
                placeholder={t("common.optional", "Opcional")}
                maxLength={150}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <PrimaryButton onClick={agregarOActualizarDetalle}>
                {detalleEditandoId ? t("sales.updateProduct", "Actualizar producto") : `+ ${t("sales.addToSale", "Agregar a venta")}`}
              </PrimaryButton>

              {detalleEditandoId ? (
                <button
                  type="button"
                  onClick={() => {
                    setDetalleEditandoId(null);
                    setDetalleForm(crearDetalleInicial());
                  }}
                  className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {t("common.cancel", "Cancelar edición")}
                </button>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h3 className="mb-3 text-base font-bold text-slate-950">
              {t("products.title", "Productos agregados")}
            </h3>

            <DataTableShell
              data={detalles}
              emptyMessage={t("sales.productsRequired", "Todavía no has agregado productos a esta venta.")}
              getRowKey={(row) => row.idTemporal}
              columns={[
                {
                  key: "producto",
                  header: t("products.title", "Producto"),
                  render: (row: VentaDetalleForm) => (
                    <div>
                      <p className="font-semibold text-slate-900">
                        {row.productoNombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.modoDescuentoLote === "FIFO"
                          ? "FIFO"
                          : row.loteDescripcion}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "cantidad",
                  header: t("common.quantity", "Cant."),
                  render: (row: VentaDetalleForm) => row.cantidad,
                },
                {
                  key: "precio",
                  header: t("common.price", "Precio"),
                  render: (row: VentaDetalleForm) =>
                    formatCurrency(parseMonto(row.precioUnitario)),
                },
                {
                  key: "descuento",
                  header: t("sales.discount", "Desc."),
                  render: (row: VentaDetalleForm) => {
                    const calculo = calcularLineaTemporal(row);

                    return (
                      <div>
                        <p className="font-semibold text-slate-900">
                          {parsePorcentaje(row.porcentajeDescuento)}%
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(calculo.descuento)}
                        </p>
                      </div>
                    );
                  },
                },
                {
                  key: "iva",
                  header: t("sales.tax", "IVA"),
                  render: (row: VentaDetalleForm) =>
                    `${row.tipoTarifa} (${getPorcentajeIva(row)}%)`,
                },
                {
                  key: "total",
                  header: t("sales.total", "Total estimado"),
                  render: (row: VentaDetalleForm) =>
                    formatCurrency(calcularLineaTemporal(row).total),
                },
              ]}
              actions={(row) => (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => editarDetalle(row)}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {t("common.edit", "Editar")}
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminarDetalle(row.idTemporal)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    {t("common.delete", "Eliminar")}
                  </button>
                </div>
              )}
            />

            <div className="mt-5">{renderResumenVenta()}</div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={guardando}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("common.cancel", "Cancelar")}
            </button>

            <PrimaryButton onClick={pasarADatosGenerales}>
              {t("common.next", "Siguiente")}
            </PrimaryButton>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-950">
                {t("common.details", "Datos generales")}
              </h3>
              <p className="text-sm text-slate-600">
                {t("sales.generalDataDesc", "Registra quién compra y cuánto paga. Si falta dinero, la venta queda automáticamente en deudores.")}
              </p>
            </div>

            <div className="mb-5">{renderResumenVenta()}</div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="mb-1.5 block text-sm font-semibold text-zinc-700">
                  {t("sales.saleNumber", "Número de venta")}
                </p>

                <div className="flex min-h-[42px] items-center rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2.5 text-sm">
                  <span className="font-semibold text-zinc-900">
                    {cabecera.numeroVenta
                      ? `${t("sales.title", "Venta")} #${cabecera.numeroVenta}`
                      : t("common.loading", "Calculando número...")}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-zinc-500">
                  {t("sales.autoNumberNotice", "El número se asigna automáticamente al guardar la venta.")}
                </p>
              </div>

              <InputField
                label={t("sales.date", "Fecha de venta")}
                type="date"
                value={cabecera.fechaVenta}
                onChange={(value) => actualizarCabecera("fechaVenta", value)}
                required
              />

              <InputField
                label={t("sales.client", "Cliente")}
                value={cabecera.clienteNombre}
                onChange={(value) => actualizarCabecera("clienteNombre", value)}
                placeholder={t("sales.clientPlaceholder", "Venta mostrador")}
                maxLength={100}
              />

              <SelectField
                label={t("sales.paymentMethod", "Método de pago")}
                value={cabecera.metodoPago}
                onChange={(value) => actualizarCabecera("metodoPago", value)}
                options={metodosPagoOptions}
                required
              />

              {cabecera.metodoPago === "MIXTO" ? (
                <>
                  <MoneyInputField
                    label={t("sales.cashPayment", "Paga en efectivo")}
                    value={cabecera.montoEfectivo}
                    onChange={(value) =>
                      actualizarCabecera("montoEfectivo", value)
                    }
                    placeholder="0"
                    currencySymbol="₡"
                    allowDecimals={false}
                  />

                  <MoneyInputField
                    label={t("sales.sinpePayment", "Paga por SINPE / transferencia")}
                    value={cabecera.montoSinpeTransferencia}
                    onChange={(value) =>
                      actualizarCabecera("montoSinpeTransferencia", value)
                    }
                    placeholder="0"
                    currencySymbol="₡"
                    allowDecimals={false}
                  />
                </>
              ) : (
                <MoneyInputField
                  label={t("sales.paid", "Monto recibido")}
                  value={cabecera.montoPagado}
                  onChange={(value) => actualizarCabecera("montoPagado", value)}
                  placeholder="0"
                  helperText={t("sales.unpaidHelper", "Si queda en 0, se registra como deuda completa.")}
                  currencySymbol="₡"
                  allowDecimals={false}
                />
              )}

              <InputField
                label={t("sales.deliveryDate", "Fecha de entrega")}
                type="date"
                value={cabecera.fechaEntrega}
                onChange={(value) => actualizarCabecera("fechaEntrega", value)}
              />

              {hayDeuda ? (
                <InputField
                  label={t("receivables.dueDate", "Fecha límite de pago")}
                  type="date"
                  value={cabecera.fechaVencimientoPago}
                  onChange={(value) =>
                    actualizarCabecera("fechaVencimientoPago", value)
                  }
                />
              ) : null}

              <InputField
                label={t("orders.observations", "Observaciones")}
                value={cabecera.observaciones}
                onChange={(value) => actualizarCabecera("observaciones", value)}
                placeholder={t("orders.observationsPlaceholder", "Observaciones opcionales")}
                maxLength={150}
                showCharacterCount
              />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {t("sales.paid", "Monto recibido")}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {formatCurrency(montoRecibido)}
                </p>
              </div>

              <div
                className={`rounded-2xl p-4 ${
                  hayDeuda ? "bg-amber-50" : "bg-emerald-50"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase ${
                    hayDeuda ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {hayDeuda ? t("sales.balance", "Saldo pendiente") : t("sales.status", "Estado de pago")}
                </p>
                <p
                  className={`mt-1 text-lg font-bold ${
                    hayDeuda ? "text-amber-900" : "text-emerald-900"
                  }`}
                >
                  {hayDeuda ? formatCurrency(saldoPendiente) : t("statuses.sales.PAGADA", "Pagada")}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {t("sales.change", "Cambio")}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {formatCurrency(cambio)}
                </p>
              </div>
            </div>

            {confirmarDeuda ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">
                  {t("sales.debtWarning", "Esta venta queda con deuda pendiente.")}
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  {t("sales.total", "Total")}: {formatCurrency(resumenVenta.totalVenta)} · {t("sales.paid", "Recibido")}:{" "}
                  {formatCurrency(montoRecibido)} · {t("sales.balance", "Pendiente")}:{" "}
                  {formatCurrency(saldoPendiente)}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <PrimaryButton onClick={() => guardarVenta(true)}>
                    {t("common.yes", "Sí, guardar con deuda")}
                  </PrimaryButton>

                  <button
                    type="button"
                    onClick={() => setConfirmarDeuda(false)}
                    className="rounded-full border border-amber-300 px-5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                  >
                    {t("sales.reviewPayment", "Revisar pago")}
                  </button>
                </div>
              </div>
            ) : null}

            {cambio > 0 ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-900">
                  {t("sales.changeReturn", "Cambio a devolver")}: {formatCurrency(cambio)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => {
                setPaso(1);
                setConfirmarDeuda(false);
                setFormError(null);
              }}
              disabled={guardando}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("common.back", "Atrás")}
            </button>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={guardando}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("common.cancel", "Cancelar")}
              </button>

              <PrimaryButton
                onClick={() => guardarVenta()}
                loading={guardando}
                loadingText={t("sales.processingSale", "Procesando venta...")}
                disabled={guardando}
              >
                {t("sales.processSale", "Procesar venta")}
              </PrimaryButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FormularioVenta;