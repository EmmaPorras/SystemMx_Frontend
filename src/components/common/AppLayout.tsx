import {
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router";

import { useState } from "react";

import { useAuth } from "../../auth/useAuth";
import { navigationGroups } from "./navigation";

function AppLayout() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 lg:hidden"
              aria-label="Abrir navegación"
            >
              {mobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white">
              <ShieldCheck size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-zinc-950">
                SystemMx
              </p>

              <p className="hidden truncate text-xs text-zinc-500 sm:block">
                Panel administrativo
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-bold text-zinc-950">
                {user?.nombre ?? "Administrador"}
              </p>

              <p className="truncate text-xs text-zinc-500">
                {user?.username ?? "admin"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-950 hover:text-white"
            >
              <LogOut size={17} />

              <span className="hidden sm:inline">
                Cerrar sesión
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside
          className={`
            fixed
            inset-y-16
            left-0
            z-30
            w-72
            overflow-y-auto
            border-r
            border-zinc-200
            bg-white
            px-4
            py-5
            transition-transform
            duration-200
            lg:static
            lg:inset-auto
            lg:block
            lg:shrink-0
            lg:translate-x-0
            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          <nav className="space-y-6">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  {group.label}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/"}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          [
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                            isActive
                              ? "bg-zinc-950 text-white shadow-sm"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                          ].join(" ")
                        }
                      >
                        <Icon
                          size={18}
                          className="shrink-0"
                        />

                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {mobileMenuOpen ? (
          <button
            type="button"
            aria-label="Cerrar navegación"
            onClick={closeMobileMenu}
            className="fixed inset-0 top-16 z-20 bg-black/30 lg:hidden"
          />
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;