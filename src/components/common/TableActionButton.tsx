import type { ReactNode } from "react";

type TableActionVariant =
  | "view"
  | "edit"
  | "delete"
  | "default";

type TableActionButtonProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: TableActionVariant;
};

const variantClasses: Record<
  TableActionVariant,
  string
> = {
  view:
    "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white",

  edit:
    "border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-500 hover:bg-blue-600 hover:text-white",

  delete:
    "border-red-200 bg-red-50 text-red-600 hover:border-red-500 hover:bg-red-600 hover:text-white",

  default:
    "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white",
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
      className={`
        grid
        h-10
        w-10
        place-items-center
        rounded-xl
        border
        transition
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        active:translate-y-0
        active:scale-95
        ${variantClasses[variant]}
      `}
    >
      {icon}
    </button>
  );
}

export default TableActionButton;