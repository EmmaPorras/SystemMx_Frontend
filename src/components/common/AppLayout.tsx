import {
  useEffect,
  useState,
} from "react";
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

import { useAuth } from "../../auth/useAuth";
import { navigationGroups } from "./navigation";

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", {
      replace: true,
    });
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  // Prevent background scroll when mobile menu is open and listen for Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-xs">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 lg:hidden"
              aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir navegación"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>

            <div
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white shadow-xs"
            >
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
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={17} aria-hidden="true" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Navigation Sidebar */}
        <aside
          id="mobile-navigation"
          aria-label="Navegación principal"
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
            shadow-xl
            transition-transform
            duration-200
            lg:static
            lg:inset-auto
            lg:block
            lg:shrink-0
            lg:translate-x-0
            lg:shadow-none
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
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-zinc-950",
                            isActive
                              ? "bg-zinc-950 text-white shadow-xs"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                          ].join(" ")
                        }
                      >
                        <Icon
                          size={18}
                          aria-hidden="true"
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

        {/* Backdrop for mobile drawer */}
        {mobileMenuOpen ? (
          <div
            aria-hidden="true"
            onClick={closeMobileMenu}
            className="fixed inset-0 top-16 z-20 bg-black/40 backdrop-blur-xs lg:hidden"
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