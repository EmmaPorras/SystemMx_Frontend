import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type PasswordStrengthIndicatorProps = {
  password: string;
  id?: string;
};

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export function calculatePasswordStrength(password: string): {
  score: StrengthLevel;
  feedbackKey: string;
} {
  if (!password || password.length === 0) {
    return { score: 0, feedbackKey: "auth.strengthEmpty" };
  }

  if (password.length < 15) {
    return { score: 1, feedbackKey: "auth.strengthTooShort" };
  }

  // Trivial: repetición continua del mismo carácter
  if (/^(.)\1+$/.test(password)) {
    return { score: 1, feedbackKey: "auth.strengthTrivial" };
  }

  const len = password.length;
  let points = 2; // Base de 15 caracteres válidos

  if (len >= 20) points += 1;
  if (len >= 26) points += 1;

  // Bonus no obligatorio por variedad
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);

  const bonusCount = [hasMixedCase, hasNumbers, hasSymbols].filter(Boolean).length;
  if (bonusCount >= 2 && points < 4) {
    points += 1;
  }

  const score = Math.min(points, 4) as StrengthLevel;

  switch (score) {
    case 2:
      return { score: 2, feedbackKey: "auth.strengthAcceptable" };
    case 3:
      return { score: 3, feedbackKey: "auth.strengthStrong" };
    case 4:
      return { score: 4, feedbackKey: "auth.strengthVeryStrong" };
    default:
      return { score: 1, feedbackKey: "auth.strengthWeak" };
  }
}

function PasswordStrengthIndicator({
  password,
  id = "password-strength-indicator",
}: PasswordStrengthIndicatorProps) {
  const { t } = useTranslation();

  const { score, feedbackKey } = useMemo(
    () => calculatePasswordStrength(password),
    [password],
  );

  if (!password) {
    return null;
  }

  const colorClasses = [
    "bg-zinc-200", // 0
    "bg-rose-500", // 1 - Débil
    "bg-amber-500", // 2 - Aceptable
    "bg-blue-600", // 3 - Fuerte
    "bg-emerald-600", // 4 - Muy Fuerte
  ];

  const labelClasses = [
    "text-zinc-600",
    "text-rose-700 font-semibold",
    "text-amber-800 font-semibold",
    "text-blue-800 font-semibold",
    "text-emerald-800 font-semibold",
  ];

  const labels = [
    "",
    t("auth.strengthWeakLabel", "Débil (requiere mínimo 15 caracteres)"),
    t("auth.strengthAcceptableLabel", "Aceptable"),
    t("auth.strengthStrongLabel", "Fuerte"),
    t("auth.strengthVeryStrongLabel", "Muy fuerte"),
  ];

  return (
    <div id={id} className="mt-2 space-y-1.5" aria-live="polite">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-700 font-medium">
          {t("auth.passwordStrength", "Seguridad de contraseña")}:
        </span>
        <span className={labelClasses[score]}>{labels[score]}</span>
      </div>

      <div
        className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-200"
        role="progressbar"
        aria-valuenow={score * 25}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("auth.passwordStrengthProgress", "Nivel de seguridad de la contraseña")}
      >
        <div
          className={`h-full transition-all duration-300 ${colorClasses[score]}`}
          style={{ width: `${Math.max(score * 25, 10)}%` }}
        />
      </div>

      <p className="text-[11px] text-zinc-600">
        {t(feedbackKey, "Usa frases largas de al menos 15 caracteres. Puedes usar espacios y símbolos.")}
      </p>
    </div>
  );
}

export default PasswordStrengthIndicator;
