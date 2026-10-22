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
import { getUserRoleLabel } from "../../i18n/statusMap";

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

  // Bloquear scroll del fondo cuando el menú móvil está abierto
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

  // =========================================================================
  // Control de scroll cuando el panel accesible de UserWay está abierto (12G)
  // Panel UserWay abierto = fondo bloqueado, scroll dentro del widget preservado
  // =========================================================================
  useEffect(() => {
    let userWayMenuOpen = false;

    function lockBodyScroll() {
      if (!userWayMenuOpen) {
        userWayMenuOpen = true;
        document.body.classList.add("userway-panel-open");
        document.body.style.overflow = "hidden";
      }
    }

    function unlockBodyScroll() {
      if (userWayMenuOpen) {
        userWayMenuOpen = false;
        document.body.classList.remove("userway-panel-open");
        document.body.style.overflow = "";
      }
    }

    // Eventos personalizados emitidos por UserWay Widget
    function handleUserWayOpen() {
      lockBodyScroll();
    }

    function handleUserWayClose() {
      unlockBodyScroll();
    }

    window.addEventListener("userway:open", handleUserWayOpen);
    window.addEventListener("userway:close", handleUserWayClose);
    document.addEventListener("userway:open", handleUserWayOpen);
    document.addEventListener("userway:close", handleUserWayClose);

    // Observer para detectar apertura del panel UserWay en el DOM
    const observer = new MutationObserver(() => {
      const isWidgetOpen =
        document.body.classList.contains("uai-open") ||
        document.body.classList.contains("userway_active") ||
        document.documentElement.classList.contains("uai-open") ||
        Boolean(
          document.querySelector(
            '.uai-modal:not([style*="display: none"]), #userway-accessibility-menu:not([style*="display: none"]), [id*="userway-accessibility-menu"]',
          ),
        );

      if (isWidgetOpen) {
        lockBodyScroll();
      } else if (userWayMenuOpen) {
        unlockBodyScroll();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style", "aria-hidden"],
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("userway:open", handleUserWayOpen);
      window.removeEventListener("userway:close", handleUserWayClose);
      document.removeEventListener("userway:open", handleUserWayOpen);
      document.removeEventListener("userway:close", handleUserWayClose);
      observer.disconnect();
      document.body.classList.remove("userway-panel-open");
      document.body.style.overflow = "";
    };
  }, []);

  const translatedRole = getUserRoleLabel(t, user?.rol ?? "ADMIN");

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-zinc-900 antialiased">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <header
        className="
          sticky
          top-0
          z-30
          border-b
          border-zinc-200/80
          bg-white/90
          backdrop-blur-md
          transition-all
        "
      >
        <div
          className="
            flex
            h-15
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
                h-9
                w-9
                place-items-center
                rounded-xl
                border
                border-zinc-200
                bg-white
                text-zinc-700
                shadow-2xs
                transition
                hover:bg-zinc-50
                hover:text-zinc-950
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
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  size={18}
                  aria-hidden="true"
                />
              )}
            </button>

            {/* LOGO */}

            <div
              aria-hidden="true"
              className="
                grid
                h-9
                w-9
                shrink-0
                place-items-center
                rounded-xl
                bg-zinc-950
                text-white
                shadow-2xs
              "
            >
              <ShieldCheck size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-zinc-950">
                SystemMx
              </p>

              <p className="hidden truncate text-[11px] font-medium text-zinc-400 sm:block">
                {t("appLayout.adminPanel")}
              </p>
            </div>
          </div>

          {/* USUARIO & IDIOMA */}

          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <LanguageSelector id="header-language-selector" />

            <span aria-hidden="true" className="hidden h-5 w-px bg-zinc-200 sm:block" />

            <div className="hidden min-w-0 items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-1 text-right shadow-2xs sm:flex">
              <div
                aria-hidden="true"
                className="grid h-6.5 w-6.5 place-items-center rounded-lg bg-zinc-100 text-[11px] font-bold text-zinc-700 uppercase"
              >
                {(user?.nombre ?? "A").charAt(0)}
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-xs font-semibold text-zinc-900 leading-tight">
                  {user?.nombre ?? t("appLayout.admin")}
                </p>
                <p className="truncate text-[10px] font-medium text-zinc-500 leading-tight">
                  {translatedRole} ({user?.username ?? "admin"})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="
                inline-flex
                h-8.5
                shrink-0
                items-center
                gap-1.5
                rounded-xl
                border
                border-zinc-200
                bg-white
                px-3
                text-xs
                font-semibold
                text-zinc-700
                shadow-2xs
                transition-all
                duration-150
                hover:border-zinc-950
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
                size={15}
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

      <div className="flex min-h-[calc(100vh-3.75rem)]">
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
            top-15
            z-20
            w-64
            overflow-y-auto
            border-r
            border-zinc-200/80
            bg-white
            px-3
            py-4
            shadow-xl
            transition-all
            duration-300

            lg:sticky
            lg:bottom-auto
            lg:top-15
            lg:h-[calc(100vh-3.75rem)]
            lg:shrink-0
            lg:self-start
            lg:translate-x-0
            lg:shadow-none

            ${
              sidebarCollapsed
                ? "lg:w-18"
                : "lg:w-64"
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
              mb-4
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
                h-9
                items-center
                rounded-xl
                border
                border-zinc-200
                bg-zinc-50/70
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
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  {t("appLayout.menu")}
                </span>
              ) : null}

              {sidebarCollapsed ? (
                <PanelLeftOpen
                  size={16}
                />
              ) : (
                <PanelLeftClose
                  size={16}
                />
              )}
            </button>
          </div>

          {/* NAVEGACIÓN */}

          <nav className="space-y-5">
            {navigationGroups.map(
              (group) => (
                <div key={group.label}>
                  {!sidebarCollapsed ? (
                    <p
                      className="
                        mb-1.5
                        px-2.5
                        text-[9.5px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-zinc-400
                      "
                    >
                      {group.label}
                    </p>
                  ) : (
                    <div
                      className="
                        mx-auto
                        mb-2.5
                        h-px
                        w-6
                        bg-zinc-200
                      "
                    />
                  )}

                  <div className="space-y-0.5">
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
                                  py-2
                                  text-xs
                                  font-semibold
                                  transition-all
                                  duration-150
                                  outline-none
                                  focus-visible:ring-2
                                  focus-visible:ring-zinc-950
                                `,

                                sidebarCollapsed
                                  ? "lg:justify-center lg:px-0"
                                  : "gap-2.5 px-2.5",

                                isActive
                                  ? "bg-zinc-950 text-white shadow-2xs"
                                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                              ].join(
                                " ",
                              )
                            }
                          >
                            <Icon
                              size={16}
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
              top-15
              z-10
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
            py-5
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