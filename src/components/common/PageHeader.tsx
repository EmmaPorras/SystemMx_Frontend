import type { ElementType, ReactNode } from "react";
import { Link } from "react-router";
import { TbLayoutDashboard } from "react-icons/tb";
import { useTranslation } from "react-i18next";

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: ElementType;
  action?: ReactNode;

  /**
   * Cuando se proporciona una ruta, el ícono se convierte en enlace.
   */
  iconTo?: string;

  /**
   * Texto accesible para explicar la acción del ícono.
   */
  iconAriaLabel?: string;
};

function PageHeader({
  title,
  description,
  icon: Icon = TbLayoutDashboard,
  action,
  iconTo,
  iconAriaLabel,
}: PageHeaderProps) {
  const { t } = useTranslation();

  const resolvedIconAriaLabel =
    iconAriaLabel ?? t("common.goHome");

  const iconBox = iconTo ? (
    <Link
      to={iconTo}
      aria-label={resolvedIconAriaLabel}
      title={resolvedIconAriaLabel}
      className="
        group
        block
        shrink-0
        rounded-xl
        outline-none
        focus-visible:ring-2
        focus-visible:ring-black
        focus-visible:ring-offset-2
      "
    >
      <div
        className="
          grid
          h-11
          w-11
          place-items-center
          rounded-xl
          bg-zinc-950
          text-white
          shadow-xs
          transition-all
          duration-200
          ease-out
          group-hover:scale-105
          group-hover:shadow-sm
          group-active:scale-95
          sm:h-12
          sm:w-12
        "
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </Link>
  ) : (
    <div
      className="
        grid
        h-11
        w-11
        shrink-0
        place-items-center
        rounded-xl
        bg-zinc-950
        text-white
        shadow-xs
        sm:h-12
        sm:w-12
      "
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </div>
  );

  return (
    <header
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200/90
        bg-gradient-to-br
        from-white
        via-white
        to-zinc-50/70
        p-4
        shadow-2xs
        sm:p-5
        lg:p-6
      "
    >
      <div
        className="
          relative
          z-10
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div className="flex min-w-0 flex-col gap-3.5 sm:flex-row sm:items-center">
          {iconBox}

          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-px w-6 bg-zinc-400" />

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                {t("appLayout.adminPanel")}
              </span>
            </div>

            <h1 className="break-words text-lg font-bold tracking-tight text-zinc-950 sm:text-xl lg:text-2xl">
              {title}
            </h1>

            {description ? (
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {action ? (
          <div className="relative z-20 w-full shrink-0 lg:w-auto">
            {action}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default PageHeader;