import { useEffect, useMemo, useState } from "react";

import { ImAddressBook } from "react-icons/im";
import {
  BsPersonFill,
  BsPersonFillCheck,
  BsPersonFillSlash,
} from "react-icons/bs";

import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import InputField from "../common/InputField";
import AppModal from "../common/AppModal";
import AlertMessage from "../common/AlertMessage";
import ConfirmDialog from "../common/ConfirmDialog";

import BotonAgregarProveedor from "./BotonAgregarProveedor";
import FormularioProveedor from "./FormularioProveedor";
import TablaProveedores from "./TablaProveedores";

import {
  actualizarProveedorApi,
  crearProveedor,
  eliminarProveedorApi,
  obtenerProveedores,
} from "../../services/proveedoresApi";

import {
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
  direccion: "",
  estado: "ACTIVO",
  monedaPreferida: "CRC",
};

const estadosPermitidos: EstadoProveedor[] = ["ACTIVO", "INACTIVO"];

type ModalMode = "create" | "edit";

type AlertState = {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

function validarProveedor(proveedor: Proveedor): ProveedorFormErrors {
  const errors: ProveedorFormErrors = {};

  const nombre = proveedor.nombre.trim();
  const telefono = proveedor.telefono.trim();
  const correo = proveedor.correo.trim();
  const direccion = proveedor.direccion.trim();

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const telefonoValido = /^[0-9+\s()-]+$/;
  const soloDigitosTelefono = telefono.replace(/\D/g, "");

  if (!nombre) {
    errors.nombre = "El nombre del proveedor es obligatorio.";
  } else if (nombre.length > 40) {
    errors.nombre = "El nombre no puede superar los 40 caracteres.";
  }

  if (!telefono) {
    errors.telefono = "El teléfono es obligatorio.";
  } else if (telefono.length > 20) {
    errors.telefono = "El teléfono no puede superar los 20 caracteres.";
  } else if (!telefonoValido.test(telefono)) {
    errors.telefono =
      "El teléfono solo puede incluir números, +, espacios, guiones o paréntesis.";
  } else if (soloDigitosTelefono.length < 8) {
    errors.telefono = "El teléfono debe tener al menos 8 dígitos.";
  } else if (soloDigitosTelefono.length > 15) {
    errors.telefono = "El teléfono no debe tener más de 15 dígitos.";
  }

  if (!correo) {
    errors.correo = "El correo electrónico es obligatorio.";
  } else if (correo.length > 100) {
    errors.correo = "El correo no puede superar los 100 caracteres.";
  } else if (!correoValido.test(correo)) {
    errors.correo =
      "Ingresá un correo válido, por ejemplo proveedor@gmail.com.";
  }

  if (!proveedor.estado) {
    errors.estado = "Seleccioná un estado.";
  } else if (!estadosPermitidos.includes(proveedor.estado)) {
    errors.estado = "El estado seleccionado no es válido.";
  }

  if (!direccion) {
    errors.direccion = "La dirección es obligatoria.";
  } else if (direccion.length > 150) {
    errors.direccion = "La dirección no puede superar los 150 caracteres.";
  }

  if (!proveedor.monedaPreferida) {
    errors.monedaPreferida = "Seleccioná una moneda preferida.";
  } else if (!monedasPermitidas.includes(proveedor.monedaPreferida)) {
    errors.monedaPreferida = "La moneda seleccionada no es válida.";
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

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  const [proveedor, setProveedor] = useState<Proveedor>(proveedorInicial);
  const [errors, setErrors] = useState<ProveedorFormErrors>({});
  const [alerta, setAlerta] = useState<AlertState | null>(null);

  const [proveedorAEliminar, setProveedorAEliminar] =
    useState<Proveedor | null>(null);

  const proveedoresFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) {
      return proveedores;
    }

    return proveedores.filter((item) =>
      [item.nombre, item.correo, item.telefono, item.direccion]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda, proveedores]);

  const totalActivos = useMemo(
    () => proveedores.filter((item) => item.estado === "ACTIVO").length,
    [proveedores],
  );

  const totalInactivos = useMemo(
    () => proveedores.filter((item) => item.estado === "INACTIVO").length,
    [proveedores],
  );

  const esEdicion = modalMode === "edit";

  useEffect(() => {
    let isMounted = true;

    async function cargarProveedores() {
      setIsLoading(true);

      try {
        const data = await obtenerProveedores();

        if (isMounted) {
          setProveedores(data);
        }
      } catch (error) {
        if (isMounted) {
          setAlerta({
            variant: "error",
            title: "Error al cargar proveedores",
            message: getErrorMessage(error),
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    cargarProveedores();

    return () => {
      isMounted = false;
    };
  }, []);

  function mostrarAlerta(alertaNueva: AlertState) {
    setAlerta(alertaNueva);

    window.setTimeout(() => {
      setAlerta(null);
    }, 3500);
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
    setProveedor({ ...proveedorSeleccionado });
    setErrors({});
    setAlerta(null);
    setModalProveedorAbierto(true);
  }

  function cerrarModalProveedor() {
    if (isSaving) {
      return;
    }

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

        setProveedores((prev) => [proveedorCreado, ...prev]);

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

  function abrirConfirmacionEliminar(
    proveedorSeleccionado: Proveedor,
  ) {
    setProveedorAEliminar(proveedorSeleccionado);
  }

  function cerrarConfirmacionEliminar() {
    setProveedorAEliminar(null);
  }

  async function eliminarProveedor() {
    if (!proveedorAEliminar) {
      return;
    }

    try {
      await eliminarProveedorApi(proveedorAEliminar.id);

      setProveedores((prev) =>
        prev.filter((item) => item.id !== proveedorAEliminar.id),
      );

      mostrarAlerta({
        variant: "success",
        title: "Proveedor eliminado",
        message: `El proveedor "${proveedorAEliminar.nombre}" fue eliminado correctamente.`,
      });

      setProveedorAEliminar(null);
    } catch (error) {
      mostrarAlerta({
        variant: "error",
        title: "No se pudo eliminar",
        message: getErrorMessage(error),
      });
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

      <div className="grid gap-4 md:grid-cols-3">
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
        description="Datos cargados directamente desde el backend."
      >
        <div className="mb-4">
          <InputField
            label="Buscar proveedor"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Nombre, correo, teléfono o dirección"
          />
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-zinc-500">
              Cargando proveedores...
            </p>
          </div>
        ) : (
          <TablaProveedores
            proveedores={proveedoresFiltrados}
            onEdit={abrirModalEditarProveedor}
            onDelete={abrirConfirmacionEliminar}
          />
        )}
      </SectionCard>

      <AppModal
        isOpen={modalProveedorAbierto}
        title={esEdicion ? "Editar proveedor" : "Nuevo proveedor"}
        description={
          esEdicion
            ? "Modifica los datos del proveedor seleccionado."
            : "Los campos marcados con * son obligatorios."
        }
        onClose={cerrarModalProveedor}
      >
        <FormularioProveedor
          proveedor={proveedor}
          errors={errors}
          submitLabel={
            isSaving
              ? "Guardando..."
              : esEdicion
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
        title="Eliminar proveedor"
        message={
          proveedorAEliminar
            ? `¿Seguro que querés eliminar por completo el proveedor "${proveedorAEliminar.nombre}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={eliminarProveedor}
        onCancel={cerrarConfirmacionEliminar}
      />
    </div>
  );
}

export default ProveedoresPage;