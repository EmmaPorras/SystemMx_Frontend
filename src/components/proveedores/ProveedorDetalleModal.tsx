import type { ReactNode } from "react";
import { ImAddressBook } from "react-icons/im";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import { TbCurrencyDollar } from "react-icons/tb";

import AppModal from "../common/AppModal";
import StatusBadge from "../common/StatusBadge";
import {
  getMonedaPreferidaLabel,
  type Proveedor,
} from "./proveedores.types";

type ProveedorDetalleModalProps = {
  proveedor: Proveedor | null;
  isOpen: boolean;
  onClose: () => void;
};

type DetalleItemProps = {
  label: string;
  value: string;
  icon: ReactNode;
  className?: string;
};

function DetalleItem({ label, value, icon, className = "" }: DetalleItemProps) {
  return (
    <div className={`rounded-2xl border border-zinc-200 bg-zinc-50 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-zinc-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProveedorDetalleModal({
  proveedor,
  isOpen,
  onClose,
}: ProveedorDetalleModalProps) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={proveedor ? proveedor.nombre : "Detalle del proveedor"}
      description="Información completa registrada para este proveedor."
      maxWidthClassName="max-w-4xl"
    >
      {proveedor ? (
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-black text-white shadow-lg shadow-black/15">
                <ImAddressBook className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                  Proveedor #{proveedor.id}
                </p>
                <h3 className="mt-1 text-xl font-bold text-zinc-950">
                  {proveedor.nombre}
                </h3>
              </div>
            </div>

            <StatusBadge
              label={proveedor.estado}
              variant={proveedor.estado === "ACTIVO" ? "success" : "warning"}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetalleItem
              label="Teléfono"
              value={proveedor.telefono || "No registrado"}
              icon={<MdPhone size={20} />}
            />

            <DetalleItem
              label="Correo"
              value={proveedor.correo || "No registrado"}
              icon={<MdEmail size={20} />}
            />

            <DetalleItem
              label="País de origen"
              value={proveedor.pais || "No registrado"}
              icon={<MdLocationOn size={20} />}
            />

            <DetalleItem
              label="Moneda preferida"
              value={getMonedaPreferidaLabel(proveedor.monedaPreferida)}
              icon={<TbCurrencyDollar size={21} />}
            />

            <DetalleItem
              label="Dirección exacta"
              value={proveedor.direccion || "No se registró una dirección exacta."}
              icon={<MdLocationOn size={20} />}
              className="md:col-span-2"
            />
          </div>
        </div>
      ) : null}
    </AppModal>
  );
}

export default ProveedorDetalleModal;
