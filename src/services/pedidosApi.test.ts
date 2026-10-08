import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ApiError } from "../api/ApiError";
import {
  actualizarPedidoApi,
  cancelarPedidoApi,
  crearPedidoApi,
  obtenerPedidoApi,
  registrarRecepcionPedidoApi,
} from "./pedidosApi";

function createResponse(
  status: number,
  body: unknown,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(
      JSON.stringify(body),
    ),
  } as unknown as Response;
}

describe("pedidosApi", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();

    sessionStorage.setItem(
      "systemmx.accessToken",
      "token-admin",
    );

    vi.stubGlobal("fetch", fetchMock);
  });

  it("consulta un pedido por id", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        id: 10,
        numeroPedido: 25,
        estado: "EN_TRANSITO",
        detalles: [],
      }),
    );

    await obtenerPedidoApi(10);

    const [url, requestInit] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit,
      ];

    expect(new URL(url).pathname).toBe(
      "/api/pedidos/10",
    );

    expect(requestInit.method).toBe("GET");
  });

  it("registra recepción mediante el endpoint dedicado", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        id: 10,
        numeroPedido: 25,
        estado: "EN_TRANSITO",
        detalles: [],
      }),
    );

    await registrarRecepcionPedidoApi(10, {
      fechaRecepcion: "2026-09-11",
      detalles: [
        {
          idLote: 4,
          cantidadRecibida: 5,
        },
      ],
    });

    const [url, requestInit] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit,
      ];

    expect(new URL(url).pathname).toBe(
      "/api/pedidos/10/recepcion",
    );

    expect(requestInit.method).toBe("PATCH");

    expect(
      JSON.parse(String(requestInit.body)),
    ).toEqual({
      fechaRecepcion: "2026-09-11",
      detalles: [
        {
          idLote: 4,
          cantidadRecibida: 5,
        },
      ],
    });
  });

  it("no envía campos de stock dentro de la recepción", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        id: 10,
        estado: "RECIBIDO",
        detalles: [],
      }),
    );

    await registrarRecepcionPedidoApi(10, {
      fechaRecepcion: "2026-09-11",
      detalles: [
        {
          idLote: 8,
          cantidadRecibida: 3,
        },
      ],
    });

    const [, requestInit] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit,
      ];

    const body = JSON.parse(
      String(requestInit.body),
    ) as Record<string, unknown>;

    const detalles = body.detalles as Array<
      Record<string, unknown>
    >;

    expect(
      detalles[0],
    ).not.toHaveProperty("cantidadDisponible");

    expect(
      detalles[0],
    ).not.toHaveProperty("estadoLote");

    expect(
      detalles[0],
    ).not.toHaveProperty("productoId");
  });

  it("fuerza recepción cero y lote EN_PROCESO al crear", async () => {
    fetchMock.mockResolvedValue(
      createResponse(201, {
        id: 1,
        numeroPedido: 20,
        estado: "REGISTRADO",
        detalles: [],
      }),
    );

    await crearPedidoApi({
      id: 0,
      numeroPedido: "20",
      fecha: "2026-09-11",
      origen: "Costa Rica",
      proveedorId: 1,
      proveedorNombre: "Proveedor prueba",
      monedaCompra: "CRC",
      tipoCambio: "1",
      inversionTotal: 10000,
      observaciones: "",
      estado: "REGISTRADO",
      detalles: [
        {
          idTemporal: "tmp-1",
          productoNombre: "Filtro",
          loteCodigo: "L1",
          cantidad: 5,

          // simulamos un estado local incorrecto
          cantidadRecibida: 3,
          cantidadDisponible: 3,
          costoUnitarioOrigen: 1000,
          costoUnitarioReal: 1000,
          precioVentaRecomendado: 2000,
          estadoLote: "EN_STOCK",
        },
      ],
    });

    const [, requestInit] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit,
      ];

    const body = JSON.parse(
      String(requestInit.body),
    ) as {
      detalles: Array<{
        cantidadRecibida: number;
        estadoLote: string;
      }>;
    };

    expect(
      body.detalles[0]?.cantidadRecibida,
    ).toBe(0);

    expect(
      body.detalles[0]?.estadoLote,
    ).toBe("EN_PROCESO");
  });

  it("cancela el pedido mediante DELETE", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        id: 10,
        estado: "CANCELADO",
      }),
    );

    await cancelarPedidoApi(10);

    const [url, requestInit] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit,
      ];

    expect(new URL(url).pathname).toBe(
      "/api/pedidos/10",
    );

    expect(requestInit.method).toBe(
      "DELETE",
    );
  });

  it("preserva el mensaje del backend cuando la cancelación responde 409", async () => {
    fetchMock.mockResolvedValue(
      createResponse(409, {
        statusCode: 409,
        message:
          "El pedido no puede cancelarse porque tiene mercancía recibida.",
        error: "Conflict",
      }),
    );

    await expect(
      cancelarPedidoApi(10),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "El pedido no puede cancelarse porque tiene mercancía recibida.",
    } satisfies Partial<ApiError>);
  });

  it("preserva el conflicto del backend en una recepción inválida", async () => {
    fetchMock.mockResolvedValue(
      createResponse(409, {
        statusCode: 409,
        message:
          "La cantidad recibida supera la cantidad pendiente del lote.",
        error: "Conflict",
      }),
    );

    await expect(
      registrarRecepcionPedidoApi(10, {
        fechaRecepcion: "2026-09-11",
        detalles: [
          {
            idLote: 4,
            cantidadRecibida: 99,
          },
        ],
      }),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "La cantidad recibida supera la cantidad pendiente del lote.",
    });
  });

  it("actualiza un pedido enviando cabecera y detalles completos al backend", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        id: 10,
        numeroPedido: 25,
        estado: "REGISTRADO",
        detalles: [],
      }),
    );

    await actualizarPedidoApi(10, {
      id: 10,
      numeroPedido: "25",
      fecha: "2026-09-15",
      origen: "Estados Unidos",
      proveedorId: 2,
      proveedorNombre: "USA Parts",
      monedaCompra: "USD",
      tipoCambio: "520.50",
      inversionTotal: 104100,
      observaciones: "Actualización de pedido",
      estado: "REGISTRADO",
      detalles: [
        {
          idTemporal: "tmp-1",
          productoId: 5,
          productoNombre: "Bujía Platino",
          categoriaId: 3,
          marca: "NGK",
          loteCodigo: "L1",
          cantidad: 10,
          cantidadRecibida: 0,
          costoUnitarioOrigen: 20,
          costoUnitarioReal: 10410,
          precioVentaRecomendado: 15000,
          estadoLote: "EN_PROCESO",
        },
      ],
    });

    const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(new URL(url).pathname).toBe("/api/pedidos/10");
    expect(requestInit.method).toBe("PATCH");

    const body = JSON.parse(String(requestInit.body));
    expect(body.fecha).toBe("2026-09-15");
    expect(body.monedaCompra).toBe("USD");
    expect(body.tipoCambio).toBe(520.5);
    expect(body.detalles).toHaveLength(1);
    expect(body.detalles[0].productoNombre).toBe("Bujía Platino");
    expect(body.detalles[0].cantidad).toBe(10);
    expect(body.detalles[0].costoUnitarioOrigen).toBe(20);
    expect(body.detalles[0].estadoLote).toBe("EN_PROCESO");
  });
});
