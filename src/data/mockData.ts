import type { Producto } from "../components/productos/productos.types";
import type { Proveedor } from "../components/proveedores/proveedores.types";
import type { TarifaIVA } from "../components/tarifas-iva/tarifas-iva.types";
import type { PedidoCompra, PedidoDetalle } from "../components/pedidos/pedidos.types";
import type { LoteInventario } from "../components/lotes/lotes.types";
import type { Venta, VentaDetalle } from "../components/ventas/ventas.types";
import type { ReporteResumen } from "../components/reportes/reportes.types";

export const proveedoresMock: Proveedor[] = [
  {
    id: 1,
    nombre: "AliExpress Global Parts",
    telefono: "+86 555 100 2200",
    correo: "compras@aliexpress-parts.com",
    direccion: "Shenzhen, China",
    estado: "ACTIVO",
  },
  {
    id: 2,
    nombre: "Temu Moto Store",
    telefono: "+86 555 333 1100",
    correo: "ventas@temumoto.com",
    direccion: "Guangzhou, China",
    estado: "ACTIVO",
  },
  {
    id: 3,
    nombre: "Distribuidora Ruta 21",
    telefono: "2680-4455",
    correo: "contacto@ruta21.cr",
    direccion: "Santa Cruz, Guanacaste",
    estado: "INACTIVO",
  },
];

export const tarifasMock: TarifaIVA[] = [
  { id: 1, codigo: "IVA13", porcentaje: 13, descripcion: "Tarifa general", estado: "ACTIVA" },
  { id: 2, codigo: "EXENTO", porcentaje: 0, descripcion: "Producto exento", estado: "ACTIVA" },
];

export const productosMock: Producto[] = [
  {
    id: 1,
    nombre: "Casco integral negro",
    categoria: "Seguridad",
    precioReferencia: 18500,
    stockTotal: 18,
    proveedorId: 1,
    proveedorNombre: "AliExpress Global Parts",
    tarifaIvaId: 1,
    tarifaIvaDescripcion: "Tarifa general",
    estado: "ACTIVO",
  },
  {
    id: 2,
    nombre: "Luces LED universales",
    categoria: "Iluminación",
    precioReferencia: 9500,
    stockTotal: 32,
    proveedorId: 2,
    proveedorNombre: "Temu Moto Store",
    tarifaIvaId: 1,
    tarifaIvaDescripcion: "Tarifa general",
    estado: "ACTIVO",
  },
  {
    id: 3,
    nombre: "Protector de manillar",
    categoria: "Accesorios",
    precioReferencia: 6500,
    stockTotal: 7,
    proveedorId: 3,
    proveedorNombre: "Distribuidora Ruta 21",
    tarifaIvaId: 2,
    tarifaIvaDescripcion: "Producto exento",
    estado: "ACTIVO",
  },
];

export const pedidoDetallesMock: PedidoDetalle[] = [
  {
    idTemporal: "d1",
    productoId: 1,
    productoNombre: "Casco integral negro",
    cantidad: 10,
    costoUnitario: 12000,
    tarifaPorcentaje: 13,
    subtotal: 120000,
    impuesto: 15600,
    total: 135600,
  },
  {
    idTemporal: "d2",
    productoId: 2,
    productoNombre: "Luces LED universales",
    cantidad: 20,
    costoUnitario: 5500,
    tarifaPorcentaje: 13,
    subtotal: 110000,
    impuesto: 14300,
    total: 124300,
  },
];

export const pedidosMock: PedidoCompra[] = [
  {
    id: 1,
    numeroPedido: "PED-0001",
    fecha: "2026-03-01",
    origen: "AliExpress",
    proveedorId: 1,
    proveedorNombre: "AliExpress Global Parts",
    inversionTotal: 259900,
    observaciones: "Compra inicial de seguridad e iluminación",
    estado: "REGISTRADO",
    detalles: pedidoDetallesMock,
  },
  {
    id: 2,
    numeroPedido: "PED-0002",
    fecha: "2026-03-10",
    origen: "Temu",
    proveedorId: 2,
    proveedorNombre: "Temu Moto Store",
    inversionTotal: 75200,
    observaciones: "Reposición rápida",
    estado: "EN_TRANSITO",
    detalles: [
      {
        idTemporal: "d3",
        productoId: 3,
        productoNombre: "Protector de manillar",
        cantidad: 8,
        costoUnitario: 7000,
        tarifaPorcentaje: 0,
        subtotal: 56000,
        impuesto: 0,
        total: 56000,
      },
    ],
  },
];

export const lotesMock: LoteInventario[] = [
  {
    id: 1,
    pedidoNumero: "PED-0001",
    productoNombre: "Casco integral negro",
    cantidadInicial: 10,
    stockRestante: 8,
    costoUnitario: 12000,
    fechaIngreso: "2026-03-01",
    estado: "ACTIVO",
  },
  {
    id: 2,
    pedidoNumero: "PED-0001",
    productoNombre: "Luces LED universales",
    cantidadInicial: 20,
    stockRestante: 14,
    costoUnitario: 5500,
    fechaIngreso: "2026-03-01",
    estado: "ACTIVO",
  },
  {
    id: 3,
    pedidoNumero: "PED-0002",
    productoNombre: "Protector de manillar",
    cantidadInicial: 8,
    stockRestante: 8,
    costoUnitario: 7000,
    fechaIngreso: "2026-03-10",
    estado: "PENDIENTE",
  },
];

export const ventaDetallesMock: VentaDetalle[] = [
  {
    idTemporal: "v1",
    productoId: 1,
    productoNombre: "Casco integral negro",
    cantidad: 1,
    precioUnitarioSinIva: 18500,
    tarifaPorcentaje: 13,
    subtotal: 18500,
    impuesto: 2405,
    total: 20905,
  },
  {
    idTemporal: "v2",
    productoId: 2,
    productoNombre: "Luces LED universales",
    cantidad: 2,
    precioUnitarioSinIva: 9500,
    tarifaPorcentaje: 13,
    subtotal: 19000,
    impuesto: 2470,
    total: 21470,
  },
];

export const ventasMock: Venta[] = [
  {
    id: 1,
    consecutivo: "VTA-0001",
    fecha: "2026-03-12",
    cliente: "Venta mostrador",
    subtotal: 37500,
    impuesto: 4875,
    total: 42375,
    estado: "COMPLETADA",
    detalles: ventaDetallesMock,
  },
  {
    id: 2,
    consecutivo: "VTA-0002",
    fecha: "2026-03-14",
    cliente: "Cliente contado",
    subtotal: 6500,
    impuesto: 0,
    total: 6500,
    estado: "COMPLETADA",
    detalles: [
      {
        idTemporal: "v3",
        productoId: 3,
        productoNombre: "Protector de manillar",
        cantidad: 1,
        precioUnitarioSinIva: 6500,
        tarifaPorcentaje: 0,
        subtotal: 6500,
        impuesto: 0,
        total: 6500,
      },
    ],
  },
];

export const reporteResumenMock: ReporteResumen = {
  ventasDelMes: 48875,
  inversionPendiente: 315100,
  utilidadEstimada: 13450,
  productosBajaRotacion: 4,
  productosMasVendidos: [
    { nombre: "Luces LED universales", cantidad: 8 },
    { nombre: "Casco integral negro", cantidad: 5 },
  ],
  rentabilidadPorPedido: [
    { pedidoNumero: "PED-0001", inversion: 259900, ventaGenerada: 122500, utilidad: 15400 },
    { pedidoNumero: "PED-0002", inversion: 56000, ventaGenerada: 6500, utilidad: 900 },
  ],
};
