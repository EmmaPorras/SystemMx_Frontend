import { useEffect, useMemo, useState } from "react";
import { AiOutlinePercentage } from "react-icons/ai";
import { useTranslation } from "react-i18next";

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
  TarifaIVAFormState,
} from "./tarifas-iva.types";

type ModalMode = "create" | "edit";

const formStateInicial: TarifaIVAFormState = {
  id: 0,
  codigo: "",
  porcentaje: "",
  descripcion: "",
  estado: "ACTIVA",
};

function TarifasIVAPage() {
  const { t } = useTranslation();
  const [tarifas, setTarifas] = useState<TarifaIVA[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [tarifa, setTarifa] = useState<TarifaIVAFormState>(formStateInicial);
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

  function validarTarifaLocal(item: TarifaIVAFormState): TarifaIVAFormErrors {
    const errs: TarifaIVAFormErrors = {};
    const codigo = item.codigo.trim();
    const descripcion = item.descripcion.trim();
    const strPorcentaje = item.porcentaje.trim();

    if (!codigo) {
      errs.codigo = t("common.required", "El código es obligatorio.");
    } else if (codigo.length > 20) {
      errs.codigo = t("validation.maxLength", { count: 20 });
    }

    if (!strPorcentaje) {
      errs.porcentaje = t("vatRates.percentageRequired", "El porcentaje es obligatorio.");
    } else {
      const porcentaje = Number(strPorcentaje.replace(",", "."));
      if (Number.isNaN(porcentaje)) {
        errs.porcentaje = t("vatRates.percentageRequired", "Ingrese un valor válido.");
      } else if (porcentaje < 0) {
        errs.porcentaje = t("vatRates.percentageMin", "El porcentaje no puede ser negativo.");
      } else if (porcentaje > 100) {
        errs.porcentaje = t("vatRates.percentageMax", "El porcentaje no puede ser mayor a 100.");
      }
    }

    if (!descripcion) {
      errs.descripcion = t("vatRates.descriptionRequired", "La descripción es obligatoria.");
    } else if (descripcion.length > 45) {
      errs.descripcion = t("validation.maxLength", { count: 45 });
    }

    if (!item.estado) {
      errs.estado = t("common.required", "El estado es obligatorio.");
    }

    return errs;
  }

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
        (item.codigo.trim().toUpperCase() === "IVA13" || item.porcentaje === 13) &&
        item.estado === "ACTIVA",
    );

    return tarifaEncontrada ? `${tarifaEncontrada.porcentaje}%` : "—";
  }, [tarifas]);

  const tarifaMasAlta = useMemo(() => {
    const porcentajesActivos = tarifas
      .filter((item) => item.estado === "ACTIVA")
      .map((item) => Number(item.porcentaje))
      .filter((porcentaje) => Number.isFinite(porcentaje));

    if (porcentajesActivos.length === 0) {
      return "—";
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
        title: t("common.errorOccurred"),
        message:
          error instanceof Error
            ? error.message
            : t("errors.generic"),
      });
    } finally {
      setIsLoading(false);
    }
  }

  function abrirModalCrear() {
    setModalMode("create");
    setTarifa({
      id: 0,
      codigo: "",
      porcentaje: "",
      descripcion: "",
      estado: "ACTIVA",
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function abrirModalEditar(tarifaSeleccionada: TarifaIVA) {
    setModalMode("edit");
    setTarifa({
      id: tarifaSeleccionada.id,
      codigo: tarifaSeleccionada.codigo,
      porcentaje: String(tarifaSeleccionada.porcentaje),
      descripcion: tarifaSeleccionada.descripcion,
      estado: tarifaSeleccionada.estado,
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function cerrarModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setTarifa(formStateInicial);
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
        field === "estado"
          ? (value as EstadoTarifaIVA)
          : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  async function guardarTarifa() {
    const validationErrors = validarTarifaLocal(tarifa);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const tarifaLimpia: TarifaIVA = {
      ...tarifa,
      codigo: tarifa.codigo.trim().toUpperCase(),
      porcentaje: Number(String(tarifa.porcentaje).replace(",", ".")),
      descripcion: tarifa.descripcion.trim(),
    };

    setIsSaving(true);
    try {
      if (modalMode === "create") {
        const nuevaTarifa = await crearTarifaIva(tarifaLimpia);
        setTarifas((prev) => [nuevaTarifa, ...prev]);
        setAlert({
          variant: "success",
          title: t("common.success"),
          message: t("vatRates.createSuccess"),
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
          title: t("common.success"),
          message: t("vatRates.updateSuccess"),
        });
      }

      setIsModalOpen(false);
      setTarifa(formStateInicial);
      setErrors({});
      setModalMode("create");
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
        title: t("common.success"),
        message: t("vatRates.deleteSuccess"),
      });
      setTarifaAEliminar(null);
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
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("vatRates.title", "Tarifas")}
        description={t("vatRates.subtitle", "Administre las tarifas de impuestos aplicables.")}
        icon={AiOutlinePercentage}
        iconTo="/"
        iconAriaLabel={t("common.goHome")}
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
          label={t("vatRates.title", "Tarifas")}
          value={String(tarifas.length)}
          hint={t("common.total", "Total registradas")}
          icon={AiOutlinePercentage}
          variant="info"
        />

        <StatCard
          label={t("common.active", "Activa general")}
          value={tarifaGeneral}
          hint={t("common.active", "Tarifa activa")}
          icon={AiOutlinePercentage}
          variant="success"
        />

        <StatCard
          label={t("vatRates.percentage", "Mayor porcentaje")}
          value={tarifaMasAlta}
          hint={t("vatRates.title", "Tarifas")}
          icon={AiOutlinePercentage}
          variant="danger"
        />
      </div>

      <SectionCard
        title={t("vatRates.title", "Tarifas")}
        description={t("vatRates.subtitle", "Administre las tarifas de impuestos aplicables.")}
      >
        <div className="mb-4 max-w-md">
          <InputField
            label={t("common.search", "Buscar")}
            value={busqueda}
            onChange={setBusqueda}
            placeholder={t("common.searchPlaceholder", "Buscar...")}
          />
        </div>

        {isLoading ? (
          <LoadingState message={t("common.loading", "Cargando...")} />
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
            ? t("vatRates.newRate", "Nueva tarifa")
            : t("vatRates.editRate", "Editar tarifa")
        }
        description={t("vatRates.subtitle", "Administre las tarifas de impuestos aplicables.")}
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
              ? t("vatRates.newRate", "Nueva tarifa")
              : t("common.saveChanges", "Guardar cambios")
          }
          onChange={actualizarTarifa}
          onSubmit={guardarTarifa}
          onCancel={cerrarModal}
        />
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(tarifaAEliminar)}
        title={t("vatRates.deleteConfirmTitle", "Eliminar tarifa")}
        message={
          tarifaAEliminar
            ? t("vatRates.deleteConfirmMessage", {
                code: tarifaAEliminar.codigo,
                defaultValue: `¿Desea eliminar la tarifa ${tarifaAEliminar.codigo}?`,
              })
            : ""
        }
        confirmLabel={t("common.delete", "Eliminar")}
        cancelLabel={t("common.cancel", "Cancelar")}
        variant="warning"
        isLoading={isDeleting}
        onConfirm={confirmarEliminarTarifa}
        onCancel={() => setTarifaAEliminar(null)}
      />
    </div>
  );
}

export default TarifasIVAPage;