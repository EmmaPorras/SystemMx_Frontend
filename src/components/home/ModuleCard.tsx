import type {
  ElementType,
} from "react";

import {
  Link,
} from "react-router";

import {
  HiOutlineChevronRight,
} from "react-icons/hi";

import {
  TbLayoutGrid,
} from "react-icons/tb";

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
        min-h-[145px]
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5
        shadow-sm
        outline-none
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:border-zinc-300
        hover:shadow-lg
        hover:shadow-black/5

        focus-visible:ring-2
        focus-visible:ring-black
        focus-visible:ring-offset-2
      "
    >
      

      {/* Línea inferior */}

      <div
        aria-hidden="true"
        className="
          absolute
          bottom-0
          left-0
          h-[3px]
          w-0
          bg-zinc-950
          transition-all
          duration-300
          group-hover:w-full
        "
      />

      <div className="relative z-10 flex w-full flex-col">
        <div className="flex items-start justify-between gap-4">
          {/* ÍCONO */}

          <div
            className="
              grid
              h-11
              w-11
              shrink-0
              place-items-center
              rounded-xl
              border
              border-zinc-200
              bg-zinc-50
              text-zinc-700
              transition-all
              duration-200

              group-hover:border-zinc-950
              group-hover:bg-zinc-950
              group-hover:text-white
            "
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* FLECHA */}

          <div
            className="
              grid
              h-8
              w-8
              shrink-0
              place-items-center
              rounded-full
              border
              border-zinc-200
              text-zinc-400
              transition-all
              duration-200

              group-hover:translate-x-1
              group-hover:border-zinc-950
              group-hover:text-zinc-950
            "
          >
            <HiOutlineChevronRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 min-w-0">
          <h3
            className="
              truncate
              text-base
              font-bold
              text-zinc-950
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              line-clamp-2
              text-sm
              leading-5
              text-zinc-500
            "
          >
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ModuleCard;