import type { ElementType } from "react";
import { TbChartDots3 } from "react-icons/tb";

type StatCardVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ElementType;
  variant?: StatCardVariant;
};

const variantStyles: Record<
  StatCardVariant,
  {
    card: string;
    line: string;
    decoration: string;
    icon: string;
    label: string;
    indicator: string;
    dot: string;
  }
> = {
  neutral: {
    card: "border-zinc-200 bg-zinc-50",
    line: "bg-zinc-300",
    decoration: "border-zinc-200 bg-white/70",
    icon: "border-zinc-200 bg-white text-zinc-700",
    label: "border-zinc-200 bg-zinc-200/70 text-zinc-700",
    indicator: "text-zinc-400",
    dot: "bg-zinc-400",
  },

  info: {
    card: "border-blue-200 bg-blue-50/70",
    line: "bg-blue-300",
    decoration: "border-blue-200 bg-blue-100/50",
    icon: "border-blue-200 bg-blue-100 text-blue-600",
    label: "border-blue-200 bg-blue-100 text-blue-700",
    indicator: "text-blue-400",
    dot: "bg-blue-400",
  },

  success: {
    card: "border-emerald-200 bg-emerald-50/70",
    line: "bg-emerald-300",
    decoration: "border-emerald-200 bg-emerald-100/50",
    icon: "border-emerald-200 bg-emerald-100 text-emerald-600",
    label: "border-emerald-200 bg-emerald-100 text-emerald-700",
    indicator: "text-emerald-400",
    dot: "bg-emerald-400",
  },

  warning: {
    card: "border-amber-200 bg-amber-50/70",
    line: "bg-amber-300",
    decoration: "border-amber-200 bg-amber-100/55",
    icon: "border-amber-200 bg-amber-100 text-amber-700",
    label: "border-amber-200 bg-amber-100 text-amber-800",
    indicator: "text-amber-500",
    dot: "bg-amber-400",
  },

  danger: {
    card: "border-red-200 bg-red-50/70",
    line: "bg-red-300",
    decoration: "border-red-200 bg-red-100/50",
    icon: "border-red-200 bg-red-100 text-red-600",
    label: "border-red-200 bg-red-100 text-red-700",
    indicator: "text-red-400",
    dot: "bg-red-400",
  },
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon = TbChartDots3,
  variant = "neutral",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <article
      className={`
        relative
        flex
        min-h-[185px]
        overflow-hidden
        rounded-2xl
        border
        p-5
        shadow-sm
        sm:p-6
        ${styles.card}
      `}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1 ${styles.line}`}
      />

      <div
        aria-hidden="true"
        className={`
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          border
          ${styles.decoration}
        `}
      />

      <div className="relative z-10 flex w-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`
              grid
              h-12
              w-12
              shrink-0
              place-items-center
              rounded-xl
              border
              shadow-sm
              ${styles.icon}
            `}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div
            className={`
              relative
              z-10
              inline-flex
              min-h-7
              max-w-[72%]
              items-center
              justify-center
              rounded-full
              border
              px-3
              py-1.5
              text-center
              text-[10px]
              font-bold
              uppercase
              leading-tight
              tracking-[0.13em]
              sm:text-[11px]
              ${styles.label}
            `}
          >
            {label}
          </div>
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <p className="break-words text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            {value}
          </p>

          {hint ? (
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              {hint}
            </p>
          ) : null}

          <div
            className={`
              mt-auto
              flex
              items-center
              gap-2
              pt-5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.15em]
              ${styles.indicator}
            `}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            Indicador informativo
          </div>
        </div>
      </div>
    </article>
  );
}

export default StatCard;
