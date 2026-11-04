import type { ElementType } from "react";
import { TbChartDots3 } from "react-icons/tb";
import { useTranslation } from "react-i18next";

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
    icon: string;
    label: string;
    indicator: string;
    dot: string;
  }
> = {
  neutral: {
    card: "border-zinc-200/90 bg-white",
    line: "bg-zinc-400",
    icon: "border-zinc-200 bg-zinc-50 text-zinc-700",
    label: "border-zinc-200/80 bg-zinc-100/80 text-zinc-700",
    indicator: "text-zinc-400",
    dot: "bg-zinc-400",
  },

  info: {
    card: "border-blue-200/90 bg-gradient-to-br from-white to-blue-50/40",
    line: "bg-blue-500",
    icon: "border-blue-200/80 bg-blue-50 text-blue-700",
    label: "border-blue-200/80 bg-blue-50/90 text-blue-800",
    indicator: "text-blue-500",
    dot: "bg-blue-500",
  },

  success: {
    card: "border-emerald-200/90 bg-gradient-to-br from-white to-emerald-50/40",
    line: "bg-emerald-500",
    icon: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    label: "border-emerald-200/80 bg-emerald-50/90 text-emerald-800",
    indicator: "text-emerald-500",
    dot: "bg-emerald-500",
  },

  warning: {
    card: "border-amber-200/90 bg-gradient-to-br from-white to-amber-50/40",
    line: "bg-amber-500",
    icon: "border-amber-200/80 bg-amber-50 text-amber-700",
    label: "border-amber-200/80 bg-amber-50/90 text-amber-800",
    indicator: "text-amber-500",
    dot: "bg-amber-500",
  },

  danger: {
    card: "border-red-200/90 bg-gradient-to-br from-white to-red-50/40",
    line: "bg-red-500",
    icon: "border-red-200/80 bg-red-50 text-red-700",
    label: "border-red-200/80 bg-red-50/90 text-red-800",
    indicator: "text-red-500",
    dot: "bg-red-500",
  },
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon = TbChartDots3,
  variant = "neutral",
}: StatCardProps) {
  const { t } = useTranslation();
  const styles = variantStyles[variant];

  return (
    <article
      className={`
        relative
        flex
        overflow-hidden
        rounded-2xl
        border
        p-4
        shadow-2xs
        transition-all
        duration-150
        hover:shadow-xs
        sm:p-5
        ${styles.card}
      `}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-0.5 ${styles.line}`}
      />

      <div className="relative z-1 flex w-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <div
            className={`
              grid
              h-9
              w-9
              shrink-0
              place-items-center
              rounded-xl
              border
              shadow-2xs
              ${styles.icon}
            `}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>

          <div
            className={`
              inline-flex
              items-center
              justify-center
              rounded-full
              border
              px-2.5
              py-0.5
              text-[10.5px]
              font-semibold
              tracking-tight
              shadow-2xs
              ${styles.label}
            `}
          >
            {label}
          </div>
        </div>

        <div className="mt-3.5 flex flex-1 flex-col">
          <p className="break-words text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
            {value}
          </p>

          {hint ? (
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              {hint}
            </p>
          ) : null}

          <div
            className={`
              mt-3
              flex
              items-center
              gap-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.12em]
              ${styles.indicator}
            `}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            {t("common.indicator")}
          </div>
        </div>
      </div>
    </article>
  );
}

export default StatCard;
