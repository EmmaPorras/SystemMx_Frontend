import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { CheckCircle2, ShieldCheck, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../components/common/AlertMessage";
import InputField from "../components/common/InputField";
import LanguageSelector from "../components/common/LanguageSelector";
import PrimaryButton from "../components/common/PrimaryButton";
import PasswordStrengthIndicator from "../components/common/PasswordStrengthIndicator";
import { ApiError } from "../api/ApiError";
import { registroApi } from "./auth.api";

type RegistroErrors = {
  nombre?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function RegistroPage() {
  const { t, i18n } = useTranslation();

  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<RegistroErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validateForm(): boolean {
    const nextErrors: RegistroErrors = {};

    const trimmedNombre = nombre.trim();
    if (!trimmedNombre) {
      nextErrors.nombre = t("auth.nameRequired", "El nombre es requerido.");
    } else if (trimmedNombre.length < 2) {
      nextErrors.nombre = t(
        "auth.nameMinLength",
        "El nombre debe tener al menos 2 caracteres.",
      );
    } else if (trimmedNombre.length > 100) {
      nextErrors.nombre = t(
        "auth.nameMaxLength",
        "El nombre no puede exceder 100 caracteres.",
      );
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      nextErrors.username = t(
        "auth.usernameRequired",
        "El usuario es requerido.",
      );
    } else if (trimmedUsername.length < 3) {
      nextErrors.username = t(
        "auth.usernameMinLength",
        "El usuario debe tener al menos 3 caracteres.",
      );
    } else if (trimmedUsername.length > 50) {
      nextErrors.username = t(
        "auth.usernameMaxLength",
        "El usuario no puede exceder 50 caracteres.",
      );
    } else if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUsername)) {
      nextErrors.username = t(
        "auth.usernameInvalidChars",
        "El usuario solo puede contener letras, números, punto, guion y guion bajo.",
      );
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      nextErrors.email = t("auth.emailRequired", "El correo es requerido.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = t(
        "auth.emailInvalid",
        "Debe proporcionar un correo electrónico válido.",
      );
    }

    if (!password) {
      nextErrors.password = t(
        "auth.passwordRequired",
        "La contraseña es requerida.",
      );
    } else if (password.length < 15) {
      nextErrors.password = t(
        "auth.passwordMinLength15",
        "La contraseña debe tener al menos 15 caracteres.",
      );
    } else if (password.length > 128) {
      nextErrors.password = t(
        "auth.passwordMaxLength",
        "La contraseña no puede exceder 128 caracteres.",
      );
    } else if (/^(.)\1+$/.test(password)) {
      nextErrors.password = t(
        "auth.passwordTrivial",
        "La contraseña no puede consistir únicamente en la repetición del mismo carácter.",
      );
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = t(
        "auth.confirmPasswordRequired",
        "Confirme su contraseña.",
      );
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = t(
        "auth.passwordsDoNotMatch",
        "Las contraseñas no coinciden.",
      );
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;
    if (!validateForm()) return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      const currentLang = (i18n.language?.slice(0, 2) as "es" | "en" | "pt") || "es";
      await registroApi({
        nombre: nombre.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        lang: ["es", "en", "pt"].includes(currentLang) ? currentLang : "es",
      });

      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setApiError(
            t(
              "auth.userOrEmailAlreadyExists",
              "El nombre de usuario o correo electrónico ya está registrado.",
            ),
          );
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError(
          t(
            "auth.serverConnectionError",
            "Error de conexión con el servidor. Intente nuevamente.",
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-100 px-4 py-8">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-3 flex justify-end">
          <LanguageSelector id="register-language-selector" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-black/5">
          <div className="border-b border-zinc-200 bg-zinc-950 px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="flex aspect-square w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20"
              >
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  SystemMx
                </p>
                <h1 className="mt-0.5 text-2xl font-bold">
                  {t("auth.registerTitle", "Crear Cuenta")}
                </h1>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {success ? (
              <div className="space-y-5 text-center py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {t("auth.registerSuccessTitle", "¡Cuenta creada exitosamente!")}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {t(
                      "auth.registerSuccessMessage",
                      "Hemos enviado un enlace de activación seguro a tu correo electrónico. Por favor revisa tu bandeja de entrada para verificar tu cuenta y comenzar a utilizar la plataforma.",
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-3.5 text-left text-xs text-blue-900">
                  <div className="flex gap-2.5">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                    <p>
                      {t(
                        "auth.demoRoleNotice",
                        "Tu cuenta iniciará con privilegios evaluativos protegidos (Rol DEMO). Los administradores pueden autorizar roles operativos comerciales.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
                  >
                    {t("auth.goToLogin", "Ir a Iniciar Sesión")}
                  </Link>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="space-y-4">
                {apiError ? (
                  <AlertMessage
                    variant="error"
                    title={t("common.errorOccurred", "Error")}
                    message={apiError}
                    onClose={() => setApiError(null)}
                  />
                ) : null}

                <InputField
                  id="register-nombre"
                  label={t("auth.fullName", "Nombre Completo")}
                  value={nombre}
                  onChange={(val) => {
                    setNombre(val);
                    if (errors.nombre) setErrors((e) => ({ ...e, nombre: undefined }));
                  }}
                  placeholder={t("auth.namePlaceholder", "Ej. María Rodríguez")}
                  required
                  maxLength={100}
                  error={errors.nombre}
                />

                <InputField
                  id="register-username"
                  label={t("auth.username", "Nombre de Usuario")}
                  value={username}
                  onChange={(val) => {
                    setUsername(val);
                    if (errors.username) setErrors((e) => ({ ...e, username: undefined }));
                  }}
                  placeholder={t("auth.usernamePlaceholder", "Ej. mrodriguez")}
                  required
                  maxLength={50}
                  error={errors.username}
                />

                <InputField
                  id="register-email"
                  label={t("auth.email", "Correo Electrónico")}
                  type="email"
                  value={email}
                  onChange={(val) => {
                    setEmail(val);
                    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                  }}
                  placeholder={t("auth.emailPlaceholder", "ejemplo@correo.com")}
                  required
                  maxLength={255}
                  error={errors.email}
                />

                <div>
                  <InputField
                    id="register-password"
                    label={t("auth.password", "Contraseña")}
                    type="password"
                    value={password}
                    onChange={(val) => {
                      setPassword(val);
                      if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                    }}
                    placeholder={t("auth.passwordPolicyPlaceholder", "Mínimo 15 caracteres (frases, espacios, símbolos)")}
                    required
                    maxLength={128}
                    error={errors.password}
                  />
                  <PasswordStrengthIndicator password={password} id="register-password-strength" />
                </div>

                <InputField
                  id="register-confirm-password"
                  label={t("auth.confirmPassword", "Confirmar Contraseña")}
                  type="password"
                  value={confirmPassword}
                  onChange={(val) => {
                    setConfirmPassword(val);
                    if (errors.confirmPassword) {
                      setErrors((e) => ({ ...e, confirmPassword: undefined }));
                    }
                  }}
                  placeholder={t("auth.confirmPasswordPlaceholder", "Repita la contraseña")}
                  required
                  maxLength={128}
                  error={errors.confirmPassword}
                />

                <div className="pt-2">
                  <PrimaryButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting
                      ? t("auth.registering", "Creando cuenta...")
                      : t("auth.registerSubmit", "Registrarse")}
                  </PrimaryButton>
                </div>

                <div className="mt-4 text-center text-xs text-zinc-500">
                  {t("auth.alreadyHaveAccount", "¿Ya tienes una cuenta?")}{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-zinc-900 underline underline-offset-4 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
                  >
                    {t("auth.loginLink", "Inicia sesión aquí")}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistroPage;
