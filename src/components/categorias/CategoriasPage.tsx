import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Tags } from "lucide-react";

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
          : "No fue posible cargar las categorías.",
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
      errors.nombre = "El nombre de la categoría es obligatorio.";
    } else if (nombre.length > 100) {
      errors.nombre = "El nombre no puede superar 100 caracteres.";
    }

    if (descripcion.length > 255) {
      errors.descripcion = "La descripción no puede superar 255 caracteres.";
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
          title: "Categoría actualizada",
          message: "La categoría se actualizó correctamente.",
        });
      } else {
        await crearCategoriaApi(form);
        setAlert({
          variant: "success",
          title: "Categoría creada",
          message: "La categoría se registró correctamente.",
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
        title: categoriaEditando
          ? "No se pudo actualizar la categoría"
          : "No se pudo crear la categoría",
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al guardar la categoría.",
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
        title: "Categoría desactivada",
        message: `La categoría "${categoriaDesactivar.nombre}" quedó inactiva correctamente.`,
      });
      setCategoriaDesactivar(null);
    } catch (error) {
      setAlert({
        variant: "error",
        title: "No se pudo desactivar la categoría",
        message:
          error instanceof Error
            ? error.message
            : "No fue posible desactivar la categoría.",
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
        title="Categorías"
        description="Administrá la clasificación utilizada por los productos del sistema."
        icon={Tags}
        action={
          <PrimaryButton onClick={abrirNuevaCategoria}>
            Nueva categoría
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
          label="Categorías"
          value={String(categorias.length)}
          hint="Total de categorías registradas"
          icon={Tags}
          variant="info"
        />

        <StatCard
          label="Activas"
          value={String(activas)}
          hint="Disponibles para clasificación"
          icon={Tags}
          variant="success"
        />

        <StatCard
          label="Inactivas"
          value={String(inactivas)}
          hint="Conservadas por historial"
          icon={Tags}
          variant="neutral"
        />
      </div>

      <SectionCard
        title="Listado de categorías"
        description="Las categorías inactivas conservan su historial y pueden editarse nuevamente."
      >
        <div className="mb-5">
          <InputField
            label="Buscar categoría"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Nombre, descripción o estado"
          />
        </div>

        {loading ? (
          <LoadingState message="Cargando categorías..." />
        ) : errorCarga ? (
          <div className="space-y-4">
            <AlertMessage
              variant="error"
              title="No fue posible cargar las categorías"
              message={errorCarga}
            />

            <PrimaryButton
              onClick={() => {
                void cargarCategorias();
              }}
            >
              Reintentar
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
            ? "Editar categoría"
            : "Nueva categoría"
        }
        description={
          categoriaEditando
            ? "Actualizá la información de la categoría."
            : "Registrá una nueva categoría para clasificar productos."
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
              ? "Guardar cambios"
              : "Crear categoría"
          }
          onChange={handleFormChange}
          onSubmit={guardarCategoria}
          onCancel={cerrarModal}
        />
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(categoriaDesactivar)}
        title="Desactivar categoría"
        message={
          categoriaDesactivar
            ? `¿Seguro que querés desactivar la categoría "${categoriaDesactivar.nombre}"? Conservará su historial, pero dejará de estar disponible como categoría activa.`
            : ""
        }
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        variant="warning"
        isLoading={isDeactivating}
        onConfirm={confirmarDesactivacion}
        onCancel={() => setCategoriaDesactivar(null)}
      />
    </div>
  );
}

export default CategoriasPage;
