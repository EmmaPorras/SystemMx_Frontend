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
} from "./tarifas-iva.types";

type ModalMode = "create" | "edit";

const tarifaInicial: TarifaIVA = {
  id: 0,
  codigo: "",
  porcentaje: 0,
  descripcion: "",
  estado: "ACTIVA",
};

function TarifasIVAPage() {
  const { t } = useTranslation();
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

  function validarTarifaLocal(item: TarifaIVA): TarifaIVAFormErrors {
    const errs: TarifaIVAFormErrors = {};
    const codigo = item.codigo.trim();
    const descripcion = item.descripcion.trim();
    const porcentaje = Number(item.porcentaje);

    if (!codigo) {
      errs.codigo = t("common.required");
    } else if (codigo.length > 20) {
      errs.codigo = t("validation.maxLength", { count: 20 });
    }

    if (item.porcentaje === null || item.porcentaje === undefined) {
      errs.porcentaje = t("vatRates.percentageRequired");
    } else if (Number.isNaN(porcentaje)) {
      errs.porcentaje = t("common.required");
    } else if (porcentaje < 0) {
      errs.porcentaje = t("vatRates.percentageMin");
    } else if (porcentaje > 100) {
      errs.porcentaje = t("vatRates.percentageMax");
    }

    if (!descripcion) {
      errs.descripcion = t("vatRates.descriptionRequired");
    } else if (descripcion.length > 45) {
      errs.descripcion = t("validation.maxLength", { count: 45 });
    }

    if (!item.estado) {
      errs.estado = t("common.required");
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
        item.codigo.trim().toUpperCase() === "IVA" &&
        item.estado === "ACTIVA",
    );

    return tarifaEncontrada
      ? `${tarifaEncontrada.porcentaje}%`
      : "—";
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
    const validationErrors = validarTarifaLocal(tarifa);

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
      setTarifa(tarifaInicial);
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
        title={t("vatRates.title")}
        description={t("vatRates.subtitle")}
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
          label={t("vatRates.title")}
          value={String(tarifas.length)}
          hint={t("common.total")}
          icon={AiOutlinePercentage}
          variant="info"
        />

        <StatCard
          label={t("common.active")}
          value={tarifaGeneral}
          hint={t("common.active")}
          icon={AiOutlinePercentage}
          variant="success"
        />

        <StatCard
          label={t("vatRates.percentage")}
          value={tarifaMasAlta}
          hint={t("vatRates.title")}
          icon={AiOutlinePercentage}
          variant="danger"
        />
      </div>

      <SectionCard
        title={t("vatRates.title")}
        description={t("vatRates.subtitle")}
      >
        <div className="mb-4">
          <InputField
            label={t("common.search")}
            value={busqueda}
            onChange={setBusqueda}
            placeholder={t("common.searchPlaceholder")}
          />
        </div>

        {isLoading ? (
          <LoadingState message={t("common.loading")} />
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
            ? t("vatRates.newRate")
            : t("vatRates.editRate")
        }
        description={t("vatRates.subtitle")}
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
              ? t("vatRates.newRate")
              : t("common.saveChanges")
          }
          onChange={actualizarTarifa}
          onSubmit={guardarTarifa}
          onCancel={cerrarModal}
        />
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(tarifaAEliminar)}
        title={t("vatRates.deleteConfirmTitle")}
        message={
          tarifaAEliminar
            ? t("vatRates.deleteConfirmMessage", { code: tarifaAEliminar.codigo })
            : ""
        }
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        variant="warning"
        isLoading={isDeleting}
        onConfirm={confirmarEliminarTarifa}
        onCancel={() => setTarifaAEliminar(null)}
      />
    </div>
  );
}

export default TarifasIVAPage;