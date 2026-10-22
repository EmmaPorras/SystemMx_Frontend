import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center ${className}`}
    >
      <div
        aria-hidden="true"
        className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-400 shadow-xs"
      >
        <Icon size={24} />
      </div>

      <p className="font-semibold text-zinc-950">{title}</p>

      {description ? (
        <p className="mx-auto mt-1 max-w-lg text-sm text-zinc-500">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
