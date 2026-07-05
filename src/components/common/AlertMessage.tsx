import { useEffect, useState, type ReactNode } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

type AlertMessageProps = {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
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
  }
> = {
  success: {
    container:
      "border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-100",
    iconWrapper: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-950",
    message: "text-emerald-700",
    closeButton: "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-950",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M20 6 9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  error: {
    container: "border-red-200 bg-red-50/95 text-red-900 shadow-red-100",
    iconWrapper: "bg-red-100 text-red-700",
    title: "text-red-950",
    message: "text-red-700",
    closeButton: "text-red-700 hover:bg-red-100 hover:text-red-950",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M12 8v5m0 4h.01M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  warning: {
    container:
      "border-amber-200 bg-amber-50/95 text-amber-900 shadow-amber-100",
    iconWrapper: "bg-amber-100 text-amber-700",
    title: "text-amber-950",
    message: "text-amber-700",
    closeButton: "text-amber-700 hover:bg-amber-100 hover:text-amber-950",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M12 9v4m0 4h.01M12 3 2.5 20h19L12 3Z"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  info: {
    container: "border-sky-200 bg-sky-50/95 text-sky-900 shadow-sky-100",
    iconWrapper: "bg-sky-100 text-sky-700",
    title: "text-sky-950",
    message: "text-sky-700",
    closeButton: "text-sky-700 hover:bg-sky-100 hover:text-sky-950",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M12 17v-6m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

function AlertMessage({
  variant = "info",
  title,
  message,
  onClose,
}: AlertMessageProps) {
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
      className={`overflow-hidden rounded-2xl border px-4 py-3 shadow-sm backdrop-blur transition-all duration-300 ease-out ${
        styles.container
      } ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "-translate-y-2 scale-[0.98] opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.iconWrapper}`}
        >
          {styles.icon}
        </div>

        <div className="min-w-0 flex-1">
          {title ? (
            <p className={`text-sm font-bold ${styles.title}`}>{title}</p>
          ) : null}

          <p className={`text-sm leading-5 ${styles.message}`}>{message}</p>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={handleClose}
            className={`rounded-full px-2 py-1 text-lg leading-none transition ${styles.closeButton}`}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default AlertMessage;