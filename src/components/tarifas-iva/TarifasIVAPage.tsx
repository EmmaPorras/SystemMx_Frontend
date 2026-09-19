import { useEffect, useMemo, useState } from "react";
import { AiOutlinePercentage } from "react-icons/ai";

import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import InputField from "../common/InputField";
import AppModal from "../common/AppModal";
import AlertMessage from "../common/AlertMessage";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingState from "../common/LoadingState";

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
    errors.descripcion =
      "La descripción no puede superar los 45 caracteres.";
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
  const [tarifaAEliminar, setTarifaAEliminar] = useState<TarifaIVA | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    void cargarTarifas();
  }, []);

  const tarifasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) {
      return tarifas;
    }

    return tarifas.filter((item) =>
      [
        item.codigo,
        item.descripcion,
        String(item.porcentaje),
        item.estado,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda, tarifas]);

  const tarifaGeneral = useMemo(() => {
    const tarifaEncontrada = tarifas.find(
      (item) =>
        item.codigo.trim().toUpperCase() === "IVA" &&
        item.estado === "ACTIVA",
    );

    return tarifaEncontrada
      ? `${tarifaEncontrada.porcentaje}%`
      : "No definida";
  }, [tarifas]);

  const tarifaMasAlta = useMemo(() => {
    const porcentajesActivos = tarifas
      .filter((item) => item.estado === "ACTIVA")
      .map((item) => Number(item.porcentaje))
      .filter((porcentaje) => Number.isFinite(porcentaje));

    if (porcentajesActivos.length === 0) {
      return "No definida";
    }

    const porcentajeMayor = Math.max(...porcentajesActivos);
    return `${porcentajeMayor}%`;
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
    setTarifa({ ...tarifaSeleccionada });
    setErrors({});
    setIsModalOpen(true);
  }

  function cerrarModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setTarifa(tarifaInicial);
    setErrors({});
    setModalMode("create");
  }

  function actualizarTarifa(
    field: TarifaIVAFormField,
    value: string,
  ) {
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

    setIsSaving(true);
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
            item.id === tarifaActualizada.id
              ? tarifaActualizada
              : item,
          ),
        );

        setAlert({
          variant: "success",
          title: "Tarifa actualizada",
          message: "La tarifa IVA se actualizó correctamente.",
        });
      }

      setIsModalOpen(false);
      setTarifa(tarifaInicial);
      setErrors({});
      setModalMode("create");
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
    } finally {
      setIsSaving(false);
    }
  }

  function solicitarEliminarTarifa(tarifaSeleccionada: TarifaIVA) {
    setTarifaAEliminar(tarifaSeleccionada);
  }

  async function confirmarEliminarTarifa() {
    if (!tarifaAEliminar || isDeleting) return;

    setIsDeleting(true);
    try {
      await eliminarTarifaIvaApi(tarifaAEliminar.id);
      await cargarTarifas();
      setAlert({
        variant: "success",
        title: "Tarifa desactivada",
        message: "La tarifa IVA quedó inactiva correctamente.",
      });
      setTarifaAEliminar(null);
    } catch (error) {
      setAlert({
        variant: "error",
        title: "No se pudo desactivar la tarifa",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo desactivar la tarifa IVA.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarifas IVA"
        description="Catálogo de impuestos listo para ser consumido por productos, pedidos y ventas."
        icon={AiOutlinePercentage}
        iconTo="/"
        iconAriaLabel="Volver al inicio"
        action={
          <BotonAgregarTarifa
            onClick={abrirModalCrear}
          />
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
          label="Tarifas registradas"
          value={String(tarifas.length)}
          hint="Cantidad total de tarifas registradas"
          icon={AiOutlinePercentage}
          variant="info"
        />

        <StatCard
          label="Tarifa general"
          value={tarifaGeneral}
          hint="Tarifa activa identificada con el código IVA"
          icon={AiOutlinePercentage}
          variant="success"
        />

        <StatCard
          label="Tarifa más alta"
          value={tarifaMasAlta}
          hint="Mayor porcentaje activo registrado"
          icon={AiOutlinePercentage}
          variant="danger"
        />
      </div>

      <SectionCard
        title="Listado de tarifas"
        description="Administrá las tarifas disponibles para productos, pedidos y ventas."
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
          <LoadingState message="Cargando tarifas IVA..." />
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
          modalMode === "create"
            ? "Agregar tarifa IVA"
            : "Editar tarifa IVA"
        }
        description={
          modalMode === "create"
            ? "Registrá una nueva tarifa para usarla en productos, pedidos y ventas."
            : "Actualizá los datos de la tarifa seleccionada."
        }
        onClose={cerrarModal}
        isSubmitting={isSaving}
        maxWidthClassName="max-w-2xl"
      >
        <FormularioTarifa
          tarifa={tarifa}
          errors={errors}
          isSubmitting={isSaving}
          submitLabel={
            modalMode === "create"
              ? "Guardar tarifa"
              : "Actualizar tarifa"
          }
          onChange={actualizarTarifa}
          onSubmit={guardarTarifa}
          onCancel={cerrarModal}
        />
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(tarifaAEliminar)}
        title="Desactivar tarifa IVA"
        message={
          tarifaAEliminar
            ? `¿Seguro que querés desactivar la tarifa "${tarifaAEliminar.codigo}"? Dejará de estar disponible para nuevas operaciones, pero conservará su historial.`
            : ""
        }
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        variant="warning"
        isLoading={isDeleting}
        onConfirm={confirmarEliminarTarifa}
        onCancel={() => setTarifaAEliminar(null)}
      />
    </div>
  );
}

export default TarifasIVAPage;