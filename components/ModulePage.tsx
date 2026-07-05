import { Link } from "react-router";

type ModulePageProps = {
  title: string;
  description: string;
};

function ModulePage({ title, description }: ModulePageProps) {
  return (
    <main className="min-h-screen bg-zinc-200 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-block rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            ← Volver al inicio
          </Link>
        </div>

        <div className="rounded-md bg-white p-8 shadow-md">
          <h1 className="text-3xl font-semibold text-zinc-800">{title}</h1>
          <p className="mt-3 text-zinc-600">{description}</p>

          <div className="mt-8 rounded-md border-2 border-dashed border-zinc-300 p-10 text-center text-zinc-500">
            Aquí después vas a poner la tabla, formulario o módulo de {title}.
          </div>
        </div>
      </div>
    </main>
  );
}

export default ModulePage;