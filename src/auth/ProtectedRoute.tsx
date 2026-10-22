import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../components/common/AlertMessage";
import PrimaryButton from "../components/common/PrimaryButton";
import { useAuth } from "./useAuth";
import type { BackendRole } from "./auth.types";
import { getDefaultRouteForRole } from "./permissions";
import { getUserRoleLabel } from "../i18n/statusMap";

type ProtectedRouteProps = {
  allowedRoles?: BackendRole[];
  children?: ReactNode;
};

function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const {
    status,
    user,
    sessionError,
    refreshSession,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-100 px-4">
        <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-6 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950" />
          <p className="mt-4 text-sm font-semibold text-zinc-700">
            Validando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-100 px-4">
        <div className="w-full max-w-md space-y-4">
          <AlertMessage
            variant="error"
            title={t("common.errorOccurred", "No fue posible validar la sesión")}
            message={
              sessionError ??
              t("auth.serverConnectionError", "No fue posible comunicarse con el servidor.")
            }
          />

          <div className="flex justify-center">
            <PrimaryButton
              onClick={() => {
                void refreshSession();
              }}
            >
              {t("common.retry", "Reintentar")}
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    const from = `${location.pathname}${location.search}${location.hash}`;

    return (
      <Navigate
        to="/login"
        replace
        state={{ from }}
      />
    );
  }

  // Verificación de autorización por rol (403 Forbidden)
  if (allowedRoles && allowedRoles.length > 0 && user) {
    const isAllowed = allowedRoles.includes(user.rol);
    if (!isAllowed) {
      const defaultPath = getDefaultRouteForRole(user.rol);
      const translatedRole = getUserRoleLabel(t, user.rol);

      return (
        <div className="min-h-[70vh] grid place-items-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-amber-200/90 bg-white p-6 sm:p-8 text-center shadow-lg shadow-black/5">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 mb-4">
              <ShieldAlert className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
              {t("usuarios.forbiddenTitle", "Acceso no autorizado")}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {t("usuarios.forbiddenDesc", {
                role: translatedRole,
                defaultValue: `Tu cuenta (rol ${translatedRole}) no tiene permisos para acceder a esta sección.`,
              })}
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => navigate(defaultPath, { replace: true })}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                <ArrowLeft size={15} />
                <span>{t("usuarios.goToAllowedHome", "Ir a mi módulo asignado")}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
