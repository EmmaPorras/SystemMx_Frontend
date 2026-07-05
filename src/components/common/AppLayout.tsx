import { NavLink, Outlet } from "react-router";
import { navigationItems } from "./navigation";

function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-zinc-200 bg-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="border-b border-zinc-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Nueva Generación MX
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Panel administrativo</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Frontend base listo para conectar con backend por módulos.
            </p>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      [
                        "block rounded-xl border px-4 py-3 transition",
                        isActive
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
                      ].join(" ")
                    }
                  >
                    <p className="font-medium">{item.label}</p>
                    <p className="mt-1 text-xs opacity-80">{item.description}</p>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
