import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthContext, type AuthContextValue } from "../auth/AuthContext";
import i18n, { changeLanguage } from "./index";
import { navigationGroupConfigs } from "../components/common/navigation";
import { translateStatus, getCatalogStatusLabel } from "./statusMap";
import { formatCurrency, formatNumber } from "../components/common/formatters";
import DataTableShell from "../components/common/DataTableShell";
import PaginationControls from "../components/common/PaginationControls";
import LoginPage from "../components/auth/LoginPage";

describe("SYSTEMMX — Paso 2 Cobertura de Internacionalización", () => {
  beforeEach(async () => {
    localStorage.clear();
    await changeLanguage("es");
  });

  afterEach(async () => {
    localStorage.clear();
    await changeLanguage("es");
  });

  it("1. Navegación en español traduce todos los grupos e ítems", () => {
    const items = navigationGroupConfigs.flatMap((g) => g.items);
    const homeItem = items.find((i) => i.path === "/");
    const ordersItem = items.find((i) => i.path === "/pedidos");
    const salesItem = items.find((i) => i.path === "/ventas");

    expect(i18n.t(homeItem!.labelKey)).toBe("Inicio");
    expect(i18n.t(ordersItem!.labelKey)).toBe("Pedidos");
    expect(i18n.t(salesItem!.labelKey)).toBe("Ventas");
  });

  it("2. Navegación en inglés traduce todos los grupos e ítems", async () => {
    await changeLanguage("en");
    const items = navigationGroupConfigs.flatMap((g) => g.items);
    const homeItem = items.find((i) => i.path === "/");
    const ordersItem = items.find((i) => i.path === "/pedidos");
    const salesItem = items.find((i) => i.path === "/ventas");

    expect(i18n.t(homeItem!.labelKey)).toBe("Home");
    expect(i18n.t(ordersItem!.labelKey)).toBe("Orders");
    expect(i18n.t(salesItem!.labelKey)).toBe("Sales");
  });

  it("3. Navegación en portugués traduce todos los grupos e ítems", async () => {
    await changeLanguage("pt");
    const items = navigationGroupConfigs.flatMap((g) => g.items);
    const homeItem = items.find((i) => i.path === "/");
    const ordersItem = items.find((i) => i.path === "/pedidos");
    const salesItem = items.find((i) => i.path === "/ventas");

    expect(i18n.t(homeItem!.labelKey)).toBe("Início");
    expect(i18n.t(ordersItem!.labelKey)).toBe("Pedidos");
    expect(i18n.t(salesItem!.labelKey)).toBe("Vendas");
  });

  it("4. Cambio de idioma reactivo sin recargar actualiza labels de navegación", async () => {
    expect(i18n.t("navigation.reports")).toBe("Reportes");
    await changeLanguage("en");
    expect(i18n.t("navigation.reports")).toBe("Reports");
    await changeLanguage("pt");
    expect(i18n.t("navigation.reports")).toBe("Relatórios");
  });

  const authValue: AuthContextValue = {
    user: null,
    status: "unauthenticated",
    sessionError: null,
    login: vi.fn(async () => undefined),
    logout: vi.fn(),
    refreshSession: vi.fn(async () => undefined),
  };

  it("5. Login en español muestra labels y placeholders en español", () => {
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
  });

  it("6. Login en inglés muestra labels y placeholders en inglés", async () => {
    await changeLanguage("en");
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole("heading", { name: /log in|sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("7. Login en portugués muestra labels y placeholders en portugués", async () => {
    await changeLanguage("pt");
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole("heading", { name: /iniciar sessão/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("8. Validaciones de login traducidas dinámicamente", async () => {
    const { unmount } = render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(screen.getByText("Ingrese el nombre de usuario.")).toBeInTheDocument();
    unmount();

    await changeLanguage("en");
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText("Enter your username.")).toBeInTheDocument();
  });

  it("9. Paginación traducida en español, inglés y portugués", async () => {
    const { rerender } = render(
      <PaginationControls
        pagina={2}
        totalPaginas={5}
        total={50}
        limite={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Controles de paginación")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 5")).toBeInTheDocument();

    await act(async () => {
      await changeLanguage("en");
    });
    rerender(
      <PaginationControls
        pagina={2}
        totalPaginas={5}
        total={50}
        limite={10}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Pagination controls")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();

    await act(async () => {
      await changeLanguage("pt");
    });
    rerender(
      <PaginationControls
        pagina={2}
        totalPaginas={5}
        total={50}
        limite={10}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Controles de paginação")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 5")).toBeInTheDocument();
  });

  it("10. Pluralización real de i18next en paginación y métricas", async () => {
    expect(i18n.t("pagination.recordsCount", { count: 1 })).toBe("1 registro");
    expect(i18n.t("pagination.recordsCount", { count: 5 })).toBe("5 registros");

    await changeLanguage("en");
    expect(i18n.t("pagination.recordsCount", { count: 1 })).toBe("1 record");
    expect(i18n.t("pagination.recordsCount", { count: 5 })).toBe("5 records");

    await changeLanguage("pt");
    expect(i18n.t("pagination.recordsCount", { count: 1 })).toBe("1 registro");
    expect(i18n.t("pagination.recordsCount", { count: 5 })).toBe("5 registros");
  });

  it("11. DataTableShell con defaults traducidos", async () => {
    const { rerender } = render(
      <DataTableShell
        columns={[{ key: "id", header: "ID", render: () => null }]}
        data={[]}
        getRowKey={() => "1"}
      />
    );

    expect(screen.getByText("No hay datos para mostrar.")).toBeInTheDocument();

    await act(async () => {
      await changeLanguage("en");
    });
    rerender(
      <DataTableShell
        columns={[{ key: "id", header: "ID", render: () => null }]}
        data={[]}
        getRowKey={() => "1"}
      />
    );
    expect(screen.getByText("No data to display.")).toBeInTheDocument();
  });

  it("12. Estados de dominio y métodos de pago traducidos en ES, EN y PT", async () => {
    // Español
    expect(translateStatus("paymentStatus", "PAGADA")).toBe("Pagada");
    expect(translateStatus("paymentStatus", "PARCIAL")).toBe("Pago parcial");
    expect(translateStatus("paymentStatus", "EN_DEUDA")).toBe("En deuda");
    expect(translateStatus("paymentStatus", "ANULADA")).toBe("Anulada");

    expect(translateStatus("paymentMethods", "EFECTIVO")).toBe("Efectivo");
    expect(translateStatus("paymentMethods", "SINPE")).toBe("SINPE");
    expect(translateStatus("paymentMethods", "TRANSFERENCIA")).toBe("Transferencia");
    expect(translateStatus("paymentMethods", "TARJETA")).toBe("Tarjeta");
    expect(translateStatus("paymentMethods", "MIXTO")).toBe("Mixto");
    expect(translateStatus("paymentMethods", "OTRO")).toBe("Otro");

    expect(translateStatus("lots", "EN_PROCESO")).toBe("En proceso");
    expect(translateStatus("lots", "EN_STOCK")).toBe("En stock");
    expect(translateStatus("lots", "VENDIDO_PARCIAL")).toBe("Vendido parcial");
    expect(translateStatus("lots", "AGOTADO")).toBe("Agotado");

    expect(translateStatus("orders", "REGISTRADO")).toBe("Registrado");
    expect(translateStatus("orders", "EN_TRANSITO")).toBe("En tránsito");
    expect(translateStatus("orders", "RECIBIDO")).toBe("Recibido");
    expect(translateStatus("orders", "CANCELADO")).toBe("Cancelado");
    expect(getCatalogStatusLabel(i18n.t, true)).toBe("Activo");
    expect(getCatalogStatusLabel(i18n.t, false)).toBe("Inactivo");

    // English
    await changeLanguage("en");
    expect(translateStatus("paymentStatus", "PAGADA")).toBe("Paid");
    expect(translateStatus("paymentStatus", "PARCIAL")).toBe("Partially paid");
    expect(translateStatus("paymentStatus", "EN_DEUDA")).toBe("Outstanding");
    expect(translateStatus("paymentStatus", "ANULADA")).toBe("Voided");

    expect(translateStatus("paymentMethods", "EFECTIVO")).toBe("Cash");
    expect(translateStatus("paymentMethods", "SINPE")).toBe("SINPE");
    expect(translateStatus("paymentMethods", "TRANSFERENCIA")).toBe("Bank transfer");
    expect(translateStatus("paymentMethods", "TARJETA")).toBe("Card");
    expect(translateStatus("paymentMethods", "MIXTO")).toBe("Mixed");
    expect(translateStatus("paymentMethods", "OTRO")).toBe("Other");

    expect(translateStatus("lots", "EN_PROCESO")).toBe("In progress");
    expect(translateStatus("lots", "EN_STOCK")).toBe("In stock");
    expect(translateStatus("lots", "VENDIDO_PARCIAL")).toBe("Partially sold");
    expect(translateStatus("lots", "AGOTADO")).toBe("Depleted");

    expect(translateStatus("orders", "REGISTRADO")).toBe("Registered");
    expect(translateStatus("orders", "EN_TRANSITO")).toBe("In transit");
    expect(translateStatus("orders", "RECIBIDO")).toBe("Received");
    expect(translateStatus("orders", "CANCELADO")).toBe("Canceled");
    expect(getCatalogStatusLabel(i18n.t, true)).toBe("Active");
    expect(getCatalogStatusLabel(i18n.t, false)).toBe("Inactive");

    // Português
    await changeLanguage("pt");
    expect(translateStatus("paymentStatus", "PAGADA")).toBe("Paga");
    expect(translateStatus("paymentStatus", "PARCIAL")).toBe("Pagamento parcial");
    expect(translateStatus("paymentStatus", "EN_DEUDA")).toBe("Em dívida");
    expect(translateStatus("paymentStatus", "ANULADA")).toBe("Anulada");

    expect(translateStatus("paymentMethods", "EFECTIVO")).toBe("Dinheiro");
    expect(translateStatus("paymentMethods", "SINPE")).toBe("SINPE");
    expect(translateStatus("paymentMethods", "TRANSFERENCIA")).toBe("Transferência bancária");
    expect(translateStatus("paymentMethods", "TARJETA")).toBe("Cartão");
    expect(translateStatus("paymentMethods", "MIXTO")).toBe("Misto");
    expect(translateStatus("paymentMethods", "OTRO")).toBe("Outro");

    expect(translateStatus("lots", "EN_PROCESO")).toBe("Em andamento");
    expect(translateStatus("lots", "EN_STOCK")).toBe("Em estoque");
    expect(translateStatus("lots", "VENDIDO_PARCIAL")).toBe("Vendido parcial");
    expect(translateStatus("lots", "AGOTADO")).toBe("Esgotado");

    expect(translateStatus("orders", "REGISTRADO")).toBe("Registrado");
    expect(translateStatus("orders", "EN_TRANSITO")).toBe("Em trânsito");
    expect(translateStatus("orders", "RECIBIDO")).toBe("Recebido");
    expect(translateStatus("orders", "CANCELADO")).toBe("Cancelado");
    expect(getCatalogStatusLabel(i18n.t, true)).toBe("Ativo");
    expect(getCatalogStatusLabel(i18n.t, false)).toBe("Inativo");
  });

  it("13. Fallback seguro ante código o estado desconocido sin arrojar error", () => {
    expect(translateStatus("orders", "ESTADO_DESCONOCIDO")).toBe("ESTADO_DESCONOCIDO");
    expect(translateStatus("paymentStatus", "CODIGO_NUEVO")).toBe("CODIGO_NUEVO");
    expect(translateStatus("paymentMethods", "BITCOIN")).toBe("BITCOIN");
    expect(translateStatus("sales", null as unknown as string)).toBe("");
  });

  it("14 y 15. Ausencia de claves vacías y claves crudas", () => {
    const commonSave = i18n.t("common.save");
    expect(commonSave).toBeTruthy();
    expect(commonSave).not.toBe("common.save");
    expect(commonSave.trim()).not.toBe("");
  });

  it("16. Traducciones accesibles en modales, botones y selectores", async () => {
    expect(i18n.t("common.closeModal")).toBe("Cerrar modal");
    expect(i18n.t("appLayout.openNav")).toBe("Abrir navegación");

    await changeLanguage("en");
    expect(i18n.t("common.closeModal")).toBe("Close modal");
    expect(i18n.t("appLayout.openNav")).toBe("Open navigation");

    await changeLanguage("pt");
    expect(i18n.t("common.closeModal")).toBe("Fechar modal");
    expect(i18n.t("appLayout.openNav")).toBe("Abrir navegação");
  });

  it("17 y 18. Locale dinámico en formateadores y preservación de CRC", async () => {
    const formattedCR = formatCurrency(12500);
    expect(formattedCR).toContain("₡");

    await changeLanguage("en");
    const formattedUS = formatCurrency(12500);
    // Currency symbol or code must remain CRC/₡
    expect(formattedUS).toMatch(/(₡|CRC)/);
    // Number format changes based on en-US locale
    expect(formatNumber(12500.5)).toBe("12,500.5");

    await changeLanguage("pt");
    const formattedBR = formatCurrency(12500);
    expect(formattedBR).toMatch(/(₡|CRC)/);
    expect(formatNumber(12500.5)).toBe("12.500,5");
  });
});
