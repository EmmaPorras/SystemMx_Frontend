import {
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";
import {
  LockKeyhole,
  LogIn,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../common/AlertMessage";
import InputField from "../common/InputField";
import LanguageSelector from "../common/LanguageSelector";
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
  const { t } = useTranslation();
  const {
    login,
    status,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const destination = getDestination(location.state);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandVideoFailed, setBrandVideoFailed] = useState(false);

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
      nextErrors.username = t("auth.usernameRequired");
    } else if (normalizedUsername.length > 50) {
      nextErrors.username = t("auth.usernameMaxLength");
    }

    if (!password) {
      nextErrors.password = t("auth.passwordRequired");
    } else if (password.length > 128) {
      nextErrors.password = t("auth.passwordMaxLength");
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
          setApiError(t("auth.invalidCredentials"));
        } else {
          setApiError(error.message);
        }
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
          <LanguageSelector id="login-language-selector" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-black/5">
          <div className="border-b border-zinc-200 bg-zinc-950 px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/20 sm:w-32"
              >
                {brandVideoFailed ? (
                  <LockKeyhole className="h-7 w-7 text-zinc-900" />
                ) : (
                  <video
                    data-testid="systemmx-animated-logo"
                    className="block h-full w-full scale-[1.08] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    onError={() => setBrandVideoFailed(true)}
                  >
                    <source
                      src="https://res.cloudinary.com/dqqnhxhcp/video/upload/v1791492297/gemini_generated_video_68192616_ogqmlj.mp4"
                      type="video/mp4"
                    />
                  </video>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  SystemMx
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  {t("auth.loginTitle")}
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-400">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit}
            className="space-y-5 px-6 py-7 sm:px-8"
          >
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
                label={t("auth.usernameOrEmail")}
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
                placeholder={t("auth.usernamePlaceholder")}
                required
                autoComplete="username"
                maxLength={50}
                error={errors.username}
              />

              <div className="space-y-1.5">
                <InputField
                  label={t("auth.password")}
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
                  placeholder={t("auth.passwordPlaceholder")}
                  required
                  autoComplete="current-password"
                  maxLength={128}
                  error={errors.password}
                />

                <div className="flex justify-end pt-0.5">
                  <Link
                    to="/recuperar-contrasena"
                    className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-5">
              <PrimaryButton
                type="submit"
                loading={isSubmitting}
                loadingText={t("auth.submitting")}
                className="w-full"
              >
                <LogIn size={17} aria-hidden="true" />
                <span>{t("auth.enter")}</span>
              </PrimaryButton>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
              <UserRound
                size={17}
                aria-hidden="true"
                className="shrink-0"
              />

              <span>
                {t("auth.loginAdminAccess")}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
