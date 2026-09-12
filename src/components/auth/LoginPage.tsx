import {
  useState,
  type FormEvent,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";

import {
  LockKeyhole,
  LogIn,
  UserRound,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";

import { ApiError } from "../../api/ApiError";
import { useAuth } from "../../auth/useAuth";

type LoginErrors = {
  username?: string;
  password?: string;
};

function getDestination(state: unknown): string {
  if (
    typeof state !== "object" ||
    state === null ||
    !("from" in state)
  ) {
    return "/";
  }

  const from = (state as { from?: unknown }).from;

  if (
    typeof from !== "string" ||
    !from.startsWith("/") ||
    from.startsWith("//") ||
    from === "/login"
  ) {
    return "/";
  }

  return from;
}

function LoginPage() {
  const {
    login,
    status,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const destination = getDestination(location.state);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] =
    useState<LoginErrors>({});

  const [apiError, setApiError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  if (status === "authenticated") {
    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }

  function validateForm(): boolean {
    const nextErrors: LoginErrors = {};

    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      nextErrors.username =
        "Ingrese el nombre de usuario.";
    } else if (normalizedUsername.length > 50) {
      nextErrors.username =
        "El usuario no puede superar 50 caracteres.";
    }

    if (!password) {
      nextErrors.password =
        "Ingrese la contraseña.";
    } else if (password.length > 128) {
      nextErrors.password =
        "La contraseña no puede superar 128 caracteres.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setApiError(null);
    setIsSubmitting(true);

    try {
      await login({
        username: username.trim(),
        password,
      });

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setApiError(
            "Usuario o contraseña incorrectos.",
          );
        } else {
          setApiError(error.message);
        }
      } else {
        setApiError(
          "No fue posible conectar con el servidor.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-100 px-4 py-8">
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-zinc-200 bg-white/60"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-zinc-200/70 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-black/5">
          <div className="border-b border-zinc-200 bg-zinc-950 px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-zinc-700 bg-zinc-900">
                <LockKeyhole className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  SystemMx
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Iniciar sesión
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-400">
              Acceso administrativo al sistema.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 px-6 py-7 sm:px-8"
          >
            {apiError ? (
              <AlertMessage
                variant="error"
                title="No fue posible iniciar sesión"
                message={apiError}
                onClose={() => setApiError(null)}
              />
            ) : null}

            <div className="space-y-4">
              <InputField
                label="Usuario"
                value={username}
                onChange={(value) => {
                  setUsername(value);

                  if (errors.username) {
                    setErrors((current) => ({
                      ...current,
                      username: undefined,
                    }));
                  }
                }}
                placeholder="Ingrese su usuario"
                required
                maxLength={50}
                error={errors.username}
              />

              <InputField
                label="Contraseña"
                value={password}
                onChange={(value) => {
                  setPassword(value);

                  if (errors.password) {
                    setErrors((current) => ({
                      ...current,
                      password: undefined,
                    }));
                  }
                }}
                type="password"
                placeholder="Ingrese su contraseña"
                required
                maxLength={128}
                error={errors.password}
              />
            </div>

            <div className="border-t border-zinc-100 pt-5">
              <PrimaryButton type="submit">
                <span className="inline-flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      <LogIn size={17} />
                      Ingresar
                    </>
                  )}
                </span>
              </PrimaryButton>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
              <UserRound
                size={17}
                className="shrink-0"
              />

              <span>
                Acceso reservado al administrador de SystemMx.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
