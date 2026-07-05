import { Link } from "react-router";

type ModuleCardProps = {
  title: string;
  description: string;
  to: string;
};

function ModuleCard({ title, description, to }: ModuleCardProps) {
  return (
    <Link
      to={to}
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Módulo
      </p>
      <h3 className="mt-3 text-xl font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
      <span className="mt-5 inline-block text-sm font-medium text-zinc-900">
        Abrir módulo →
      </span>
    </Link>
  );
}

export default ModuleCard;
