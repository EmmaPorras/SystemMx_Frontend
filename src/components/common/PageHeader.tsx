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
  const resolvedIconAriaLabel = iconAriaLabel ?? t("common.goHome");

  const iconBox = iconTo ? (
    <Link
      to={iconTo}
      aria-label={resolvedIconAriaLabel}
      title={resolvedIconAriaLabel}
      className="
        group
        block
        shrink-0
        rounded-2xl
        outline-none
        focus-visible:ring-2
        focus-visible:ring-black
        focus-visible:ring-offset-4
      "
    >
      <div
        className="
          grid
          h-16
          w-16
          place-items-center
          rounded-2xl
          bg-black
          text-white
          shadow-lg
          shadow-black/20
          transition-all
          duration-300
          ease-out
          group-hover:scale-105
          group-hover:shadow-xl
          group-hover:shadow-black/25
          group-active:scale-95
          sm:h-20
          sm:w-20
        "
      >
        <Icon className="h-9 w-9 sm:h-11 sm:w-11" />
      </div>
    </Link>
  ) : (
    <div
      className="
        grid
        h-16
        w-16
        shrink-0
        place-items-center
        rounded-2xl
        bg-black
        text-white
        shadow-lg
        shadow-black/20
        sm:h-20
        sm:w-20
      "
    >
      <Icon className="h-9 w-9 sm:h-11 sm:w-11" />
    </div>
  );

  return (
    <header
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200
        bg-gradient-to-br
        from-white
        via-white
        to-zinc-100
        p-5
        shadow-sm
        sm:p-6
        lg:p-8
      "
    >
      {/* Decoración circular superior */}
      <div
        aria-hidden="true"
        className="
          absolute
          -right-20
          -top-24
          h-60
          w-60
          rounded-full
          border
          border-zinc-200
          bg-white/50
        "
      />

      {/* Decoración inferior */}
      <div
        aria-hidden="true"
        className="
          absolute
          -bottom-24
          right-20
          h-44
          w-44
          rounded-full
          bg-zinc-200/50
          blur-2xl
        "
      />

      <div
        className="
          relative
          z-10
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          {iconBox}

          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-9 bg-black" />

              <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                Panel administrativo
              </span>
            </div>

            <h1 className="break-words text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            {description ? (
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-zinc-600 sm:text-base lg:text-lg">
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