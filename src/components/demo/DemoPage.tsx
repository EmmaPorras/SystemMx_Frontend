import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Package,
  BarChart3,
  Lock,
  User,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../auth/useAuth";
import { apiClient } from "../../api/apiClient";
import LoadingState from "../common/LoadingState";
import AlertMessage from "../common/AlertMessage";

type DemoResumenResponse = {
  modo: string;
  usuario: {
    idUsuario: number;
    username: string;
    nombre: string;
    rol: string;
  };
  estadoAutorizacion: string;
  mensaje: string;
  datosAislados: {
    categoriasEjemplo: Array<{ id: number; nombre: string; totalProductos: number }>;
    productosEjemplo: Array<{
      id: number;
      codigo: string;
      nombre: string;
      precioVenta: number;
      stockMuestra: number;
    }>;
    metricasMuestra: {
      ventasSimuladasMes: number;
      totalFacturadoSimulado: number;
      moneda: string;
    };
  };
};

function DemoPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<DemoResumenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<DemoResumenResponse>("/demo/resumen")
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Error al cargar datos demostrativos.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingState message={t("common.loading", "Cargando...")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-blue-200/80 bg-linear-to-br from-blue-50/80 via-white to-blue-50/40 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  {t("demo.badge", "MODO DEMOSTRACIÓN")}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {t("demo.leastPrivilege", "Privilegios Mínimos Aislados")}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold text-zinc-950 sm:text-3xl">
                {t("demo.title", "Entorno Evaluativo Seguro")}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
                {t(
                  "demo.description",
                  "Esta cuenta pública opera en un espacio demostrativo evaluativo. Por seguridad de la información corporativa, los datos comerciales y transacciones reales de ventas, compras, inventario y finanzas permanecen protegidos.",
                )}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 text-xs text-zinc-700 shadow-2xs">
            <div className="flex items-center gap-2 font-semibold text-zinc-900">
              <User className="h-4 w-4 text-blue-600" />
              <span>{user?.nombre || "Usuario"}</span>
            </div>
            <p className="mt-1 text-zinc-500 font-mono">@{user?.username}</p>
            <p className="mt-1 font-semibold text-blue-700">
              Rol: {user?.rol || "DEMO"}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <AlertMessage
          variant="error"
          title={t("common.errorOccurred", "Error")}
          message={error}
        />
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {t("demo.simulatedSales", "Ventas Simuladas (Muestra)")}
            </span>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-zinc-900">
            {data?.datosAislados.metricasMuestra.ventasSimuladasMes ?? 15}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {t("demo.sampleMetricExplanation", "Métrica de ejemplo para evaluación")}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {t("demo.simulatedBilling", "Facturación Muestra")}
            </span>
            <Package className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-zinc-900">
            ₡{(data?.datosAislados.metricasMuestra.totalFacturadoSimulado ?? 650000).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {t("demo.sampleBillingExplanation", "Datos simulados sin impacto financiero")}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              {t("demo.securityStatus", "Control de Acceso")}
            </span>
            <Lock className="h-5 w-5 text-amber-700" />
          </div>
          <p className="mt-2 text-sm font-bold text-amber-950">
            {t("demo.adminApprovalRequired", "Requiere Autorización")}
          </p>
          <p className="mt-1 text-xs text-amber-800 leading-relaxed">
            {t(
              "demo.adminApprovalText",
              "Para operar con compras o ventas de producción, solicite asignación de rol al administrador.",
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <Package className="h-5 w-5 text-zinc-700" />
            <h2 className="text-base font-bold text-zinc-900">
              {t("demo.sampleCatalog", "Catálogo Demostrativo Aislado")}
            </h2>
          </div>
          <div className="mt-4 divide-y divide-zinc-100">
            {data?.datosAislados.productosEjemplo.map((prod) => (
              <div key={prod.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-zinc-900">{prod.nombre}</p>
                  <p className="text-zinc-500 font-mono text-xs">{prod.codigo}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-zinc-900">
                    ₡{prod.precioVenta.toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500">Stock: {prod.stockMuestra} un.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <Info className="h-5 w-5 text-zinc-700" />
            <h2 className="text-base font-bold text-zinc-900">
              {t("demo.featuresOverview", "Arquitectura de Seguridad")}
            </h2>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-zinc-600">
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 shrink-0" />
              <span>
                <strong>{t("demo.rule1Title", "Contrato estricto:")}</strong>{" "}
                {t("demo.rule1Text", "El backend valida e impone los permisos independientemente del frontend.")}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 shrink-0" />
              <span>
                <strong>{t("demo.rule2Title", "Protección comercial:")}</strong>{" "}
                {t("demo.rule2Text", "Los endpoints de ventas, inventario FIFO y reportes rechazan solicitudes no autorizadas con HTTP 403.")}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 shrink-0" />
              <span>
                <strong>{t("demo.rule3Title", "Credenciales robustas:")}</strong>{" "}
                {t("demo.rule3Text", "Nueva política unificada de 15 a 128 caracteres con Argon2id.")}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DemoPage;
