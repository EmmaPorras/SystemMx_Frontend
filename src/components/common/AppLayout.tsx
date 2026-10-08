import {
  useEffect,
  useState,
} from "react";

import {
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router";

import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/useAuth";
import LanguageSelector from "./LanguageSelector";
import { useNavigation } from "./navigation";

function AppLayout() {
  const { t } = useTranslation();
  const { navigationGroups } = useNavigation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(() => {
      return (
        localStorage.getItem(
          "systemmx-sidebar-collapsed",
        ) === "true"
      );
    });

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function toggleSidebar() {
    setSidebarCollapsed(
      (current) => !current,
    );
  }

  // Guardar preferencia del sidebar
  useEffect(() => {
    localStorage.setItem(
      "systemmx-sidebar-collapsed",
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  // Bloquear scroll del fondo cuando
  // el menú móvil está abierto.
  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-zinc-200
          bg-white/95
          backdrop-blur-xs
        "
      >
        <div
          className="
            flex
            h-16
            items-center
            justify-between
            gap-4
            px-4
            sm:px-6
            lg:px-8
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            {/* MENÚ MÓVIL */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (current) => !current,
                )
              }
              className="
                grid
                h-10
                w-10
                place-items-center
                rounded-xl
                border
                border-zinc-200
                text-zinc-700
                transition
                hover:bg-zinc-100
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-zinc-950
                lg:hidden
              "
              aria-label={
                mobileMenuOpen
                  ? t("appLayout.closeNav")
                  : t("appLayout.openNav")
              }
              aria-expanded={
                mobileMenuOpen
              }
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? (
                <X
                  size={20}
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  size={20}
                  aria-hidden="true"
                />
              )}
            </button>

            {/* LOGO */}

            <div
              aria-hidden="true"
              className="
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-xl
                bg-zinc-950
                text-white
                shadow-xs
              "
            >
              <ShieldCheck size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-zinc-950">
                SystemMx
              </p>

              <p className="hidden truncate text-xs text-zinc-500 sm:block">
                {t("appLayout.adminPanel")}
              </p>
            </div>
          </div>

          {/* USUARIO & IDIOMA */}

          <div className="flex min-w-0 items-center gap-3">
            <LanguageSelector id="header-language-selector" />

            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-bold text-zinc-950">
                {user?.nombre ??
                  t("appLayout.admin")}
              </p>

              <p className="truncate text-xs text-zinc-500">
                {user?.username ??
                  "admin"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="
                inline-flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                border
                border-zinc-200
                bg-white
                px-3
                py-2
                text-sm
                font-semibold
                text-zinc-700
                transition
                hover:border-zinc-900
                hover:bg-zinc-950
                hover:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-zinc-950
              "
              aria-label={t("auth.logout")}
              title={t("auth.logout")}
            >
              <LogOut
                size={17}
                aria-hidden="true"
              />

              <span className="hidden sm:inline">
                {t("auth.logout")}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================== */}
      {/* LAYOUT */}
      {/* ====================================== */}

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* ====================================== */}
        {/* SIDEBAR */}
        {/* ====================================== */}

        <aside
          id="mobile-navigation"
          aria-label={t("appLayout.mainNavAria")}
          className={`
            fixed
            bottom-0
            left-0
            top-16
            z-30
            w-72
            overflow-y-auto
            border-r
            border-zinc-200
            bg-white
            px-3
            py-4
            shadow-xl
            transition-all
            duration-300

            lg:sticky
            lg:bottom-auto
            lg:top-16
            lg:h-[calc(100vh-4rem)]
            lg:shrink-0
            lg:self-start
            lg:translate-x-0
            lg:shadow-none

            ${
              sidebarCollapsed
                ? "lg:w-20"
                : "lg:w-72"
            }

            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          {/* BOTÓN CONTRAER */}

          <div
            className="
              mb-5
              hidden
              items-center
              lg:flex
            "
          >
            <button
              type="button"
              onClick={toggleSidebar}
              className={`
                flex
                h-10
                items-center
                rounded-xl
                border
                border-zinc-200
                bg-zinc-50
                text-zinc-600
                transition

                hover:border-zinc-300
                hover:bg-zinc-100
                hover:text-zinc-950

                ${
                  sidebarCollapsed
                    ? "w-full justify-center"
                    : "w-full justify-between px-3"
                }
              `}
              title={
                sidebarCollapsed
                  ? t("appLayout.expandMenu")
                  : t("appLayout.collapseMenu")
              }
            >
              {!sidebarCollapsed ? (
                <span className="text-xs font-bold uppercase tracking-[0.12em]">
                  {t("appLayout.menu")}
                </span>
              ) : null}

              {sidebarCollapsed ? (
                <PanelLeftOpen
                  size={18}
                />
              ) : (
                <PanelLeftClose
                  size={18}
                />
              )}
            </button>
          </div>

          {/* NAVEGACIÓN */}

          <nav className="space-y-6">
            {navigationGroups.map(
              (group) => (
                <div key={group.label}>
                  {!sidebarCollapsed ? (
                    <p
                      className="
                        mb-2
                        px-3
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-zinc-400
                      "
                    >
                      {group.label}
                    </p>
                  ) : (
                    <div
                      className="
                        mx-auto
                        mb-3
                        h-px
                        w-8
                        bg-zinc-200
                      "
                    />
                  )}

                  <div className="space-y-1">
                    {group.items.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        return (
                          <NavLink
                            key={
                              item.path
                            }
                            to={item.path}
                            end={
                              item.path ===
                              "/"
                            }
                            onClick={
                              closeMobileMenu
                            }
                            title={
                              sidebarCollapsed
                                ? item.label
                                : undefined
                            }
                            className={({
                              isActive,
                            }) =>
                              [
                                `
                                  flex
                                  items-center
                                  rounded-xl
                                  py-2.5
                                  text-sm
                                  font-semibold
                                  transition
                                  outline-none
                                  focus-visible:ring-2
                                  focus-visible:ring-zinc-950
                                `,

                                sidebarCollapsed
                                  ? "lg:justify-center lg:px-0"
                                  : "gap-3 px-3",

                                isActive
                                  ? "bg-zinc-950 text-white shadow-xs"
                                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                              ].join(
                                " ",
                              )
                            }
                          >
                            <Icon
                              size={18}
                              aria-hidden="true"
                              className="shrink-0"
                            />

                            <span
                              className={
                                sidebarCollapsed
                                  ? "lg:hidden"
                                  : ""
                              }
                            >
                              {
                                item.label
                              }
                            </span>
                          </NavLink>
                        );
                      },
                    )}
                  </div>
                </div>
              ),
            )}
          </nav>
        </aside>

        {/* ====================================== */}
        {/* BACKDROP MÓVIL */}
        {/* ====================================== */}

        {mobileMenuOpen ? (
          <div
            aria-hidden="true"
            onClick={
              closeMobileMenu
            }
            className="
              fixed
              inset-0
              top-16
              z-20
              bg-black/40
              backdrop-blur-xs
              lg:hidden
            "
          />
        ) : null}

        {/* ====================================== */}
        {/* CONTENIDO */}
        {/* ====================================== */}

        <main
          className="
            min-w-0
            flex-1
            px-4
            py-4
            sm:px-6
            sm:py-6
            lg:px-8
          "
        >
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;