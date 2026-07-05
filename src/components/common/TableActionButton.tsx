import type { ReactNode } from "react";

type TableActionVariant = "edit" | "delete" | "default";

type TableActionButtonProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: TableActionVariant;
};

const variantClasses: Record<TableActionVariant, string> = {
  edit: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900",
  delete:
    "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-900",
  default:
    "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-950",
};

function TableActionButton({
  icon,
  label,
  onClick,
  variant = "default",
}: TableActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition active:scale-95 ${variantClasses[variant]}`}
    >
      {icon}
    </button>
  );
}

export default TableActionButton;