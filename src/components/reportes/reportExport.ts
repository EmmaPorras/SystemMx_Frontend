import ExcelJS from "exceljs";

import {
  jsPDF,
} from "jspdf";

import autoTable from "jspdf-autotable";

import i18n from "../../i18n";
import { formatDateTime } from "../common/formatters";

import type {
  ReportFilterValues,
} from "./ReportFilters";

/* =========================================================
 * TIPOS
 * =========================================================
 */

type Primitive =
  | string
  | number
  | boolean;

type GenericRecord =
  Record<string, unknown>;

export type ReportExportItem = {
  id: string;
  family: string;
  familyLabel: string;
  label: string;
  description: string;
  data: unknown;
};

export type ReportExportBundle = {
  filters: ReportFilterValues;
  reports: ReportExportItem[];
};

type ExportRow =
  Record<string, Primitive>;

type ExportSection = {
  title: string;
  rows: ExportRow[];
};

/* =========================================================
 * COLORES
 * =========================================================
 */

const COLORS = {
  dark: "FF111827",
  darkSoft: "FF1F2937",

  green: "FF334155",
  greenDark: "FF0F172A",
  greenLight: "FFF1F5F9",

  blue: "FF2563EB",
  blueLight: "FFDBEAFE",

  amber: "FFF59E0B",
  amberLight: "FFFEF3C7",

  red: "FFDC2626",
  redLight: "FFFEE2E2",

  zinc50: "FFF9FAFB",
  zinc100: "FFF3F4F6",
  zinc200: "FFE5E7EB",
  zinc300: "FFD1D5DB",
  zinc400: "FF9CA3AF",
  zinc500: "FF6B7280",
  zinc700: "FF374151",

  white: "FFFFFFFF",
};

/* =========================================================
 * UTILIDADES
 * =========================================================
 */

function isRecord(
  value: unknown,
): value is GenericRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function humanize(
  value: string,
): string {
  return value
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /^./,
      (char) =>
        char.toUpperCase(),
    );
}

function formatPrimitive(
  value: unknown,
): Primitive {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Sí"
      : "No";
  }

  if (
    typeof value ===
    "number"
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    return (
      value ||
      "—"
    );
  }

  if (
    Array.isArray(value)
  ) {
    return `${value.length} registro${
      value.length === 1
        ? ""
        : "s"
    }`;
  }

  if (
    isRecord(value)
  ) {
    return Object.entries(
      value,
    )
      .map(
        ([
          key,
          nested,
        ]) =>
          `${humanize(
            key,
          )}: ${formatPrimitive(
            nested,
          )}`,
      )
      .join(
        " · ",
      );
  }

  return String(
    value,
  );
}

function flattenRecord(
  record: GenericRecord,
  prefix = "",
): ExportRow {
  const result:
    ExportRow =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(
      record,
    )
  ) {
    const nextKey =
      prefix
        ? `${prefix} - ${humanize(
            key,
          )}`
        : humanize(
            key,
          );

    if (
      isRecord(value)
    ) {
      Object.assign(
        result,
        flattenRecord(
          value,
          nextKey,
        ),
      );

      continue;
    }

    if (
      Array.isArray(value)
    ) {
      result[nextKey] =
        `${value.length} registro${
          value.length === 1
            ? ""
            : "s"
        }`;

      continue;
    }

    result[nextKey] =
      formatPrimitive(
        value,
      );
  }

  return result;
}

function collectSections(
  value: unknown,
  title: string,
  sections: ExportSection[],
) {
  if (
    Array.isArray(value)
  ) {
    if (
      value.length ===
      0
    ) {
      sections.push({
        title,

        rows: [
          {
            Mensaje:
              "Sin registros",
          },
        ],
      });

      return;
    }

    const rows:
      ExportRow[] =
      value.map(
        (
          item,
          index,
        ) => {
          if (
            isRecord(item)
          ) {
            return flattenRecord(
              item,
            );
          }

          return {
            Registro:
              index + 1,

            Valor:
              formatPrimitive(
                item,
              ),
          };
        },
      );

    sections.push({
      title,
      rows,
    });

    return;
  }

  if (
    isRecord(value)
  ) {
    const primitiveRows:
      ExportRow[] =
      [];

    const nested:
      Array<
        [
          string,
          unknown,
        ]
      > = [];

    for (
      const [
        key,
        nestedValue,
      ] of Object.entries(
        value,
      )
    ) {
      if (
        Array.isArray(
          nestedValue,
        ) ||
        isRecord(
          nestedValue,
        )
      ) {
        nested.push([
          key,
          nestedValue,
        ]);

        continue;
      }

      primitiveRows.push({
        Campo:
          humanize(
            key,
          ),

        Valor:
          formatPrimitive(
            nestedValue,
          ),
      });
    }

    if (
      primitiveRows.length >
      0
    ) {
      sections.push({
        title,
        rows:
          primitiveRows,
      });
    }

    for (
      const [
        key,
        nestedValue,
      ] of nested
    ) {
      collectSections(
        nestedValue,
        `${title} - ${humanize(
          key,
        )}`,
        sections,
      );
    }

    return;
  }

  sections.push({
    title,

    rows: [
      {
        Valor:
          formatPrimitive(
            value,
          ),
      },
    ],
  });
}

/* =========================================================
 * NOMBRES
 * =========================================================
 */

function sanitizeFileName(
  value: string,
) {
  return value
    .replace(
      /[<>:"/\\|?*]/g,
      "-",
    )
    .replace(
      /\s+/g,
      "_",
    );
}

function fechaArchivo() {
  const now =
    new Date();

  return [
    now.getFullYear(),

    String(
      now.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    ),

    String(
      now.getDate(),
    ).padStart(
      2,
      "0",
    ),
  ].join("-");
}

function safeSheetName(
  value: string,
) {
  return (
    value
      .replace(
        /[:\\/?*[\]]/g,
        " ",
      )
      .replace(
        /\s+/g,
        " ",
      )
      .trim()
      .slice(
        0,
        31,
      ) ||
    "Reporte"
  );
}

function uniqueSheetName(
  workbook:
    ExcelJS.Workbook,
  desired: string,
) {
  const base =
    safeSheetName(
      desired,
    );

  if (
    !workbook.getWorksheet(
      base,
    )
  ) {
    return base;
  }

  let index =
    2;

  while (
    index <
    1000
  ) {
    const suffix =
      ` ${index}`;

    const candidate =
      `${base.slice(
        0,
        31 -
          suffix.length,
      )}${suffix}`;

    if (
      !workbook.getWorksheet(
        candidate,
      )
    ) {
      return candidate;
    }

    index++;
  }

  return `${Date.now()}`.slice(
    0,
    31,
  );
}

function sanitizeTableName(
  value: string,
  index: number,
) {
  const clean =
    value
      .replace(
        /[^a-zA-Z0-9_]/g,
        "_",
      )
      .replace(
        /_+/g,
        "_",
      )
      .slice(
        0,
        70,
      );

  return `Tabla_${index}_${clean}`;
}

/* =========================================================
 * FILTROS
 * =========================================================
 */

function buildFilterRows(
  filters:
    ReportFilterValues,
): ExportRow[] {
  const filterKey = i18n.t("reportExport.filter");
  const valueKey = i18n.t("reportExport.value");
  const rows:
    ExportRow[] =
    [];

  if (
    filters.fechaDesde
  ) {
    rows.push({
      [filterKey]:
        i18n.t("reports.dateFrom"),

      [valueKey]:
        filters.fechaDesde,
    });
  }

  if (
    filters.fechaHasta
  ) {
    rows.push({
      [filterKey]:
        i18n.t("reports.dateTo"),

      [valueKey]:
        filters.fechaHasta,
    });
  }

  if (
    filters.fechaCorte
  ) {
    rows.push({
      [filterKey]:
        i18n.t("reports.cutoffDate"),

      [valueKey]:
        filters.fechaCorte,
    });
  }

  if (
    filters.usuarioId
  ) {
    rows.push({
      [filterKey]:
        i18n.t("reports.userId"),

      [valueKey]:
        filters.usuarioId,
    });
  }

  if (
    filters.tipoMovimiento
  ) {
    rows.push({
      [filterKey]:
        i18n.t("reports.movementType"),

      [valueKey]:
        filters.tipoMovimiento,
    });
  }

  if (
    rows.length ===
    0
  ) {
    rows.push({
      [filterKey]:
        i18n.t("reportExport.filters"),

      [valueKey]:
        i18n.t("reportExport.allPeriod"),
    });
  }

  return rows;
}

/* =========================================================
 * DETECCIÓN DE TIPOS DE COLUMNAS
 * =========================================================
 */

function isPercentageColumn(
  header: string,
) {
  const normalized =
    header.toLowerCase();

  return (
    normalized.includes(
      "porcentaje",
    ) ||
    normalized.includes(
      "margen",
    ) ||
    normalized.includes(
      "cobertura",
    )
  );
}

function isIntegerColumn(
  header: string,
) {
  const normalized =
    header.toLowerCase();

  const terms = [
    "cantidad",
    "unidades",
    "pedidos",
    "lotes",
    "movimientos",
    "pagos procesados",
    "registro",
    "ventas activas",
    "conciliadas",
    "inconsistentes",
    "id ",
    "id producto",
    "id lote",
    "id venta",
    "id usuario",
    "id movimiento",
    "id pago",
  ];

  return terms.some(
    (term) =>
      normalized.includes(
        term,
      ),
  );
}

function isCurrencyColumn(
  header: string,
) {
  const normalized =
    header.toLowerCase();

  const terms = [
    "monto",
    "subtotal",
    "descuento",
    "iva",
    "costo",
    "precio",
    "ganancia",
    "saldo",
    "ventas",
    "mercadería",
    "mercaderia",
    "envío",
    "envio",
    "impuesto",
    "gasto",
    "valor costo",
    "pagado",
    "diferencia",
    "costo real",
    "promedio costo",
  ];

  return terms.some(
    (term) =>
      normalized.includes(
        term,
      ),
  );
}

/* =========================================================
 * CONVERSIÓN DE VALORES EXCEL
 * =========================================================
 */

function parseExcelValue(
  value: Primitive,
):
  | string
  | number
  | boolean
  | Date {
  if (
    typeof value !==
    "string"
  ) {
    return value;
  }

  /*
   * Fecha simple:
   * YYYY-MM-DD
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    const [
      year,
      month,
      day,
    ] =
      value
        .split("-")
        .map(Number);

    return new Date(
      year,
      month - 1,
      day,
    );
  }

  /*
   * Fecha/hora ISO.
   */
  if (
    /^\d{4}-\d{2}-\d{2}T/.test(
      value,
    )
  ) {
    const parsed =
      new Date(
        value,
      );

    if (
      !Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return parsed;
    }
  }

  return value;
}

function applyCellNumberFormat(
  cell:
    ExcelJS.Cell,
  header: string,
) {
  const normalized =
    header.toLowerCase();

  if (
    cell.value instanceof
    Date
  ) {
    if (
      normalized.includes(
        "hora",
      ) ||
      normalized.includes(
        "movimiento",
      )
    ) {
      cell.numFmt =
        "dd/mm/yyyy hh:mm";
    } else {
      cell.numFmt =
        "dd/mm/yyyy";
    }

    return;
  }

  if (
    typeof cell.value !==
    "number"
  ) {
    return;
  }

  /*
   * Porcentajes primero.
   */
  if (
    isPercentageColumn(
      header,
    )
  ) {
    /*
     * El backend devuelve:
     *
     * 71.09
     *
     * no:
     *
     * 0.7109
     */
    cell.numFmt =
      '0.00"%"';

    return;
  }

  /*
   * Cantidades antes de moneda.
   *
   * Esto evita que:
   *
   * Cantidad Ventas = 4
   *
   * se muestre como:
   *
   * ₡4,00
   */
  if (
    isIntegerColumn(
      header,
    )
  ) {
    cell.numFmt =
      "#,##0";

    return;
  }

  if (
    isCurrencyColumn(
      header,
    )
  ) {
    cell.numFmt =
      '₡#,##0.00;[Red]-₡#,##0.00';

    return;
  }

  cell.numFmt =
    "#,##0.00";
}

/* =========================================================
 * ANCHO DE COLUMNAS
 * =========================================================
 */

function textoParaMedida(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    value instanceof Date
  ) {
    return "00/00/0000 00:00";
  }

  return String(value);
}

function calculateColumnWidth(
  header: string,
  values: unknown[],
) {
  let maxLength =
    header.length;

  for (
    const value of values
  ) {
    const text =
      textoParaMedida(
        value,
      );

    /*
     * Si hay saltos de línea medimos la línea más larga.
     */
    const longestLine =
      text
        .split(/\r?\n/)
        .reduce(
          (
            longest,
            line,
          ) =>
            Math.max(
              longest,
              line.length,
            ),
          0,
        );

    maxLength =
      Math.max(
        maxLength,
        longestLine,
      );
  }

  /*
   * Ancho aproximado en unidades de Excel.
   * Dejamos un poco de aire para que el texto no quede pegado.
   */
  return Math.min(
    Math.max(
      maxLength + 4,
      12,
    ),
    36,
  );
}

function ajustarAnchosAlTitulo(
  sheet: ExcelJS.Worksheet,
  startColumn: number,
  widths: number[],
  title: string,
) {
  if (
    widths.length ===
    0
  ) {
    return;
  }

  /*
   * El título del bloque también debe caber.
   * Repartimos cualquier ancho faltante entre las columnas.
   */
  const requiredTotal =
    Math.min(
      Math.max(
        title.length + 6,
        24,
      ),
      72,
    );

  const currentTotal =
    widths.reduce(
      (
        total,
        width,
      ) =>
        total + width,
      0,
    );

  if (
    currentTotal <
    requiredTotal
  ) {
    const extraPerColumn =
      (requiredTotal -
        currentTotal) /
      widths.length;

    for (
      let index =
        0;
      index <
        widths.length;
      index++
    ) {
      widths[index] =
        Math.min(
          40,
          widths[index] +
            extraPerColumn,
        );
    }
  }

  widths.forEach(
    (
      width,
      index,
    ) => {
      sheet.getColumn(
        startColumn +
          index,
      ).width =
        Math.max(
          sheet.getColumn(
            startColumn +
              index,
          ).width ??
            0,
          width,
        );
    },
  );
}

function calcularAlturaFila(
  values: unknown[],
  widths: number[],
) {
  let maxLines =
    1;

  values.forEach(
    (
      value,
      index,
    ) => {
      const text =
        textoParaMedida(
          value,
        );

      const width =
        Math.max(
          widths[index] ??
            12,
          8,
        );

      /*
       * Aproximación para textos con wrap.
       */
      const estimatedLines =
        Math.max(
          1,
          ...text
            .split(/\r?\n/)
            .map(
              (line) =>
                Math.max(
                  1,
                  Math.ceil(
                    line.length /
                      Math.max(
                        width - 2,
                        6,
                      ),
                  ),
                ),
            ),
        );

      maxLines =
        Math.max(
          maxLines,
          estimatedLines,
        );
    },
  );

  return Math.min(
    Math.max(
      22,
      maxLines * 16,
    ),
    64,
  );
}

function excelColumnName(
  columnNumber: number,
): string {
  let current =
    columnNumber;

  let result =
    "";

  while (
    current >
    0
  ) {
    const remainder =
      (current - 1) %
      26;

    result =
      String.fromCharCode(
        65 +
          remainder,
      ) +
      result;

    current =
      Math.floor(
        (current - 1) /
          26,
      );
  }

  return result;
}

/* =========================================================
 * ESTILOS
 * =========================================================
 */

function aplicarBordeVisible(
  cell: ExcelJS.Cell,
  color = COLORS.zinc300,
) {
  cell.border = {
    top: {
      style:
        "thin",
      color: {
        argb:
          color,
      },
    },

    bottom: {
      style:
        "thin",
      color: {
        argb:
          color,
      },
    },

    left: {
      style:
        "thin",
      color: {
        argb:
          color,
      },
    },

    right: {
      style:
        "thin",
      color: {
        argb:
          color,
      },
    },
  };
}

function aplicarBordeTabla(
  cell: ExcelJS.Cell,
  options: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  } = {},
) {
  cell.border = {
    top: {
      style:
        options.top
          ? "medium"
          : "thin",

      color: {
        argb:
          options.top
            ? COLORS.darkSoft
            : COLORS.zinc300,
      },
    },

    bottom: {
      style:
        options.bottom
          ? "medium"
          : "thin",

      color: {
        argb:
          options.bottom
            ? COLORS.darkSoft
            : COLORS.zinc300,
      },
    },

    left: {
      style:
        options.left
          ? "medium"
          : "thin",

      color: {
        argb:
          options.left
            ? COLORS.darkSoft
            : COLORS.zinc300,
      },
    },

    right: {
      style:
        options.right
          ? "medium"
          : "thin",

      color: {
        argb:
          options.right
            ? COLORS.darkSoft
            : COLORS.zinc300,
      },
    },
  };
}

function styleSectionTitle(
  cell:
    ExcelJS.Cell,
) {
  cell.font = {
    bold:
      true,

    size:
      11,

    color: {
      argb:
        COLORS.white,
    },
  };

  cell.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        COLORS.dark,
    },
  };

  cell.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",

    wrapText:
      true,
  };

  cell.border = {
    top: {
      style:
        "medium",

      color: {
        argb:
          COLORS.darkSoft,
      },
    },

    bottom: {
      style:
        "medium",

      color: {
        argb:
          COLORS.darkSoft,
      },
    },

    left: {
      style:
        "medium",

      color: {
        argb:
          COLORS.darkSoft,
      },
    },

    right: {
      style:
        "medium",

      color: {
        argb:
          COLORS.darkSoft,
      },
    },
  };
}

function styleInformationLabel(
  cell:
    ExcelJS.Cell,
) {
  cell.font = {
    bold:
      true,

    size:
      9,

    color: {
      argb:
        COLORS.zinc500,
    },
  };

  cell.alignment = {
    vertical:
      "middle",
  };

  aplicarBordeVisible(
    cell,
    COLORS.zinc300,
  );
}

function styleInformationValue(
  cell:
    ExcelJS.Cell,
) {
  cell.font = {
    bold:
      true,

    size:
      10,

    color: {
      argb:
        COLORS.dark,
    },
  };

  cell.alignment = {
    vertical:
      "middle",

    wrapText:
      true,
  };

  aplicarBordeVisible(
    cell,
    COLORS.zinc300,
  );
}

function configureWorksheet(
  worksheet:
    ExcelJS.Worksheet,
) {
  worksheet.views = [
    {
      state:
        "frozen",

      ySplit:
        5,

      showGridLines:
        false,
    },
  ];

  worksheet.pageSetup = {
    orientation:
      "landscape",

    paperSize:
      9,

    fitToPage:
      true,

    fitToWidth:
      1,

    fitToHeight:
      0,

    margins: {
      left:
        0.3,

      right:
        0.3,

      top:
        0.5,

      bottom:
        0.5,

      header:
        0.2,

      footer:
        0.2,
    },
  };

  worksheet.headerFooter = {
    oddHeader:
      '&L&"Arial,Bold"SystemMx&CReporte administrativo&R&P de &N',

    oddFooter:
      '&LGenerado por SystemMx&CConfidencial&R&D &T',
  };
}

/* =========================================================
 * EXCEL - HOJA DE RESUMEN
 * =========================================================
 */

function crearHojaResumen(
  workbook:
    ExcelJS.Workbook,
  bundle:
    ReportExportBundle,
) {
  const sheet =
    workbook.addWorksheet(
      "Resumen",
      {
        properties: {
          tabColor: {
            argb:
              COLORS.darkSoft,
          },
        },
      },
    );

  sheet.views = [
    {
      showGridLines:
        false,
    },
  ];

  sheet.pageSetup = {
    orientation:
      "landscape",

    fitToPage:
      true,

    fitToWidth:
      1,

    fitToHeight:
      0,

    margins: {
      left:
        0.3,

      right:
        0.3,

      top:
        0.4,

      bottom:
        0.4,

      header:
        0.2,

      footer:
        0.2,
    },
  };

  /*
   * COLUMNAS BASE
   */
  sheet.getColumn(
    1,
  ).width =
    23;

  sheet.getColumn(
    2,
  ).width =
    22;

  sheet.getColumn(
    3,
  ).width =
    22;

  sheet.getColumn(
    4,
  ).width =
    23;

  sheet.getColumn(
    5,
  ).width =
    22;

  sheet.getColumn(
    6,
  ).width =
    22;

  /*
   * PORTADA
   */
  sheet.mergeCells(
    "A1:F2",
  );

  const title =
    sheet.getCell(
      "A1",
    );

  title.value =
    "SystemMx";

  title.font = {
    bold:
      true,

    size:
      24,

    color: {
      argb:
        COLORS.white,
    },
  };

  title.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        COLORS.dark,
    },
  };

  title.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  sheet.getRow(
    1,
  ).height =
    30;

  sheet.getRow(
    2,
  ).height =
    30;

  sheet.mergeCells(
    "A3:F3",
  );

  const subtitle =
    sheet.getCell(
      "A3",
    );

  subtitle.value =
    i18n.t("reportExport.consolidatedReport");

  subtitle.font = {
    bold:
      true,

    size:
      14,

    color: {
      argb:
        COLORS.dark,
    },
  };

  subtitle.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  sheet.getRow(
    3,
  ).height =
    26;

  /*
   * INFORMACIÓN DEL DOCUMENTO
   */
  sheet.mergeCells(
    "A5:C5",
  );

  const infoTitle =
    sheet.getCell(
      "A5",
    );

  infoTitle.value =
    i18n.t("reportExport.documentInformation");

  infoTitle.font = {
    bold:
      true,

    size:
      11,

    color: {
      argb:
        COLORS.white,
    },
  };

  infoTitle.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        COLORS.darkSoft,
    },
  };

  infoTitle.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  /*
   * FILTROS
   */
  sheet.mergeCells(
    "D5:F5",
  );

  const filtersTitle =
    sheet.getCell(
      "D5",
    );

  filtersTitle.value =
    i18n.t("reportExport.filtersApplied");

  filtersTitle.font = {
    bold:
      true,

    size:
      11,

    color: {
      argb:
        COLORS.white,
    },
  };

  filtersTitle.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        COLORS.darkSoft,
    },
  };

  filtersTitle.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  const info: Array<
    [
      string,
      string | number | Date,
    ]
  > = [
    [
      i18n.t("reportExport.system"),
      "SystemMx",
    ],

    [
      i18n.t("reportExport.generationDate"),
      new Date(),
    ],

    [
      i18n.t("reportExport.includedReports"),
      bundle.reports.length,
    ],

    [
      i18n.t("reportExport.includedFamilies"),
      Array.from(
        new Set(
          bundle.reports.map(
            (report) =>
              report.familyLabel,
          ),
        ),
      ).join(
        ", ",
      ),
    ],
  ];

  const filterRows =
    buildFilterRows(
      bundle.filters,
    );

  const topRows =
    Math.max(
      info.length,
      filterRows.length,
    );

  for (
    let index =
      0;
    index <
      topRows;
    index++
  ) {
    const rowNumber =
      6 + index;

    /*
     * Información: A + B:C
     */
    sheet.mergeCells(
      rowNumber,
      2,
      rowNumber,
      3,
    );

    const infoLabel =
      sheet.getCell(
        rowNumber,
        1,
      );

    const infoValue =
      sheet.getCell(
        rowNumber,
        2,
      );

    if (
      index <
      info.length
    ) {
      infoLabel.value =
        info[index][0];

      infoValue.value =
        info[index][1];

      styleInformationLabel(
        infoLabel,
      );

      styleInformationValue(
        infoValue,
      );

      if (
        info[index][1] instanceof
        Date
      ) {
        infoValue.numFmt =
          "dd/mm/yyyy hh:mm";
      }
    }

    /*
     * Filtros: D + E:F
     */
    sheet.mergeCells(
      rowNumber,
      5,
      rowNumber,
      6,
    );

    const filterLabel =
      sheet.getCell(
        rowNumber,
        4,
      );

    const filterValue =
      sheet.getCell(
        rowNumber,
        5,
      );

    if (
      index <
      filterRows.length
    ) {
      filterLabel.value =
        filterRows[index]
          .Filtro;

      filterValue.value =
        filterRows[index]
          .Valor;

      styleInformationLabel(
        filterLabel,
      );

      styleInformationValue(
        filterValue,
      );
    }

    sheet.getRow(
      rowNumber,
    ).height =
      23;
  }

  /*
   * REPORTES INCLUIDOS
   */
  const reportsStartRow =
    8 +
    topRows;

  sheet.mergeCells(
    reportsStartRow,
    1,
    reportsStartRow,
    6,
  );

  const reportsTitle =
    sheet.getCell(
      reportsStartRow,
      1,
    );

  reportsTitle.value =
    "Reportes incluidos";

  reportsTitle.font = {
    bold:
      true,

    size:
      12,

    color: {
      argb:
        COLORS.white,
    },
  };

  reportsTitle.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        COLORS.dark,
    },
  };

  reportsTitle.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  reportsTitle.border = {
    top: {
      style:
        "medium",

      color: {
        argb:
          COLORS.darkSoft,
      },
    },

    bottom: {
      style:
        "medium",

      color: {
        argb:
          COLORS.darkSoft,
      },
    },

    left: {
      style:
        "medium",

      color: {
        argb:
          COLORS.darkSoft,
      },
    },

    right: {
      style:
        "medium",

      color: {
        argb:
          COLORS.darkSoft,
      },
    },
  };

  sheet.getRow(
    reportsStartRow,
  ).height =
    26;

  const reportHeaderRow =
    reportsStartRow +
    1;

  /*
   * N.º | Familia | Reporte | Descripción (D:F)
   */
  const reportHeaders = [
    {
      column:
        1,
      label:
        "N.º",
    },

    {
      column:
        2,
      label:
        "Familia",
    },

    {
      column:
        3,
      label:
        "Reporte",
    },

    {
      column:
        4,
      label:
        "Descripción",
    },
  ];

  sheet.mergeCells(
    reportHeaderRow,
    4,
    reportHeaderRow,
    6,
  );

  reportHeaders.forEach(
    (
      item,
    ) => {
      const cell =
        sheet.getCell(
          reportHeaderRow,
          item.column,
        );

      cell.value =
        item.label;

      cell.font = {
        bold:
          true,

        color: {
          argb:
            COLORS.white,
        },
      };

      cell.fill = {
        type:
          "pattern",

        pattern:
          "solid",

        fgColor: {
          argb:
            COLORS.darkSoft,
        },
      };

      cell.alignment = {
        vertical:
          "middle",

        horizontal:
          item.column ===
          1
            ? "center"
            : "left",

        wrapText:
          true,
      };
    },
  );

  /*
   * Bordes del encabezado del listado.
   */
  for (
    let column =
      1;
    column <=
      6;
    column++
  ) {
    const cell =
      sheet.getCell(
        reportHeaderRow,
        column,
      );

    aplicarBordeTabla(
      cell,
      {
        top:
          true,

        left:
          column ===
          1,

        right:
          column ===
          6,
      },
    );
  }

  sheet.getRow(
    reportHeaderRow,
  ).height =
    26;

  bundle.reports.forEach(
    (
      report,
      index,
    ) => {
      const rowNumber =
        reportHeaderRow +
        index +
        1;

      sheet.getCell(
        rowNumber,
        1,
      ).value =
        index + 1;

      sheet.getCell(
        rowNumber,
        2,
      ).value =
        report.familyLabel;

      sheet.getCell(
        rowNumber,
        3,
      ).value =
        report.label;

      sheet.mergeCells(
        rowNumber,
        4,
        rowNumber,
        6,
      );

      sheet.getCell(
        rowNumber,
        4,
      ).value =
        report.description;

      for (
        let column =
          1;
        column <=
          6;
        column++
      ) {
        const cell =
          sheet.getCell(
            rowNumber,
            column,
          );

        cell.font = {
          size:
            10,

          color: {
            argb:
              COLORS.dark,
          },
        };

        cell.alignment = {
          vertical:
            "middle",

          horizontal:
            column ===
            1
              ? "center"
              : "left",

          wrapText:
            true,
        };

        cell.fill = {
          type:
            "pattern",

          pattern:
            "solid",

          fgColor: {
            argb:
              index %
                2 ===
              0
                ? COLORS.white
                : COLORS.zinc50,
          },
        };

        aplicarBordeTabla(
          cell,
          {
            bottom:
              index ===
              bundle.reports.length -
                1,

            left:
              column ===
              1,

            right:
              column ===
              6,
          },
        );
      }

      sheet.getRow(
        rowNumber,
      ).height =
        calcularAlturaFila(
          [
            index + 1,
            report.familyLabel,
            report.label,
            report.description,
          ],
          [
            8,
            22,
            22,
            60,
          ],
        );
    },
  );

  /*
   * Anchos finales de la hoja Resumen.
   *
   * IMPORTANTE:
   * Antes la columna A se reducía a 9 para el campo "N.º"
   * del listado de reportes. Eso terminaba cortando textos de
   * la parte superior como:
   *
   * - Fecha de generación
   * - Reportes incluidos
   * - Familias incluidas
   *
   * Dejamos anchos suficientemente amplios para ambas zonas:
   * información general + listado de reportes.
   */
  sheet.getColumn(
    1,
  ).width =
    24;

  sheet.getColumn(
    2,
  ).width =
    24;

  sheet.getColumn(
    3,
  ).width =
    30;

  sheet.getColumn(
    4,
  ).width =
    24;

  sheet.getColumn(
    5,
  ).width =
    24;

  sheet.getColumn(
    6,
  ).width =
    24;

  sheet.headerFooter = {
    oddHeader:
      '&L&"Arial,Bold"SystemMx&CReporte consolidado',

    oddFooter:
      '&LSystemMx&CReporte consolidado&R&P de &N',
  };

  return sheet;
}

/* =========================================================
 * EXCEL - HOJA INDIVIDUAL
 * =========================================================
 */

function crearHojaReporte(
  workbook:
    ExcelJS.Workbook,
  report:
    ReportExportItem,
  tableIndexRef: {
    value: number;
  },
) {
  const sheetName =
    uniqueSheetName(
      workbook,
      report.label,
    );

  const sheet =
    workbook.addWorksheet(
      sheetName,
      {
        properties: {
          tabColor: {
            argb:
              COLORS.darkSoft,
          },
        },
      },
    );

  configureWorksheet(
    sheet,
  );

  /*
   * =======================================================
   * ENCABEZADO
   * =======================================================
   */

  sheet.mergeCells(
    "A1:H1",
  );

  const title =
    sheet.getCell(
      "A1",
    );

  title.value =
    report.label;

  title.font = {
    bold:
      true,

    size:
      18,

    color: {
      argb:
        COLORS.white,
    },
  };

  title.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        COLORS.dark,
    },
  };

  title.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  sheet.getRow(
    1,
  ).height =
    34;

  sheet.mergeCells(
    "A2:H2",
  );

  const family =
    sheet.getCell(
      "A2",
    );

  family.value =
    report.familyLabel;

  family.font = {
    bold:
      true,

    size:
      10,

    color: {
      argb:
        COLORS.zinc700,
    },
  };

  family.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  sheet.getRow(
    2,
  ).height =
    21;

  sheet.mergeCells(
    "A3:H3",
  );

  const description =
    sheet.getCell(
      "A3",
    );

  description.value =
    report.description;

  description.font = {
    size:
      10,

    color: {
      argb:
        COLORS.zinc500,
    },
  };

  description.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",

    wrapText:
      true,
  };

  sheet.getRow(
    3,
  ).height =
    24;

  sheet.mergeCells(
    "A4:H4",
  );

  const generated =
    sheet.getCell(
      "A4",
    );

  generated.value =
    `Generado: ${new Date().toLocaleString(
      "es-CR",
    )}`;

  generated.font = {
    italic:
      true,

    size:
      9,

    color: {
      argb:
        COLORS.zinc500,
    },
  };

  generated.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  sheet.getRow(
    4,
  ).height =
    20;

  /*
   * =======================================================
   * SECCIONES EN FILA
   * =======================================================
   */

  const sections:
    ExportSection[] =
    [];

  collectSections(
    report.data,
    report.label,
    sections,
  );

  const sectionTitleRow =
    6;

  const tableHeaderRow =
    7;

  type SectionLayout = {
    startColumn: number;
    endColumn: number;
    rowCount: number;
    headers: string[];
    widths: number[];
  };

  const layouts:
    SectionLayout[] =
    [];

  let currentColumn =
    1;

  for (
    const section of sections
  ) {
    const rows =
      section.rows.length >
      0
        ? section.rows
        : [
            {
              Mensaje:
                "Sin información",
            },
          ];

    const headers =
      Array.from(
        new Set(
          rows.flatMap(
            (row) =>
              Object.keys(
                row,
              ),
          ),
        ),
      );

    if (
      headers.length ===
      0
    ) {
      continue;
    }

    /*
     * No dejamos columnas vacías entre tablas.
     * La separación se hará con un borde exterior más fuerte.
     */
    const sectionWidth =
      headers.length;

    const sectionEndColumn =
      currentColumn +
      sectionWidth -
      1;

    /*
     * Convertimos los valores antes de medirlos.
     */
    const tableRows =
      rows.map(
        (row) =>
          headers.map(
            (header) =>
              parseExcelValue(
                row[header] ??
                  "—",
              ),
          ),
      );

    const widths =
      headers.map(
        (
          header,
          index,
        ) =>
          calculateColumnWidth(
            header,
            tableRows.map(
              (row) =>
                row[index],
            ),
          ),
      );

    /*
     * Damos preferencia a ciertas columnas comunes.
     */
    headers.forEach(
      (
        header,
        index,
      ) => {
        const normalized =
          header.toLowerCase();

        if (
          normalized ===
          "campo"
        ) {
          widths[index] =
            Math.max(
              widths[index],
              19,
            );
        }

        if (
          normalized ===
          "valor"
        ) {
          widths[index] =
            Math.max(
              widths[index],
              15,
            );
        }

        if (
          normalized.includes(
            "descripción",
          ) ||
          normalized.includes(
            "descripcion",
          ) ||
          normalized.includes(
            "observaciones",
          ) ||
          normalized.includes(
            "motivo",
          )
        ) {
          widths[index] =
            Math.max(
              widths[index],
              24,
            );
        }
      },
    );

    ajustarAnchosAlTitulo(
      sheet,
      currentColumn,
      widths,
      section.title,
    );

    /*
     * TÍTULO DEL BLOQUE
     */
    sheet.mergeCells(
      sectionTitleRow,
      currentColumn,
      sectionTitleRow,
      sectionEndColumn,
    );

    const sectionTitle =
      sheet.getCell(
        sectionTitleRow,
        currentColumn,
      );

    sectionTitle.value =
      section.title;

    styleSectionTitle(
      sectionTitle,
    );

    /*
     * TABLA
     */
    const tableName =
      sanitizeTableName(
        `${report.id}_${section.title}`,
        tableIndexRef.value,
      );

    tableIndexRef.value +=
      1;

    const tableRef =
      `${excelColumnName(
        currentColumn,
      )}${tableHeaderRow}`;

    sheet.addTable({
      name:
        tableName,

      ref:
        tableRef,

      headerRow:
        true,

      totalsRow:
        false,

      style: {
        theme:
          "TableStyleLight1",

        showRowStripes:
          false,

        showColumnStripes:
          false,
      },

      columns:
        headers.map(
          (header) => ({
            name:
              header,
          }),
        ),

      rows:
        tableRows,
    });

    /*
     * ESTILO DE ENCABEZADOS Y DATOS
     */
    headers.forEach(
      (
        header,
        columnIndex,
      ) => {
        const globalColumn =
          currentColumn +
          columnIndex;

        const headerCell =
          sheet.getCell(
            tableHeaderRow,
            globalColumn,
          );

        headerCell.font = {
          bold:
            true,

          size:
            10,

          color: {
            argb:
              COLORS.white,
          },
        };

        headerCell.fill = {
          type:
            "pattern",

          pattern:
            "solid",

          fgColor: {
            argb:
              COLORS.darkSoft,
          },
        };

        headerCell.alignment = {
          vertical:
            "middle",

          horizontal:
            "center",

          wrapText:
            true,
        };

        /*
         * Datos reales de esta sección.
         */
        for (
          let rowIndex =
            0;
          rowIndex <
            rows.length;
          rowIndex++
        ) {
          const rowNumber =
            tableHeaderRow +
            rowIndex +
            1;

          const cell =
            sheet.getCell(
              rowNumber,
              globalColumn,
            );

          applyCellNumberFormat(
            cell,
            header,
          );

          cell.font = {
            size:
              10,

            color: {
              argb:
                COLORS.dark,
            },
          };

          cell.alignment = {
            vertical:
              "middle",

            horizontal:
              typeof cell.value ===
              "number"
                ? "right"
                : "left",

            wrapText:
              true,
          };

          cell.fill = {
            type:
              "pattern",

            pattern:
              "solid",

            fgColor: {
              argb:
                rowIndex %
                  2 ===
                0
                  ? COLORS.white
                  : COLORS.zinc50,
            },
          };
        }
      },
    );

    layouts.push({
      startColumn:
        currentColumn,

      endColumn:
        sectionEndColumn,

      rowCount:
        rows.length,

      headers,

      widths,
    });

    currentColumn =
      sectionEndColumn +
      1;
  }

  /*
   * Altura de encabezados.
   */
  sheet.getRow(
    sectionTitleRow,
  ).height =
    30;

  sheet.getRow(
    tableHeaderRow,
  ).height =
    28;

  /*
   * Todas las tablas tendrán la misma altura visual.
   */
  const maxRows =
    Math.max(
      0,
      ...layouts.map(
        (layout) =>
          layout.rowCount,
      ),
    );

  /*
   * Ajustamos la altura de cada fila según el contenido
   * de todas las tablas que coinciden en esa fila.
   */
  for (
    let rowIndex =
      0;
    rowIndex <
      maxRows;
    rowIndex++
  ) {
    let rowHeight =
      22;

    for (
      const layout of layouts
    ) {
      if (
        rowIndex >=
        layout.rowCount
      ) {
        continue;
      }

      const values =
        layout.headers.map(
          (
            _header,
            columnIndex,
          ) =>
            sheet.getCell(
              tableHeaderRow +
                rowIndex +
                1,
              layout.startColumn +
                columnIndex,
            ).value,
        );

      rowHeight =
        Math.max(
          rowHeight,
          calcularAlturaFila(
            values,
            layout.widths,
          ),
        );
    }

    sheet.getRow(
      tableHeaderRow +
        rowIndex +
        1,
    ).height =
      rowHeight;
  }

  /*
   * =======================================================
   * CUADRÍCULA Y DIVISIONES ENTRE TABLAS
   * =======================================================
   *
   * - líneas internas finas
   * - marco exterior más grueso
   * - sin columnas vacías entre bloques
   * - las celdas vacías siguen visibles hasta la altura
   *   del bloque más largo
   */
  for (
    const layout of layouts
  ) {
    const lastVisualRow =
      tableHeaderRow +
      maxRows;

    /*
     * Título: marco fuerte completo.
     */
    const titleCell =
      sheet.getCell(
        sectionTitleRow,
        layout.startColumn,
      );

    titleCell.border = {
      top: {
        style:
          "medium",

        color: {
          argb:
            COLORS.darkSoft,
        },
      },

      bottom: {
        style:
          "medium",

        color: {
          argb:
            COLORS.darkSoft,
        },
      },

      left: {
        style:
          "medium",

        color: {
          argb:
            COLORS.darkSoft,
        },
      },

      right: {
        style:
          "medium",

        color: {
          argb:
            COLORS.darkSoft,
        },
      },
    };

    /*
     * Encabezado + filas de contenido/padding.
     */
    for (
      let rowNumber =
        tableHeaderRow;
      rowNumber <=
        lastVisualRow;
      rowNumber++
    ) {
      for (
        let columnNumber =
          layout.startColumn;
        columnNumber <=
          layout.endColumn;
        columnNumber++
      ) {
        const cell =
          sheet.getCell(
            rowNumber,
            columnNumber,
          );

        /*
         * Celdas inferiores sin datos:
         * se dejan blancas, pero claramente delimitadas.
         */
        if (
          rowNumber >
          tableHeaderRow +
            layout.rowCount
        ) {
          cell.fill = {
            type:
              "pattern",

            pattern:
              "solid",

            fgColor: {
              argb:
                COLORS.white,
            },
          };

          cell.alignment = {
            vertical:
              "middle",

            horizontal:
              "left",

            wrapText:
              true,
          };
        }

        aplicarBordeTabla(
          cell,
          {
            top:
              rowNumber ===
              tableHeaderRow,

            bottom:
              rowNumber ===
              lastVisualRow,

            left:
              columnNumber ===
              layout.startColumn,

            right:
              columnNumber ===
              layout.endColumn,
          },
        );
      }
    }
  }

  /*
   * Evitamos columnas exageradamente anchas o demasiado angostas.
   */
  for (
    const column of
      sheet.columns
  ) {
    if (
      !column.width
    ) {
      column.width =
        12;

      continue;
    }

    column.width =
      Math.min(
        Math.max(
          column.width,
          10,
        ),
        40,
      );
  }

  /*
   * Área de impresión según el ancho real utilizado.
   */
  if (
    currentColumn >
    1
  ) {
    const lastColumn =
      excelColumnName(
        currentColumn -
          1,
      );

    sheet.pageSetup.printArea =
      `A1:${lastColumn}${
        tableHeaderRow +
        maxRows
      }`;
  }

  return sheet;
}

/* =========================================================
 * DESCARGA EXCEL
 * =========================================================
 */

async function descargarExcel(
  workbook:
    ExcelJS.Workbook,
  fileName: string,
) {
  const buffer =
    await workbook.xlsx.writeBuffer();

  const blob =
    new Blob(
      [
        buffer,
      ],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    );

  const url =
    URL.createObjectURL(
      blob,
    );

  const link =
    document.createElement(
      "a",
    );

  link.href =
    url;

  link.download =
    fileName;

  document.body.appendChild(
    link,
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url,
  );
}

/* =========================================================
 * EXPORTAR EXCEL
 * =========================================================
 */

export async function exportarReportesExcel(
  bundle:
    ReportExportBundle,
) {
  const workbook =
    new ExcelJS.Workbook();

  workbook.creator =
    "SystemMx";

  workbook.lastModifiedBy =
    "SystemMx";

  workbook.created =
    new Date();

  workbook.modified =
    new Date();

  workbook.company =
    "SystemMx";

  workbook.subject =
    i18n.t("reportExport.administrativeReport");

  workbook.title =
    i18n.t("reportExport.documentTitle");

  workbook.description =
    i18n.t("reportExport.analyticsCenterNotice");

  crearHojaResumen(
    workbook,
    bundle,
  );

  const tableIndex = {
    value:
      1,
  };

  for (
    const report of
      bundle.reports
  ) {
    crearHojaReporte(
      workbook,
      report,
      tableIndex,
    );
  }

  /*
   * Al abrir el Excel se muestra
   * primero la hoja Resumen.
   */
  workbook.views = [
    {
      x: 0,
      y: 0,
      width: 12000,
      height: 20000,
      firstSheet: 0,
      activeTab: 0,
      visibility: "visible",
    },
  ];

  await descargarExcel(
    workbook,
    sanitizeFileName(
      `SystemMx_Reportes_${fechaArchivo()}.xlsx`,
    ),
  );
}

/* =========================================================
 * PDF
 * =========================================================
 */

type JsPdfWithTable =
  jsPDF & {
    lastAutoTable?: {
      finalY: number;
    };
  };

function getLastTableY(
  doc:
    jsPDF,
  fallback: number,
) {
  const typed =
    doc as
      JsPdfWithTable;

  return (
    typed.lastAutoTable
      ?.finalY ??
    fallback
  );
}

function ensurePdfSpace(
  doc:
    jsPDF,
  currentY: number,
  needed =
    18,
) {
  const pageHeight =
    doc.internal.pageSize.getHeight();

  if (
    currentY +
      needed >
    pageHeight -
      12
  ) {
    doc.addPage();

    return 15;
  }

  return currentY;
}


function normalizePdfHeader(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isIdentifierColumn(
  header: string,
): boolean {
  const normalized = normalizePdfHeader(header);

  return (
    normalized === "id" ||
    normalized.startsWith("id ") ||
    normalized.includes(" id ") ||
    normalized.includes("numero") ||
    normalized.includes("codigo") ||
    normalized.includes("referencia")
  );
}

function getPdfSemanticHeader(
  header: string,
  row: ExportRow,
): string {
  const normalized = normalizePdfHeader(header);

  if (
    normalized !== "valor" &&
    normalized !== "value"
  ) {
    return header;
  }

  const descriptor = Object.entries(row).find(
    ([key, value]) => {
      const normalizedKey = normalizePdfHeader(key);

      return (
        (normalizedKey === "campo" ||
          normalizedKey === "field") &&
        typeof value === "string"
      );
    },
  );

  if (
    descriptor &&
    typeof descriptor[1] === "string"
  ) {
    return descriptor[1];
  }

  return header;
}

function formatPdfNumber(
  value: number,
  header: string,
  row: ExportRow,
): string {
  const semanticHeader = getPdfSemanticHeader(
    header,
    row,
  );

  if (isIdentifierColumn(semanticHeader)) {
    return String(value);
  }

  if (isPercentageColumn(semanticHeader)) {
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)}%`;
  }

  if (isIntegerColumn(semanticHeader)) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPdfCell(
  value: Primitive | undefined,
  header: string,
  row: ExportRow,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (typeof value === "number") {
    return formatPdfNumber(
      value,
      header,
      row,
    );
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return String(value);
}

/* =========================================================
 * EXPORTAR PDF
 * =========================================================
 */

export function exportarReportesPdf(
  bundle:
    ReportExportBundle,
) {
  const doc =
    new jsPDF({
      orientation:
        "landscape",

      unit:
        "mm",

      format:
        "a4",
    });

  let y =
    15;

  /* =======================================================
   * CABECERA
   * =======================================================
   */

  doc.setFontSize(
    18,
  );

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.text(
    i18n.t("reportExport.documentTitle"),
    12,
    y,
  );

  y +=
    7;

  doc.setFontSize(
    9,
  );

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.text(
    `${i18n.t("reportExport.generatedPrefix")} ${formatDateTime(
      new Date(),
    )}`,
    12,
    y,
  );

  y +=
    8;

  /* =======================================================
   * FILTROS
   * =======================================================
   */

  doc.setFontSize(
    11,
  );

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.text(
    i18n.t("reportExport.filtersApplied"),
    12,
    y,
  );

  y +=
    3;

  const filterRows =
    buildFilterRows(
      bundle.filters,
    );

  autoTable(
    doc,
    {
      startY:
        y,

      head: [
        [
          i18n.t("reportExport.filter"),
          i18n.t("reportExport.value"),
        ],
      ],

      body:
        filterRows.map(
          (row) => {
            const vals = Object.values(row);
            return [
              String(vals[0] ?? ""),
              String(vals[1] ?? ""),
            ];
          },
        ),

      styles: {
        fontSize:
          8,

        cellPadding:
          2,
      },

      headStyles: {
        fillColor: [
          24,
          24,
          27,
        ],
      },

      margin: {
        left:
          12,

        right:
          12,
      },
    },
  );

  y =
    getLastTableY(
      doc,
      y,
    ) +
    8;

  /* =======================================================
   * REPORTES
   * =======================================================
   */

  for (
    const report of
      bundle.reports
  ) {
    y =
      ensurePdfSpace(
        doc,
        y,
        28,
      );

    doc.setFontSize(
      14,
    );

    doc.setFont(
      "helvetica",
      "bold",
    );

    doc.text(
      report.label,
      12,
      y,
    );

    y +=
      5;

    doc.setFontSize(
      8,
    );

    doc.setFont(
      "helvetica",
      "normal",
    );

    doc.text(
      `${report.familyLabel} · ${report.description}`,
      12,
      y,
      {
        maxWidth:
          270,
      },
    );

    y +=
      7;

    const sections:
      ExportSection[] =
      [];

    collectSections(
      report.data,
      report.label,
      sections,
    );

    for (
      const section of
        sections
    ) {
      y =
        ensurePdfSpace(
          doc,
          y,
          22,
        );

      doc.setFontSize(
        9,
      );

      doc.setFont(
        "helvetica",
        "bold",
      );

      doc.text(
        section.title,
        12,
        y,
      );

      y +=
        3;

      const keys =
        Array.from(
          new Set(
            section.rows.flatMap(
              (row) =>
                Object.keys(
                  row,
                ),
            ),
          ),
        );

      const headers =
        keys.length >
        0
          ? keys
          : [
              "Valor",
            ];

      const body =
        section.rows.map(
          (row) =>
            headers.map(
              (key) =>
                formatPdfCell(
                  row[key],
                  key,
                  row,
                ),
            ),
        );

      autoTable(
        doc,
        {
          startY:
            y,

          head: [
            headers,
          ],

          body,

          styles: {
            fontSize:
              7,

            cellPadding:
              1.7,

            overflow:
              "linebreak",
          },

          headStyles: {
            fillColor: [
              24,
              24,
              27,
            ],
          },

          margin: {
            left:
              12,

            right:
              12,
          },

          tableWidth:
            "auto",
        },
      );

      y =
        getLastTableY(
          doc,
          y,
        ) +
        6;
    }

    y +=
      4;
  }

  /* =======================================================
   * NUMERACIÓN
   * =======================================================
   */

  const totalPages =
    doc.getNumberOfPages();

  for (
    let page =
      1;
    page <=
      totalPages;
    page++
  ) {
    doc.setPage(
      page,
    );

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    doc.setFontSize(
      7,
    );

    doc.setTextColor(
      120,
    );

    doc.text(
      `SystemMx · Página ${page} de ${totalPages}`,
      pageWidth -
        12,
      pageHeight -
        6,
      {
        align:
          "right",
      },
    );
  }

  doc.save(
    sanitizeFileName(
      `SystemMx_Reportes_${fechaArchivo()}.pdf`,
    ),
  );
}