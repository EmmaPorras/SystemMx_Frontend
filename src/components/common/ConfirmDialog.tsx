import { AlertTriangle } from "lucide-react";
import AppModal from "./AppModal";

type ConfirmDialogVariant = "danger" | "warning";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantStyles: Record<
  ConfirmDialogVariant,
  {
    iconWrapper: string;
    confirmButton: string;
  }
> = {
  danger: {
    iconWrapper: "bg-red-100 text-red-700",
    confirmButton:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-200",
  },
  warning: {
    iconWrapper: "bg-amber-100 text-amber-700",
    confirmButton:
      "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-200",
  },
};

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];

  return (
    <AppModal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      maxWidthClassName="max-w-md"
    >
      <div className="space-y-5">
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrapper}`}
          >
            <AlertTriangle size={24} />
          </div>

          <p className="pt-1 text-sm leading-6 text-slate-600">{message}</p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 ${styles.confirmButton}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </AppModal>
  );
}

export default ConfirmDialog;