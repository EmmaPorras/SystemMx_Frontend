import type { ReactNode } from "react";
import { ImAddressBook } from "react-icons/im";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import { TbCurrencyDollar } from "react-icons/tb";
import { useTranslation } from "react-i18next";

import AppModal from "../common/AppModal";
import StatusBadge from "../common/StatusBadge";
import { getCatalogStatusLabel } from "../../i18n/statusMap";
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
  const { t } = useTranslation();

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={proveedor ? proveedor.nombre : t("suppliers.details")}
      description={t("suppliers.subtitle")}
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
                  {t("suppliers.title")} #{proveedor.id}
                </p>
                <h3 className="mt-1 text-xl font-bold text-zinc-950">
                  {proveedor.nombre}
                </h3>
              </div>
            </div>

            <StatusBadge
              label={getCatalogStatusLabel(t, proveedor.estado)}
              variant={proveedor.estado === "ACTIVO" ? "success" : "warning"}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetalleItem
              label={t("suppliers.phone")}
              value={proveedor.telefono || "—"}
              icon={<MdPhone size={20} />}
            />

            <DetalleItem
              label={t("suppliers.email")}
              value={proveedor.correo || "—"}
              icon={<MdEmail size={20} />}
            />

            <DetalleItem
              label={t("suppliers.country")}
              value={proveedor.pais || "—"}
              icon={<MdLocationOn size={20} />}
            />

            <DetalleItem
              label={t("suppliers.currency")}
              value={getMonedaPreferidaLabel(proveedor.monedaPreferida)}
              icon={<TbCurrencyDollar size={20} />}
            />

            <DetalleItem
              label={t("suppliers.address")}
              value={proveedor.direccion || "—"}
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
