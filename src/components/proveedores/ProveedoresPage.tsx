import { useEffect, useMemo, useState } from "react";
import { ImAddressBook } from "react-icons/im";
import { RiResetLeftFill } from "react-icons/ri";
import {
  BsPersonFill,
  BsPersonFillCheck,
  BsPersonFillSlash,
} from "react-icons/bs";
import { useTranslation } from "react-i18next";

import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import AppModal from "../common/AppModal";
import AlertMessage from "../common/AlertMessage";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingState from "../common/LoadingState";

import BotonAgregarProveedor from "./BotonAgregarProveedor";
import FormularioProveedor from "./FormularioProveedor";
import ProveedorDetalleModal from "./ProveedorDetalleModal";
import TablaProveedores from "./TablaProveedores";

import {
  actualizarProveedorApi,
  crearProveedor,
  eliminarProveedorApi,
  obtenerProveedores,
} from "../../services/proveedoresApi";

import {
  monedaPreferidaOptions,
  type EstadoProveedor,
  type MonedaPreferida,
  type Proveedor,
  type ProveedorFormErrors,
  type ProveedorFormField,
} from "./proveedores.types";

const proveedorInicial: Proveedor = {
  id: 0,
  nombre: "",
  telefono: "",
  correo: "",
  pais: "",
  direccion: "",
  estado: "ACTIVO",
  monedaPreferida: "CRC",
};

type ModalMode = "create" | "edit";

type AlertState = {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

function ProveedoresPage() {
  const { t } = useTranslation();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroPais, setFiltroPais] = useState("");
  const [filtroMoneda, setFiltroMoneda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoProveedor | "">("");

  const [proveedor, setProveedor] = useState<Proveedor>(proveedorInicial);
  const [errors, setErrors] = useState<ProveedorFormErrors>({});
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  const [proveedorDetalle, setProveedorDetalle] = useState<Proveedor | null>(null);
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [alerta, setAlerta] = useState<AlertState | null>(null);

  const esEdicion = modalMode === "edit";

  function validarProveedorLocal(item: Proveedor): ProveedorFormErrors {
    const errs: ProveedorFormErrors = {};
    const nombre = item.nombre.trim();
    const telefono = item.telefono.trim();
    const correo = item.correo.trim();
    const pais = item.pais.trim();

    if (!nombre) {
      errs.nombre = t("suppliers.nameRequired");
    } else if (nombre.length > 40) {
      errs.nombre = t("validation.maxLength", { count: 40 });
    }

    if (!telefono) {
      errs.telefono = t("suppliers.phoneRequired");
    } else if (telefono.length > 20) {
      errs.telefono = t("validation.maxLength", { count: 20 });
    }

    if (!correo) {
      errs.correo = t("suppliers.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
      errs.correo = t("validation.emailInvalid");
    }

    if (!pais) {
      errs.pais = t("suppliers.countryRequired");
    }

    if (!item.monedaPreferida) {
      errs.monedaPreferida = t("suppliers.currencyRequired");
    }

    return errs;
  }

  async function cargarProveedores() {
    try {
      setIsLoading(true);
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (error) {
      setAlerta({
        variant: "error",
        title: t("common.errorOccurred"),
        message: error instanceof Error ? error.message : t("errors.generic"),
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void cargarProveedores();
  }, []);

  const paisesRegistradosOptions = useMemo(() => {
    const unicos = Array.from(
      new Set(
        proveedores
          .map((item) => item.pais?.trim())
          .filter((item): item is string => Boolean(item)),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return unicos.map((pais) => ({ value: pais, label: pais }));
  }, [proveedores]);

  const monedasRegistradasOptions = useMemo(() => {
    return monedaPreferidaOptions;
  }, []);

  const proveedoresFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();

    return proveedores.filter((item) => {
      const coincideNombre =
        !query || item.nombre.toLowerCase().includes(query);

      const coincidePais =
        !filtroPais ||
        (item.pais ?? "").toLowerCase() === filtroPais.toLowerCase();

      const coincideMoneda =
        !filtroMoneda ||
        item.monedaPreferida.toUpperCase() === filtroMoneda.toUpperCase();

      const coincideEstado =
        !filtroEstado ||
        item.estado.toUpperCase() === filtroEstado.toUpperCase();

      return (
        coincideNombre &&
        coincidePais &&
        coincideMoneda &&
        coincideEstado
      );
    });
  }, [busqueda, filtroEstado, filtroMoneda, filtroPais, proveedores]);

  const totalActivos = useMemo(
    () => proveedores.filter((item) => item.estado === "ACTIVO").length,
    [proveedores],
  );

  const totalInactivos = proveedores.length - totalActivos;

  const hayFiltrosPersonalizados = Boolean(
    busqueda.trim() || filtroPais || filtroMoneda || filtroEstado,
  );

  function restablecerFiltros() {
    setBusqueda("");
    setFiltroPais("");
    setFiltroMoneda("");
    setFiltroEstado("");
  }

  function abrirModalNuevoProveedor() {
    setModalMode("create");
    setProveedor(proveedorInicial);
    setErrors({});
    setAlerta(null);
    setModalProveedorAbierto(true);
  }

  function abrirModalEditarProveedor(proveedorSeleccionado: Proveedor) {
    setModalMode("edit");
    setProveedor({
      ...proveedorSeleccionado,
    });
    setErrors({});
    setAlerta(null);
    setModalProveedorAbierto(true);
  }

  function cerrarModalProveedor() {
    if (isSaving) return;
    setModalProveedorAbierto(false);
    setProveedor(proveedorInicial);
    setErrors({});
    setModalMode("create");
  }

  function actualizarProveedor(
    field: ProveedorFormField,
    value: string,
  ) {
    setProveedor((prev) => ({
      ...prev,
      [field]:
        field === "estado"
          ? (value as EstadoProveedor)
          : field === "monedaPreferida"
            ? (value as MonedaPreferida)
            : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  async function guardarProveedor() {
    const validationErrors = validarProveedorLocal(proveedor);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const proveedorLimpio: Proveedor = {
      ...proveedor,
      nombre: proveedor.nombre.trim(),
      telefono: proveedor.telefono.trim(),
      correo: proveedor.correo.trim().toLowerCase(),
      pais: proveedor.pais.trim(),
      direccion: proveedor.direccion.trim(),
      monedaPreferida: proveedor.monedaPreferida,
    };

    setIsSaving(true);

    try {
      if (esEdicion) {
        const proveedorActualizado = await actualizarProveedorApi(
          proveedorLimpio.id,
          proveedorLimpio,
        );

        setProveedores((prev) =>
          prev.map((item) =>
            item.id === proveedorActualizado.id
              ? proveedorActualizado
              : item,
          ),
        );

        setAlerta({
          variant: "success",
          title: t("common.success"),
          message: t("suppliers.updateSuccess"),
        });
      } else {
        const proveedorCreado = await crearProveedor(proveedorLimpio);

        setProveedores((prev) => [
          proveedorCreado,
          ...prev,
        ]);

        setAlerta({
          variant: "success",
          title: t("common.success"),
          message: t("suppliers.createSuccess"),
        });
      }

      setModalProveedorAbierto(false);
      setProveedor(proveedorInicial);
      setErrors({});
      setModalMode("create");
    } catch (error) {
      setAlerta({
        variant: "error",
        title: t("common.errorOccurred"),
        message: error instanceof Error ? error.message : t("errors.generic"),
      });
    } finally {
      setIsSaving(false);
    }
  }

  function abrirConfirmacionEliminar(proveedorSeleccionado: Proveedor) {
    setProveedorAEliminar(proveedorSeleccionado);
  }

  function cerrarConfirmacionEliminar() {
    if (isDeleting) return;
    setProveedorAEliminar(null);
  }

  async function eliminarProveedor() {
    if (!proveedorAEliminar || isDeleting) return;

    setIsDeleting(true);
    try {
      await eliminarProveedorApi(proveedorAEliminar.id);

      setProveedores((prev) =>
        prev.map((item) =>
          item.id === proveedorAEliminar.id
            ? {
                ...item,
                estado: "INACTIVO",
              }
            : item,
        ),
      );

      setAlerta({
        variant: "success",
        title: t("common.success"),
        message: t("suppliers.deleteSuccess"),
      });

      setProveedorAEliminar(null);
    } catch (error) {
      setAlerta({
        variant: "error",
        title: t("common.errorOccurred"),
        message: error instanceof Error ? error.message : t("errors.generic"),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("suppliers.title")}
        description={t("suppliers.subtitle")}
        icon={ImAddressBook}
        iconTo="/"
        iconAriaLabel={t("common.goHome")}
        action={
          <BotonAgregarProveedor
            onClick={abrirModalNuevoProveedor}
          />
        }
      />

      {alerta ? (
        <AlertMessage
          variant={alerta.variant}
          title={alerta.title}
          message={alerta.message}
          onClose={() => setAlerta(null)}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("suppliers.title")}
          value={String(proveedores.length)}
          hint={t("common.total")}
          icon={BsPersonFill}
          variant="info"
        />

        <StatCard
          label={t("common.active")}
          value={String(totalActivos)}
          hint={t("common.active")}
          icon={BsPersonFillCheck}
          variant="success"
        />

        <StatCard
          label={t("common.inactive")}
          value={String(totalInactivos)}
          hint={t("common.inactive")}
          icon={BsPersonFillSlash}
          variant="danger"
        />
      </div>

      <SectionCard
        title={t("suppliers.title")}
        description={t("suppliers.subtitle")}
      >
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <InputField
            label={t("common.search")}
            value={busqueda}
            onChange={setBusqueda}
            placeholder={t("suppliers.searchPlaceholder")}
            maxLength={100}
          />

          <SelectField
            label={t("suppliers.country")}
            value={filtroPais}
            onChange={setFiltroPais}
            placeholder={t("suppliers.allCountries")}
            options={paisesRegistradosOptions}
          />

          <SelectField
            label={t("suppliers.currency")}
            value={filtroMoneda}
            onChange={setFiltroMoneda}
            placeholder={t("common.all")}
            options={monedasRegistradasOptions}
          />

          <SelectField
            label={t("common.status")}
            value={filtroEstado}
            onChange={(value) =>
              setFiltroEstado(value as EstadoProveedor)
            }
            options={[
              {
                value: "ACTIVO",
                label: t("common.active"),
              },
              {
                value: "INACTIVO",
                label: t("common.inactive"),
              },
            ]}
          />

          <div className="flex items-end">
            <button
              type="button"
              onClick={restablecerFiltros}
              disabled={!hayFiltrosPersonalizados}
              aria-label={t("common.cleanFilters")}
              title={t("common.cleanFilters")}
              className="inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3.5 text-xs sm:text-sm font-semibold text-zinc-700 shadow-2xs transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
            >
              <RiResetLeftFill className="h-4 w-4" aria-hidden="true" />
              <span>{t("common.cleanFilters")}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message={t("common.loading")} />
        ) : (
          <TablaProveedores
            proveedores={proveedoresFiltrados}
            onView={setProveedorDetalle}
            onEdit={abrirModalEditarProveedor}
            onDelete={abrirConfirmacionEliminar}
          />
        )}
      </SectionCard>

      <ProveedorDetalleModal
        proveedor={proveedorDetalle}
        isOpen={Boolean(proveedorDetalle)}
        onClose={() => setProveedorDetalle(null)}
      />

      <AppModal
        isOpen={modalProveedorAbierto}
        title={esEdicion ? t("suppliers.editSupplier") : t("suppliers.newSupplier")}
        description={t("suppliers.subtitle")}
        onClose={cerrarModalProveedor}
        isSubmitting={isSaving}
        maxWidthClassName="max-w-3xl"
      >
        <FormularioProveedor
          proveedor={proveedor}
          errors={errors}
          isSubmitting={isSaving}
          submitLabel={
            esEdicion
              ? t("common.saveChanges")
              : t("suppliers.newSupplier")
          }
          onChange={actualizarProveedor}
          onSubmit={guardarProveedor}
          onCancel={cerrarModalProveedor}
        />
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(proveedorAEliminar)}
        title={t("suppliers.deleteConfirmTitle")}
        message={
          proveedorAEliminar
            ? t("suppliers.deleteConfirmMessage", { name: proveedorAEliminar.nombre })
            : ""
        }
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        variant="warning"
        isLoading={isDeleting}
        onConfirm={eliminarProveedor}
        onCancel={cerrarConfirmacionEliminar}
      />
    </div>
  );
}

export default ProveedoresPage;