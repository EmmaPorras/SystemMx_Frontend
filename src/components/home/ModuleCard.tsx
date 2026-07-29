import type { ElementType } from "react";
import { Link } from "react-router";

import { HiOutlineChevronRight } from "react-icons/hi";
import { TbLayoutGrid } from "react-icons/tb";

type ModuleCardProps = {
  title: string;
  description: string;
  to: string;
  icon?: ElementType;
};

function ModuleCard({
  title,
  description,
  to,
  icon: Icon = TbLayoutGrid,
}: ModuleCardProps) {
  return (
    <Link
      to={to}
      className="
        group
        relative
        flex
        min-h-[190px]
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5
        shadow-sm
        outline-none
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:border-zinc-300
        hover:bg-zinc-100
        hover:shadow-xl
        hover:shadow-black/5
        focus-visible:ring-2
        focus-visible:ring-black
        focus-visible:ring-offset-2
        sm:p-6
      "
    >
      {/* Línea inferior animada */}
      <div
        aria-hidden="true"
        className="
          absolute
          bottom-0
          left-0
          h-1
          w-0
          bg-black
          transition-all
          duration-300
          group-hover:w-full
        "
      />

      {/* Decoración circular */}
      <div
        aria-hidden="true"
        className="
          absolute
          -bottom-16
          -right-16
          h-36
          w-36
          rounded-full
          bg-zinc-50
          transition-all
          duration-300
          group-hover:scale-125
          group-hover:bg-zinc-200
        "
      />

      <div className="relative z-10 flex w-full flex-col">
        <div className="flex items-start justify-between gap-4">
          {/* Ícono del módulo */}
          <div
            className="
              grid
              h-14
              w-14
              shrink-0
              place-items-center
              rounded-xl
              border
              border-zinc-200
              bg-zinc-100
              text-zinc-700
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:border-black
              group-hover:bg-black
              group-hover:text-white
            "
          >
            <Icon className="h-7 w-7" />
          </div>

          {/* Flecha superior */}
          <div
            className="
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-full
              border
              border-zinc-200
              bg-white
              text-zinc-400
              transition-all
              duration-300
              group-hover:translate-x-1
              group-hover:border-black
              group-hover:bg-black
              group-hover:text-white
            "
          >
            <HiOutlineChevronRight className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <h3
            className="
              text-lg
              font-semibold
              leading-snug
              text-zinc-950
              transition-colors
              duration-300
              sm:text-xl
            "
          >
            {title}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            {description}
          </p>

          <div className="mt-auto pt-5">
            <span
              className="
                inline-flex
                items-center
                gap-2
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-zinc-500
                transition-colors
                duration-300
                group-hover:text-black
              "
            >
              Abrir módulo

              <HiOutlineChevronRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ModuleCard;