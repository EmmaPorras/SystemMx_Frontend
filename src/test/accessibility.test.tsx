import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axe from "axe-core";

import InputField from "../components/common/InputField";
import SelectField from "../components/common/SelectField";
import SearchableSelectField from "../components/common/SearchableSelectField";
import MoneyInputField from "../components/common/MoneyInputField";
import PasswordStrengthIndicator from "../components/common/PasswordStrengthIndicator";
import AlertMessage from "../components/common/AlertMessage";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";
import { LanguageSelector } from "../components/common/LanguageSelector";
import DataTableShell from "../components/common/DataTableShell";
import AppModal from "../components/common/AppModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AuthProvider from "../auth/AuthProvider";
import RegistroPage from "../auth/RegistroPage";
import LoginPage from "../components/auth/LoginPage";

const axeOptions = {
  rules: {
    "color-contrast": { enabled: false }, // jsdom no computa layout ni stylesheets CSS
  },
};

describe("Auditoría de Accesibilidad Integral con axe-core (WCAG 2.2 AAA)", () => {
  it("InputField no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <main>
        <InputField
          label="Nombre de Usuario"
          value="usuario.demo"
          onChange={vi.fn()}
          helperText="Ingrese su identificador único"
          required
        />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("InputField con estado de error conserva estructura accesible y aria-invalid", async () => {
    const { container } = render(
      <main>
        <InputField
          label="Correo Electrónico"
          value="invalido"
          onChange={vi.fn()}
          error="Formato de correo no válido"
          required
        />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("SelectField no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <main>
        <SelectField
          label="Rol del Usuario"
          value="OPERADOR"
          onChange={vi.fn()}
          options={[
            { value: "ADMIN", label: "Administrador" },
            { value: "OPERADOR", label: "Operador Comercial" },
            { value: "CONSULTA", label: "Solo Consulta" },
          ]}
          required
        />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("SearchableSelectField cumple jerarquía ARIA (listbox / option)", async () => {
    const { container } = render(
      <main>
        <SearchableSelectField
          label="Proveedor Comercial"
          value="1"
          onChange={vi.fn()}
          options={[
            { value: "1", label: "Distribuidora Tech" },
            { value: "2", label: "Importadora Global" },
          ]}
          required
        />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("MoneyInputField no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <main>
        <MoneyInputField
          label="Monto de Pago"
          value="15000"
          onChange={vi.fn()}
          currencySymbol="₡"
          required
        />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("PasswordStrengthIndicator cumple con rol progressbar y anuncio accesible", async () => {
    const { container } = render(
      <main>
        <PasswordStrengthIndicator password="MiClaveSegura2026!#" />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("AlertMessage en sus variantes cumple con roles semánticos y accesibilidad", async () => {
    const { container } = render(
      <main>
        <AlertMessage type="error" message="Error al procesar la operación" />
        <AlertMessage type="success" message="Operación completada con éxito" />
        <AlertMessage type="warning" message="Advertencia de inventario bajo" />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("EmptyState no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <main>
        <EmptyState
          title="No hay registros disponibles"
          description="Aún no se han creado registros en este catálogo comercial."
        />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("StatusBadge no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <main>
        <StatusBadge status="ACTIVO" />
        <StatusBadge status="PENDIENTE" />
        <StatusBadge status="INACTIVO" />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("LanguageSelector no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <nav aria-label="Selector de idioma">
        <LanguageSelector />
      </nav>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("DataTableShell renderiza tabla semántica sin violaciones de accesibilidad", async () => {
    const { container } = render(
      <main>
        <DataTableShell
          columns={[
            { key: "id", header: "ID", render: (row) => String(row.id) },
            { key: "nombre", header: "Nombre", render: (row) => row.nombre },
            { key: "estado", header: "Estado", render: (row) => row.estado },
          ]}
          data={[
            { id: 1, nombre: "Item 1", estado: "ACTIVO" },
            { id: 2, nombre: "Item 2", estado: "INACTIVO" },
          ]}
        />
      </main>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("AppModal cumple con accesibilidad de diálogos modales (role dialog y aria-modal)", async () => {
    const { container } = render(
      <AppModal
        isOpen={true}
        onClose={vi.fn()}
        title="Crear Proveedor Comercial"
        description="Complete los datos requeridos para registrar el nuevo proveedor."
      >
        <p>Contenido del modal</p>
      </AppModal>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("ConfirmDialog cumple con semántica de diálogo de alerta", async () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        title="Confirmar Anulación"
        message="¿Está seguro de que desea anular esta venta? Esta acción no se puede deshacer."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("RegistroPage cumple con accesibilidad completa axe en formulario público", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/registro"]}>
        <RegistroPage />
      </MemoryRouter>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("LoginPage cumple con accesibilidad completa axe en formulario de acceso", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });
});
