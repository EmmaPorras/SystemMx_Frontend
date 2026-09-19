import { useEffect, useMemo, useState } from "react";
import { ImAddressBook } from "react-icons/im";
import { RiResetLeftFill } from "react-icons/ri";
import {
  BsPersonFill,
  BsPersonFillCheck,
  BsPersonFillSlash,
} from "react-icons/bs";

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
  monedasPermitidas,
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

const estadosPermitidos: EstadoProveedor[] = [
  "ACTIVO",
  "INACTIVO",
];

type ModalMode = "create" | "edit";

type AlertState = {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

function validarProveedor(
  proveedor: Proveedor,
): ProveedorFormErrors {
  const errors: ProveedorFormErrors = {};

  const nombre = proveedor.nombre.trim();
  const telefono = proveedor.telefono.trim();
  const correo = proveedor.correo.trim();
  const pais = proveedor.pais.trim();
  const direccion = proveedor.direccion.trim();

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const telefonoValido = /^[0-9+\s()-]+$/;
  const soloDigitosTelefono = telefono.replace(/\D/g, "");

  if (!nombre) {
    errors.nombre =
      "El nombre del proveedor es obligatorio.";
  } else if (nombre.length > 40) {
    errors.nombre =
      "El nombre no puede superar los 40 caracteres.";
  }

  if (!telefono) {
    errors.telefono = "El teléfono es obligatorio.";
  } else if (telefono.length > 20) {
    errors.telefono =
      "El teléfono no puede superar los 20 caracteres.";
  } else if (!telefonoValido.test(telefono)) {
    errors.telefono =
      "El teléfono solo puede incluir números, +, espacios, guiones o paréntesis.";
  } else if (soloDigitosTelefono.length < 8) {
    errors.telefono =
      "El teléfono debe tener al menos 8 dígitos.";
  } else if (soloDigitosTelefono.length > 15) {
    errors.telefono =
      "El teléfono no debe tener más de 15 dígitos.";
  }

  if (!correo) {
    errors.correo =
      "El correo electrónico es obligatorio.";
  } else if (correo.length > 100) {
    errors.correo =
      "El correo no puede superar los 100 caracteres.";
  } else if (!correoValido.test(correo)) {
    errors.correo =
      "Ingresá un correo válido, por ejemplo proveedor@gmail.com.";
  }

  if (!pais) {
    errors.pais =
      "Seleccioná el país de origen del proveedor.";
  } else if (pais.length > 100) {
    errors.pais =
      "El país no puede superar los 100 caracteres.";
  }

  if (direccion.length > 150) {
    errors.direccion =
      "La dirección no puede superar los 150 caracteres.";
  }

  if (!proveedor.estado) {
    errors.estado = "Seleccioná un estado.";
  } else if (
    !estadosPermitidos.includes(proveedor.estado)
  ) {
    errors.estado =
      "El estado seleccionado no es válido.";
  }

  if (!proveedor.monedaPreferida) {
    errors.monedaPreferida =
      "Seleccioná una moneda preferida.";
  } else if (
    !monedasPermitidas.includes(
      proveedor.monedaPreferida,
    )
  ) {
    errors.monedaPreferida =
      "La moneda seleccionada no es válida.";
  }

  return errors;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}

function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroPais, setFiltroPais] = useState("");
  const [filtroMoneda, setFiltroMoneda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoProveedor>("ACTIVO");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [proveedor, setProveedor] = useState<Proveedor>(proveedorInicial);
  const [errors, setErrors] = useState<ProveedorFormErrors>({});
  const [alerta, setAlerta] = useState<AlertState | null>(null);
  const [proveedorDetalle, setProveedorDetalle] = useState<Proveedor | null>(null);
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null);

  const paisesRegistradosOptions = useMemo(() => {
    const paises = new Set(
      proveedores
        .map((item) => item.pais.trim())
        .filter(Boolean),
    );

    return Array.from(paises)
      .sort((a, b) =>
        a.localeCompare(b, "es", {
          sensitivity: "base",
        }),
      )
      .map((pais) => ({
        value: pais,
        label: pais,
      }));
  }, [proveedores]);

  const monedasRegistradasOptions = useMemo(() => {
    const monedasRegistradas = new Set(
      proveedores.map(
        (item) => item.monedaPreferida,
      ),
    );

    return monedaPreferidaOptions.filter((option) =>
      monedasRegistradas.has(option.value),
    );
  }, [proveedores]);

  const proveedoresFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    return proveedores.filter((item) => {
      const coincideNombre = term
        ? item.nombre
            .toLowerCase()
            .includes(term)
        : true;

      const coincidePais = filtroPais
        ? item.pais === filtroPais
        : true;

      const coincideMoneda = filtroMoneda
        ? item.monedaPreferida === filtroMoneda
        : true;

      const coincideEstado =
        item.estado === filtroEstado;

      return (
        coincideNombre &&
        coincidePais &&
        coincideMoneda &&
        coincideEstado
      );
    });
  }, [
    busqueda,
    filtroEstado,
    filtroMoneda,
    filtroPais,
    proveedores,
  ]);

  const hayFiltrosPersonalizados =
    Boolean(busqueda.trim()) ||
    Boolean(filtroPais) ||
    Boolean(filtroMoneda) ||
    filtroEstado !== "ACTIVO";

  const totalActivos = useMemo(
    () =>
      proveedores.filter(
        (item) => item.estado === "ACTIVO",
      ).length,
    [proveedores],
  );

  const totalInactivos = useMemo(
    () =>
      proveedores.filter(
        (item) => item.estado === "INACTIVO",
      ).length,
    [proveedores],
  );

  const esEdicion = modalMode === "edit";

  async function cargarProveedores() {
    setIsLoading(true);
    try {
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (error) {
      setAlerta({
        variant: "error",
        title: "Error al cargar proveedores",
        message: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void cargarProveedores();
  }, []);

  function mostrarAlerta(alertaNueva: AlertState) {
    setAlerta(alertaNueva);
    window.setTimeout(() => {
      setAlerta(null);
    }, 3500);
  }

  function restablecerFiltros() {
    setBusqueda("");
    setFiltroPais("");
    setFiltroMoneda("");
    setFiltroEstado("ACTIVO");
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
    const validationErrors = validarProveedor(proveedor);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      mostrarAlerta({
        variant: "error",
        title: "Formulario incompleto",
        message:
          "Revisá los campos marcados antes de guardar el proveedor.",
      });
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

        mostrarAlerta({
          variant: "success",
          title: "Proveedor actualizado",
          message:
            "Los cambios del proveedor se guardaron correctamente.",
        });
      } else {
        const proveedorCreado = await crearProveedor(proveedorLimpio);

        setProveedores((prev) => [
          proveedorCreado,
          ...prev,
        ]);

        mostrarAlerta({
          variant: "success",
          title: "Proveedor guardado",
          message:
            "El proveedor se agregó correctamente al listado.",
        });
      }

      setModalProveedorAbierto(false);
      setProveedor(proveedorInicial);
      setErrors({});
      setModalMode("create");
    } catch (error) {
      mostrarAlerta({
        variant: "error",
        title: "No se pudo guardar",
        message: getErrorMessage(error),
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

      mostrarAlerta({
        variant: "success",
        title: "Proveedor desactivado",
        message: `El proveedor "${proveedorAEliminar.nombre}" quedó inactivo correctamente.`,
      });

      setProveedorAEliminar(null);
    } catch (error) {
      mostrarAlerta({
        variant: "error",
        title: "No se pudo desactivar",
        message: getErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proveedores"
        description="Catálogo base de proveedores."
        icon={ImAddressBook}
        iconTo="/"
        iconAriaLabel="Volver al inicio"
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
          label="Total de proveedores"
          value={String(proveedores.length)}
          hint="Cantidad total de proveedores registrados"
          icon={BsPersonFill}
          variant="info"
        />

        <StatCard
          label="Proveedores activos"
          value={String(totalActivos)}
          hint="Disponibles para registrar pedidos"
          icon={BsPersonFillCheck}
          variant="success"
        />

        <StatCard
          label="Proveedores inactivos"
          value={String(totalInactivos)}
          hint="No disponibles para nuevos pedidos"
          icon={BsPersonFillSlash}
          variant="danger"
        />
      </div>

      <SectionCard
        title="Listado de proveedores"
        description="Consultá el país directamente en la tabla y abrí el detalle para ver la dirección exacta."
      >
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <InputField
            label="Filtrar por nombre"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Nombre del proveedor"
            maxLength={100}
          />

          <SelectField
            label="País"
            value={filtroPais}
            onChange={setFiltroPais}
            placeholder="Todos los países"
            options={paisesRegistradosOptions}
          />

          <SelectField
            label="Moneda"
            value={filtroMoneda}
            onChange={setFiltroMoneda}
            placeholder="Todas las monedas"
            options={monedasRegistradasOptions}
          />

          <SelectField
            label="Estado"
            value={filtroEstado}
            onChange={(value) =>
              setFiltroEstado(value as EstadoProveedor)
            }
            options={[
              {
                value: "ACTIVO",
                label: "Activos",
              },
              {
                value: "INACTIVO",
                label: "Inactivos",
              },
            ]}
          />

          <div className="flex items-end">
            <button
              type="button"
              onClick={restablecerFiltros}
              disabled={!hayFiltrosPersonalizados}
              aria-label="Restablecer filtros"
              title="Restablecer filtros"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
            >
              <RiResetLeftFill className="h-5 w-5" aria-hidden="true" />
              <span>Limpiar filtros</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Cargando proveedores..." />
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
        title={esEdicion ? "Editar proveedor" : "Nuevo proveedor"}
        description={
          esEdicion
            ? "Modifica los datos del proveedor seleccionado."
            : "Los campos marcados con * son obligatorios."
        }
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
              ? "Actualizar proveedor"
              : "Guardar proveedor"
          }
          onChange={actualizarProveedor}
          onSubmit={guardarProveedor}
          onCancel={cerrarModalProveedor}
        />
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(proveedorAEliminar)}
        title="Desactivar proveedor"
        message={
          proveedorAEliminar
            ? `¿Seguro que querés desactivar el proveedor "${proveedorAEliminar.nombre}"? Ya no estará disponible para nuevos pedidos, pero conservará su historial.`
            : ""
        }
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        variant="warning"
        isLoading={isDeleting}
        onConfirm={eliminarProveedor}
        onCancel={cerrarConfirmacionEliminar}
      />
    </div>
  );
}

export default ProveedoresPage;