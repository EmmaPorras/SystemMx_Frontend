import { AlertTriangle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import AppModal from "./AppModal";

type ConfirmDialogVariant = "danger" | "warning";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantStyles: Record<
  ConfirmDialogVariant,
  {
    iconWrapper: string;
    icon: typeof AlertTriangle;
    confirmButton: string;
  }
> = {
  danger: {
    iconWrapper: "bg-red-100 text-red-700",
    icon: AlertTriangle,
    confirmButton:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800",
  },
  warning: {
    iconWrapper: "bg-amber-100 text-amber-700",
    icon: AlertCircle,
    confirmButton:
      "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500 active:bg-amber-700",
  },
};

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel ?? t("dialog.confirmButton");
  const resolvedCancelLabel = cancelLabel ?? t("dialog.cancelButton");
  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  return (
    <AppModal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      maxWidthClassName="max-w-md"
      isSubmitting={isLoading}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.iconWrapper}`}
          >
            <IconComponent size={20} />
          </div>

          <p className="pt-1 text-xs sm:text-sm leading-relaxed text-zinc-600">
            {message}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-3.5 sm:flex-row sm:justify-end sm:gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3.5 text-xs sm:text-sm font-semibold text-zinc-700 shadow-2xs transition hover:bg-zinc-50 hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resolvedCancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex h-9 items-center justify-center rounded-xl px-3.5 text-xs sm:text-sm font-semibold shadow-2xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles.confirmButton}`}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                {t("common.processing")}
              </span>
            ) : (
              resolvedConfirmLabel
            )}
          </button>
        </div>
      </div>
    </AppModal>
  );
}

export default ConfirmDialog;