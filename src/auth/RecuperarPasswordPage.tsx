import {
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../components/common/AlertMessage";
import InputField from "../components/common/InputField";
import LanguageSelector from "../components/common/LanguageSelector";
import PrimaryButton from "../components/common/PrimaryButton";
import { ApiError } from "../api/ApiError";
import { solicitarRecuperacionApi } from "./auth.api";

function RecuperarPasswordPage() {
  const { t, i18n } = useTranslation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  function validateEmail(): boolean {
    const val = email.trim();
    if (!val) {
      setError(t("auth.emailRequired"));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setError(t("auth.emailInvalid"));
      return false;
    }
    setError(null);
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;
    if (!validateEmail()) return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      const currentLang = (i18n.language?.slice(0, 2) as "es" | "en" | "pt") || "es";
      await solicitarRecuperacionApi({
        email: email.trim().toLowerCase(),
        lang: ["es", "en", "pt"].includes(currentLang) ? currentLang : "es",
      });

      setSentSuccess(true);
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
          <LanguageSelector id="recovery-language-selector" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-black/5">
          <div className="border-b border-zinc-200 bg-zinc-950 px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="grid h-14 w-14 place-items-center rounded-2xl border border-zinc-700 bg-zinc-900"
              >
                <KeyRound className="h-7 w-7 text-blue-400" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  SystemMx
                </p>
                <h1 className="mt-1 text-2xl font-bold">
                  {t("auth.forgotPasswordTitle")}
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-400">
              {t("auth.forgotPasswordSubtitle")}
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8">
            {sentSuccess ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-zinc-900">
                    {t("auth.recoveryEmailSentTitle")}
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {t("auth.recoveryEmailSentDesc")}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <ArrowLeft size={16} />
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

                <div>
                  <InputField
                    label={t("auth.email")}
                    value={email}
                    onChange={(val) => {
                      setEmail(val);
                      if (error) setError(null);
                    }}
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    required
                    autoComplete="email"
                    maxLength={100}
                    error={error ?? undefined}
                  />
                </div>

                <div className="border-t border-zinc-100 pt-5 space-y-4">
                  <PrimaryButton
                    type="submit"
                    loading={isSubmitting}
                    loadingText={t("auth.sendingRecovery")}
                    className="w-full"
                  >
                    <Mail size={17} aria-hidden="true" />
                    <span>{t("auth.sendRecoveryLink")}</span>
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

export default RecuperarPasswordPage;
