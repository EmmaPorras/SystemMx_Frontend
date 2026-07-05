import MenuCard from "./MenuCard";

const modules = [
  {
    title: "Proveedores",
    to: "/proveedores",
    icon: "🚚",
    colorClass: "bg-blue-500",
  },
  {
    title: "Lotes",
    to: "/lotes",
    icon: "📦",
    colorClass: "bg-indigo-500",
  },
  {
    title: "Productos",
    to: "/productos",
    icon: "🧱",
    colorClass: "bg-green-600",
  },
  {
    title: "Facturas",
    to: "/facturas",
    icon: "🧾",
    colorClass: "bg-yellow-500",
  },
  {
    title: "Tarifas IVA",
    to: "/tarifas-iva",
    icon: "%",
    colorClass: "bg-cyan-600",
  },
  {
    title: "Reportes",
    to: "/reportes",
    icon: "📈",
    colorClass: "bg-gray-700",
  },
  {
    title: "Ventas",
    to: "/ventas",
    icon: "💰",
    colorClass: "bg-red-500",
  },
];

function Home() {
  return (
    <main className="min-h-screen bg-zinc-200 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-light text-zinc-800 md:text-6xl">
            Sistema de Compras
          </h1>
          <p className="mt-3 text-lg text-zinc-600">
            Gestión de Inventario y Facturación
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {modules.map((module) => (
            <MenuCard
              key={module.title}
              title={module.title}
              to={module.to}
              icon={module.icon}
              colorClass={module.colorClass}
            />
          ))}
        </section>
      </div>
    </main>
  );
}

export default Home;