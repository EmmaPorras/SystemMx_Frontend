import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type AlertVariant = "success" | "error" | "warning" | "info";

type AlertMessageProps = {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
};

const alertStyles: Record<
  AlertVariant,
  {
    container: string;
    iconWrapper: string;
    icon: ReactNode;
    title: string;
    message: string;
    closeButton: string;
    role: "alert" | "status";
  }
> = {
  success: {
    container:
      "border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-xs",
    iconWrapper: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-950",
    message: "text-emerald-800",
    closeButton: "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-950 focus-visible:ring-emerald-500",
    role: "status",
    icon: <CheckCircle2 size={20} aria-hidden="true" />,
  },
  error: {
    container: "border-red-200 bg-red-50/95 text-red-900 shadow-xs",
    iconWrapper: "bg-red-100 text-red-700",
    title: "text-red-950",
    message: "text-red-800",
    closeButton: "text-red-700 hover:bg-red-100 hover:text-red-950 focus-visible:ring-red-500",
    role: "alert",
    icon: <AlertCircle size={20} aria-hidden="true" />,
  },
  warning: {
    container:
      "border-amber-200 bg-amber-50/95 text-amber-900 shadow-xs",
    iconWrapper: "bg-amber-100 text-amber-700",
    title: "text-amber-950",
    message: "text-amber-800",
    closeButton: "text-amber-700 hover:bg-amber-100 hover:text-amber-950 focus-visible:ring-amber-500",
    role: "alert",
    icon: <AlertTriangle size={20} aria-hidden="true" />,
  },
  info: {
    container: "border-sky-200 bg-sky-50/95 text-sky-900 shadow-xs",
    iconWrapper: "bg-sky-100 text-sky-700",
    title: "text-sky-950",
    message: "text-sky-800",
    closeButton: "text-sky-700 hover:bg-sky-100 hover:text-sky-950 focus-visible:ring-sky-500",
    role: "status",
    icon: <Info size={20} aria-hidden="true" />,
  },
};

function AlertMessage({
  variant = "info",
  title,
  message,
  onClose,
  className = "",
}: AlertMessageProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const styles = alertStyles[variant];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 10);

    return () => window.clearTimeout(timer);
  }, []);

  function handleClose() {
    setVisible(false);
    window.setTimeout(() => {
      onClose?.();
    }, 180);
  }

  return (
    <div
      role={styles.role}
      aria-live="polite"
      className={`overflow-hidden rounded-2xl border px-4 py-3 shadow-xs transition-all duration-200 ease-out ${
        styles.container
      } ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "-translate-y-1 scale-[0.99] opacity-0"
      } ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <div
          aria-hidden="true"
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles.iconWrapper}`}
        >
          {styles.icon}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {title ? (
            <p className={`text-xs font-bold leading-tight ${styles.title}`}>{title}</p>
          ) : null}

          <p className={`text-xs leading-relaxed ${styles.message}`}>{message}</p>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={handleClose}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition outline-none focus-visible:ring-2 ${styles.closeButton}`}
            aria-label={t("common.closeAlert")}
            title={t("common.closeAlert")}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default AlertMessage;