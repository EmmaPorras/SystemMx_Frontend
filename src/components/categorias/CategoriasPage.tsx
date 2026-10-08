import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Tags } from "lucide-react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import ConfirmDialog from "../common/ConfirmDialog";
import InputField from "../common/InputField";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";

import {
  actualizarCategoriaApi,
  crearCategoriaApi,
  desactivarCategoriaApi,
  obtenerCategorias,
} from "../../services/categoriasApi";

import FormularioCategoria from "./FormularioCategoria";
import TablaCategorias from "./TablaCategorias";

import type {
  Categoria,
  CategoriaFormData,
  CategoriaFormErrors,
} from "./categorias.types";

type PageAlert = {
  variant: "success" | "error";
  title: string;
  message: string;
};

const INITIAL_FORM: CategoriaFormData = {
  nombre: "",
  descripcion: "",
  activo: true,
};

function CategoriasPage() {
  const { t } = useTranslation();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [alert, setAlert] = useState<PageAlert | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaDesactivar, setCategoriaDesactivar] = useState<Categoria | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [form, setForm] = useState<CategoriaFormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<CategoriaFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function cargarCategorias() {
    setLoading(true);
    setErrorCarga(null);

    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      setErrorCarga(
        error instanceof Error
          ? error.message
          : t("errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargarCategorias();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return categorias;

    return categorias.filter((categoria) =>
      [
        categoria.nombre,
        categoria.descripcion ?? "",
        categoria.activo ? "activa" : "inactiva",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda, categorias]);

  function abrirNuevaCategoria() {
    setCategoriaEditando(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function abrirEditarCategoria(categoria: Categoria) {
    setCategoriaEditando(categoria);
    setForm({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? "",
      activo: categoria.activo,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function cerrarModal() {
    if (isSubmitting) return;
    setModalOpen(false);
    setCategoriaEditando(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
  }

  function handleFormChange(
    field: keyof CategoriaFormData,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "nombre" || field === "descripcion") {
      setFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  }

  function validarFormulario(): boolean {
    const errors: CategoriaFormErrors = {};
    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();

    if (!nombre) {
      errors.nombre = t("categories.nameRequired");
    } else if (nombre.length > 100) {
      errors.nombre = t("categories.nameMaxLength");
    }

    if (descripcion.length > 255) {
      errors.descripcion = t("categories.descMaxLength");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function guardarCategoria() {
    if (!validarFormulario()) return;

    setIsSubmitting(true);
    setAlert(null);

    try {
      if (categoriaEditando) {
        await actualizarCategoriaApi(categoriaEditando.idCategoria, form);
        setAlert({
          variant: "success",
          title: t("common.success"),
          message: t("categories.updateSuccess"),
        });
      } else {
        await crearCategoriaApi(form);
        setAlert({
          variant: "success",
          title: t("common.success"),
          message: t("categories.createSuccess"),
        });
      }

      setModalOpen(false);
      setCategoriaEditando(null);
      setForm(INITIAL_FORM);
      setFormErrors({});
      await cargarCategorias();
    } catch (error) {
      setAlert({
        variant: "error",
        title: t("common.errorOccurred"),
        message:
          error instanceof Error
            ? error.message
            : t("errors.generic"),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmarDesactivacion() {
    if (!categoriaDesactivar || isDeactivating) return;

    setIsDeactivating(true);
    try {
      await desactivarCategoriaApi(categoriaDesactivar.idCategoria);
      await cargarCategorias();
      setAlert({
        variant: "success",
        title: t("common.success"),
        message: t("categories.deleteSuccess"),
      });
      setCategoriaDesactivar(null);
    } catch (error) {
      setAlert({
        variant: "error",
        title: t("common.errorOccurred"),
        message:
          error instanceof Error
            ? error.message
            : t("errors.generic"),
      });
    } finally {
      setIsDeactivating(false);
    }
  }

  const activas = categorias.filter((categoria) => categoria.activo).length;
  const inactivas = categorias.length - activas;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("categories.title")}
        description={t("categories.subtitle")}
        icon={Tags}
        action={
          <PrimaryButton onClick={abrirNuevaCategoria}>
            {t("categories.newCategory")}
          </PrimaryButton>
        }
      />

      {alert ? (
        <AlertMessage
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("categories.title")}
          value={String(categorias.length)}
          hint={t("common.total")}
          icon={Tags}
          variant="info"
        />

        <StatCard
          label={t("common.active")}
          value={String(activas)}
          hint={t("common.active")}
          icon={Tags}
          variant="success"
        />

        <StatCard
          label={t("common.inactive")}
          value={String(inactivas)}
          hint={t("common.inactive")}
          icon={Tags}
          variant="neutral"
        />
      </div>

      <SectionCard
        title={t("categories.title")}
        description={t("categories.subtitle")}
      >
        <div className="mb-5">
          <InputField
            label={t("common.search")}
            value={busqueda}
            onChange={setBusqueda}
            placeholder={t("common.searchPlaceholder")}
          />
        </div>

        {loading ? (
          <LoadingState message={t("common.loading")} />
        ) : errorCarga ? (
          <div className="space-y-4">
            <AlertMessage
              variant="error"
              title={t("common.errorOccurred")}
              message={errorCarga}
            />

            <PrimaryButton
              onClick={() => {
                void cargarCategorias();
              }}
            >
              {t("common.reload")}
            </PrimaryButton>
          </div>
        ) : (
          <TablaCategorias
            categorias={categoriasFiltradas}
            onEdit={abrirEditarCategoria}
            onDeactivate={setCategoriaDesactivar}
          />
        )}
      </SectionCard>

      <AppModal
        isOpen={modalOpen}
        title={
          categoriaEditando
            ? t("categories.editCategory")
            : t("categories.newCategory")
        }
        description={
          categoriaEditando
            ? t("categories.subtitle")
            : t("categories.subtitle")
        }
        onClose={cerrarModal}
        maxWidthClassName="max-w-xl"
        isSubmitting={isSubmitting}
      >
        <FormularioCategoria
          value={form}
          errors={formErrors}
          isSubmitting={isSubmitting}
          submitLabel={
            categoriaEditando
              ? t("common.saveChanges")
              : t("categories.newCategory")
          }
          onChange={handleFormChange}
          onSubmit={guardarCategoria}
          onCancel={cerrarModal}
        />
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(categoriaDesactivar)}
        title={t("categories.deleteConfirmTitle")}
        message={
          categoriaDesactivar
            ? t("categories.deleteConfirmMessage", { name: categoriaDesactivar.nombre })
            : ""
        }
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        variant="warning"
        isLoading={isDeactivating}
        onConfirm={confirmarDesactivacion}
        onCancel={() => setCategoriaDesactivar(null)}
      />
    </div>
  );
}

export default CategoriasPage;
