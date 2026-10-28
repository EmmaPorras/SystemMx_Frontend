import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle2, LockKeyhole, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../components/common/AlertMessage";
import InputField from "../components/common/InputField";
import LanguageSelector from "../components/common/LanguageSelector";
import PrimaryButton from "../components/common/PrimaryButton";
import LoadingState from "../components/common/LoadingState";
import PasswordStrengthIndicator from "../components/common/PasswordStrengthIndicator";
import { ApiError } from "../api/ApiError";
import { restablecerPasswordApi, validarTokenApi } from "./auth.api";

function RestablecerPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token =
    searchParams.get("token") ||
    new URLSearchParams(window.location.search).get("token") ||
    "";

  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setTokenValid(false);
      setValidationError(t("auth.invalidTokenMessage"));
      return;
    }

    let isMounted = true;
    validarTokenApi(token, "RECUPERACION_PASSWORD")
      .then((res) => {
        if (!isMounted) return;
        if (res.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setValidationError(t("auth.invalidTokenMessage"));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setTokenValid(false);
        const msg = err instanceof ApiError ? err.message : t("auth.invalidTokenMessage");
        setValidationError(msg);
      })
      .finally(() => {
        if (isMounted) setIsValidating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, t]);

  function validateForm(): boolean {
    const nextErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      nextErrors.password = t("auth.passwordRequired");
    } else if (password.length < 15) {
      nextErrors.password = t("auth.passwordMinLength15", {
        defaultValue: "La contraseña debe tener al menos 15 caracteres.",
      });
    } else if (/^(.)\1+$/.test(password)) {
      nextErrors.password = t("auth.passwordTrivial", {
        defaultValue: "La contraseña no puede consistir únicamente en la repetición del mismo carácter.",
      });
      nextErrors.password = t("auth.passwordMinLength");
    } else if (password.length > 128) {
      nextErrors.password = t("auth.passwordMaxLength");
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = t("auth.passwordRequired");
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = t("auth.passwordsDoNotMatch");
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
      await restablecerPasswordApi({
        token,
        password,
      });

      setResetSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3500);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError(t("auth.serverConnectionError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-100 px-4 py-8">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-3 flex justify-end">
          <LanguageSelector id="reset-language-selector" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-black/5">
          <div className="border-b border-zinc-200 bg-zinc-950 px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="grid h-14 w-14 place-items-center rounded-2xl border border-zinc-700 bg-zinc-900"
              >
                <LockKeyhole className="h-7 w-7 text-blue-400" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  SystemMx
                </p>
                <h1 className="mt-1 text-2xl font-bold">
                  {t("auth.resetPasswordTitle")}
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-400">
              {t("auth.resetPasswordSubtitle")}
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8">
            {isValidating ? (
              <div className="py-12">
                <LoadingState message={t("common.loadingInfo")} />
              </div>
            ) : !tokenValid ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-zinc-900">
                    {t("auth.invalidTokenTitle")}
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {validationError || t("auth.invalidTokenMessage")}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    to="/recuperar-contrasena"
                    className="inline-flex justify-center items-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition"
                  >
                    <span>{t("auth.sendRecoveryLink")}</span>
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex justify-center items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:underline pt-2"
                  >
                    <ArrowLeft size={14} />
                    <span>{t("auth.backToLogin")}</span>
                  </Link>
                </div>
              </div>
            ) : resetSuccess ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-zinc-900">
                    {t("auth.resetSuccess")}
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {t("auth.resetSuccessMessage")}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition"
                  >
                    <span>{t("auth.backToLogin")}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="space-y-5">
                {apiError ? (
                  <AlertMessage
                    variant="error"
                    title={t("common.errorOccurred")}
                    message={apiError}
                    onClose={() => setApiError(null)}
                  />
                ) : null}

                <div className="space-y-4">
                  <InputField
                    label={t("auth.newPassword")}
                    value={password}
                    onChange={(val) => {
                      setPassword(val);
                      if (errors.password) {
                        setErrors((c) => ({ ...c, password: undefined }));
                      }
                    }}
                    type="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    required
                    autoComplete="new-password"
                    maxLength={128}
                    error={errors.password}
                  />
                  <PasswordStrengthIndicator password={password} id="restablecer-password-strength"
                  />

                  <InputField
                    label={t("auth.confirmPassword")}
                    value={confirmPassword}
                    onChange={(val) => {
                      setConfirmPassword(val);
                      if (errors.confirmPassword) {
                        setErrors((c) => ({ ...c, confirmPassword: undefined }));
                      }
                    }}
                    type="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    required
                    autoComplete="new-password"
                    maxLength={128}
                    error={errors.confirmPassword}
                  />
                </div>

                <div className="border-t border-zinc-100 pt-5 space-y-4">
                  <PrimaryButton
                    type="submit"
                    loading={isSubmitting}
                    loadingText={t("auth.resetting")}
                    className="w-full"
                  >
                    <LockKeyhole size={17} aria-hidden="true" />
                    <span>{t("auth.resetButton")}</span>
                  </PrimaryButton>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:underline"
                    >
                      <ArrowLeft size={14} />
                      <span>{t("auth.backToLogin")}</span>
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestablecerPasswordPage;
