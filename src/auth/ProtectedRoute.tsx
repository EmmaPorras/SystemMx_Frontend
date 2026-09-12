import { Navigate, Outlet, useLocation } from "react-router";

import AlertMessage from "../components/common/AlertMessage";
import PrimaryButton from "../components/common/PrimaryButton";
import { useAuth } from "./useAuth";

function ProtectedRoute() {
  const {
    status,
    sessionError,
    refreshSession,
  } = useAuth();

  const location = useLocation();

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
            title="No fue posible validar la sesión"
            message={
              sessionError ??
              "No fue posible comunicarse con el servidor."
            }
          />

          <div className="flex justify-center">
            <PrimaryButton
              onClick={() => {
                void refreshSession();
              }}
            >
              Reintentar
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    const from =
      `${location.pathname}${location.search}${location.hash}`;

    return (
      <Navigate
        to="/login"
        replace
        state={{ from }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
