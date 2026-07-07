import { useEffect, useMemo, useState } from "react";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import InputField from "../common/InputField";
import AppModal from "../common/AppModal";
import AlertMessage from "../common/AlertMessage";
import ConfirmDialog from "../common/ConfirmDialog";
import BotonAgregarTarifa from "./BotonAgregarTarifa";
import FormularioTarifa from "./FormularioTarifa";
import TablaTarifas from "./TablaTarifas";
import {
  actualizarTarifaIvaApi,
  crearTarifaIva,
  eliminarTarifaIvaApi,
  obtenerTarifasIva,
} from "../../services/tarifasIvaApi";
import type {
  EstadoTarifaIVA,
  TarifaIVA,
  TarifaIVAFormErrors,
  TarifaIVAFormField,
} from "./tarifas-iva.types";

type ModalMode = "create" | "edit";

const tarifaInicial: TarifaIVA = {
  id: 0,
  codigo: "",
  porcentaje: 0,
  descripcion: "",
  estado: "ACTIVA",
};

function validarTarifa(tarifa: TarifaIVA): TarifaIVAFormErrors {
  const errors: TarifaIVAFormErrors = {};

  const codigo = tarifa.codigo.trim();
  const descripcion = tarifa.descripcion.trim();
  const porcentaje = Number(tarifa.porcentaje);

  if (!codigo) {
    errors.codigo = "El código es obligatorio.";
  } else if (codigo.length > 20) {
    errors.codigo = "El código no puede superar los 20 caracteres.";
  }

  if (tarifa.porcentaje === null || tarifa.porcentaje === undefined) {
    errors.porcentaje = "El porcentaje es obligatorio.";
  } else if (Number.isNaN(porcentaje)) {
    errors.porcentaje = "El porcentaje debe ser un número válido.";
  } else if (porcentaje < 0) {
    errors.porcentaje = "El porcentaje no puede ser menor a 0.";
  } else if (porcentaje > 100) {
    errors.porcentaje = "El porcentaje no puede ser mayor a 100.";
  }

  if (!descripcion) {
    errors.descripcion = "La descripción es obligatoria.";
  } else if (descripcion.length > 45) {
    errors.descripcion = "La descripción no puede superar los 45 caracteres.";
  }

  if (!tarifa.estado) {
    errors.estado = "Seleccioná un estado.";
  } else if (!["ACTIVA", "INACTIVA"].includes(tarifa.estado)) {
    errors.estado = "El estado seleccionado no es válido.";
  }

  return errors;
}

function TarifasIVAPage() {
  const [tarifas, setTarifas] = useState<TarifaIVA[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [tarifa, setTarifa] = useState<TarifaIVA>(tarifaInicial);
  const [errors, setErrors] = useState<TarifaIVAFormErrors>({});
  const [tarifaAEliminar, setTarifaAEliminar] = useState<TarifaIVA | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    cargarTarifas();
  }, []);

  const tarifasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return tarifas;

    return tarifas.filter((item) =>
      [item.codigo, item.descripcion, String(item.porcentaje), item.estado]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda, tarifas]);

const tarifaGeneral = useMemo(() => {
  const tarifa = tarifas.find(
    (item) => item.codigo.toUpperCase() === "IVA" && item.estado === "ACTIVA",
  );

  return tarifa ? `${tarifa.porcentaje}%` : "No definida";
}, [tarifas]);

const tarifasActivas = useMemo(() => {
  return tarifas.filter((item) => item.estado === "ACTIVA").length;
}, [tarifas]);

  async function cargarTarifas() {
    try {
      setIsLoading(true);
      const data = await obtenerTarifasIva();
      setTarifas(data);
    } catch (error) {
      setAlert({
        variant: "error",
        title: "Error al cargar tarifas",
        message:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las tarifas IVA.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function abrirModalCrear() {
    setModalMode("create");
    setTarifa(tarifaInicial);
    setErrors({});
    setIsModalOpen(true);
  }

  function abrirModalEditar(tarifaSeleccionada: TarifaIVA) {
    setModalMode("edit");
    setTarifa(tarifaSeleccionada);
    setErrors({});
    setIsModalOpen(true);
  }

  function cerrarModal() {
    setIsModalOpen(false);
    setTarifa(tarifaInicial);
    setErrors({});
  }

  function actualizarTarifa(field: TarifaIVAFormField, value: string) {
    setTarifa((prev) => ({
      ...prev,
      [field]:
        field === "porcentaje"
          ? value === ""
            ? 0
            : Number(value)
          : field === "estado"
            ? (value as EstadoTarifaIVA)
            : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  async function guardarTarifa() {
    const validationErrors = validarTarifa(tarifa);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const tarifaLimpia: TarifaIVA = {
      ...tarifa,
      codigo: tarifa.codigo.trim().toUpperCase(),
      porcentaje: Number(tarifa.porcentaje),
      descripcion: tarifa.descripcion.trim(),
    };

    try {
      if (modalMode === "create") {
        const nuevaTarifa = await crearTarifaIva(tarifaLimpia);

        setTarifas((prev) => [nuevaTarifa, ...prev]);

        setAlert({
          variant: "success",
          title: "Tarifa creada",
          message: "La tarifa IVA se registró correctamente.",
        });
      } else {
        const tarifaActualizada = await actualizarTarifaIvaApi(
          tarifaLimpia.id,
          tarifaLimpia,
        );

        setTarifas((prev) =>
          prev.map((item) =>
            item.id === tarifaActualizada.id ? tarifaActualizada : item,
          ),
        );

        setAlert({
          variant: "success",
          title: "Tarifa actualizada",
          message: "La tarifa IVA se actualizó correctamente.",
        });
      }

      cerrarModal();
    } catch (error) {
      setAlert({
        variant: "error",
        title:
          modalMode === "create"
            ? "Error al crear tarifa"
            : "Error al actualizar tarifa",
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al guardar la tarifa IVA.",
      });
    }
  }

  function solicitarEliminarTarifa(tarifaSeleccionada: TarifaIVA) {
    setTarifaAEliminar(tarifaSeleccionada);
  }

  async function confirmarEliminarTarifa() {
    if (!tarifaAEliminar) return;

    try {
      await eliminarTarifaIvaApi(tarifaAEliminar.id);

      setTarifas((prev) =>
        prev.filter((item) => item.id !== tarifaAEliminar.id),
      );

      setAlert({
        variant: "success",
        title: "Tarifa eliminada",
        message: "La tarifa IVA se eliminó correctamente.",
      });

      setTarifaAEliminar(null);
    } catch (error) {
      setAlert({
        variant: "error",
        title: "Error al eliminar tarifa",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar la tarifa IVA.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarifas IVA"
        description="Catálogo de impuestos listo para ser consumido por productos, pedidos y ventas."
        action={<BotonAgregarTarifa onClick={abrirModalCrear} />}
      />

      {alert ? (
        <AlertMessage
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Tarifas registradas"
          value={String(tarifas.length)}
          hint="Ideal para centralizar el IVA y evitar duplicados"
        />

          <StatCard
            label="Tarifa general"
            value={tarifaGeneral}
            hint="Busca la tarifa activa con código IVA13"
          />

          <StatCard
            label="Tarifas activas"
            value={String(tarifasActivas)}
            hint="Cantidad de tarifas disponibles para usar"
          />
      </div>

      <SectionCard
        title="Listado de tarifas"
        description="Más adelante aquí también puedes validar si una tarifa está en uso antes de eliminarla."
      >
        <div className="mb-4">
          <InputField
            label="Buscar tarifa"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Código, porcentaje, descripción o estado"
          />
        </div>

        {isLoading ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Cargando tarifas IVA...
          </p>
        ) : (
          <TablaTarifas
            tarifas={tarifasFiltradas}
            onEdit={abrirModalEditar}
            onDelete={solicitarEliminarTarifa}
          />
        )}
      </SectionCard>

      <AppModal
        isOpen={isModalOpen}
        title={
          modalMode === "create" ? "Agregar tarifa IVA" : "Editar tarifa IVA"
        }
        description={
          modalMode === "create"
            ? "Registrá una nueva tarifa para usarla en productos, pedidos y ventas."
            : "Actualizá los datos de la tarifa seleccionada."
        }
        onClose={cerrarModal}
        maxWidthClassName="max-w-2xl"
      >
        <FormularioTarifa
          tarifa={tarifa}
          errors={errors}
          submitLabel={
            modalMode === "create" ? "Guardar tarifa" : "Actualizar tarifa"
          }
          onChange={actualizarTarifa}
          onSubmit={guardarTarifa}
          onCancel={cerrarModal}
        />
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(tarifaAEliminar)}
        title="Eliminar tarifa IVA"
        message={
          tarifaAEliminar
            ? `¿Seguro que querés eliminar la tarifa "${tarifaAEliminar.codigo}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmarEliminarTarifa}
        onCancel={() => setTarifaAEliminar(null)}
      />
    </div>
  );
}

export default TarifasIVAPage;