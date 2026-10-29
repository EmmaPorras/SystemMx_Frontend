import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../components/common/AlertMessage";
import InputField from "../components/common/InputField";
import LanguageSelector from "../components/common/LanguageSelector";
import PrimaryButton from "../components/common/PrimaryButton";
import LoadingState from "../components/common/LoadingState";
import PasswordStrengthIndicator from "../components/common/PasswordStrengthIndicator";
import { ApiError } from "../api/ApiError";
import { activarCuentaApi, validarTokenApi, reenviarActivacionApi } from "./auth.api";

function ActivarCuentaPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hashQuery = window.location.hash.includes("?")
    ? window.location.hash.split("?")[1]
    : "";
  const token =
    searchParams.get("token") ||
    new URLSearchParams(window.location.search).get("token") ||
    new URLSearchParams(hashQuery).get("token") ||
    "";

  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{ nombre?: string; username?: string }>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setTokenValid(false);
      setValidationError(t("auth.invalidTokenMessage"));
      return;
    }

    let isMounted = true;
    validarTokenApi(token, "INVITACION")
      .then((res) => {
        if (!isMounted) return;
        if (res.valid) {
          setTokenValid(true);
          setUserInfo({
            nombre: res.nombre,
            username: res.username,
          });
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

  async function handleRequestNewLink(e: FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim() || isResending) return;
    setIsResending(true);
    setResendFeedback(null);
    try {
      const currentLang = (i18n.language?.slice(0, 2) as "es" | "en" | "pt") || "es";
      await reenviarActivacionApi({
        email: resendEmail.trim().toLowerCase(),
        lang: ["es", "en", "pt"].includes(currentLang) ? currentLang : "es",
      });
      setResendFeedback(t("auth.resendActivationSuccess"));
    } catch {
      setResendFeedback(t("auth.resendActivationSuccess"));
    } finally {
      setIsResending(false);
    }
  }

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
      await activarCuentaApi({
        token,
        password,
      });

      setActivatedSuccess(true);
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
          <LanguageSelector id="activate-language-selector" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-black/5">
          <div className="border-b border-zinc-200 bg-zinc-950 px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="grid h-14 w-14 place-items-center rounded-2xl border border-zinc-700 bg-zinc-900"
              >
                <Sparkles className="h-7 w-7 text-blue-400" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  SystemMx
                </p>
                <h1 className="mt-1 text-2xl font-bold">
                  {t("auth.activateAccountTitle")}
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-400">
              {t("auth.activateAccountSubtitle")}
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

                <form onSubmit={handleRequestNewLink} className="pt-2 max-w-xs mx-auto space-y-2.5 text-left">
                  <label htmlFor="resend-activation-email" className="block text-xs font-semibold text-zinc-700">
                    {t("auth.email", "Correo electrónico")}
                  </label>
                  {resendFeedback ? (
                    <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                      {resendFeedback}
                    </p>
                  ) : (
                    <>
                      <input
                        id="resend-activation-email"
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder={t("auth.emailPlaceholder", "ejemplo@correo.com")}
                        required
                        className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 focus:bg-white focus:border-zinc-950 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isResending}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-blue-800 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900 transition disabled:opacity-50"
                      >
                        {isResending
                          ? t("auth.resendingActivation", "Reenviando activación...")
                          : t("auth.requestNewActivationLink", "Solicitar nuevo enlace de activación")}
                      </button>
                    </>
                  )}
                </form>

                <div className="pt-1">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition"
                  >
                    <span>← {t("auth.backToLogin")}</span>
                  </Link>
                </div>
              </div>
            ) : activatedSuccess ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-zinc-900">
                    {t("auth.accountActivatedSuccess")}
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {t("auth.accountActivatedMessage")}
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
                {userInfo.nombre ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-blue-50/70 border border-blue-200/60 p-3.5 text-xs text-blue-900">
                    <UserCheck className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-blue-950">
                        {userInfo.nombre}
                      </p>
                      {userInfo.username ? (
                        <p className="text-blue-700 font-mono">
                          @{userInfo.username}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

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
                  <PasswordStrengthIndicator password={password} id="activar-password-strength"
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
                    loadingText={t("auth.activating")}
                    className="w-full"
                  >
                    <Sparkles size={17} aria-hidden="true" />
                    <span>{t("auth.activateButton")}</span>
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

export default ActivarCuentaPage;
