import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Send,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import PageHeader from "../common/PageHeader";
import StatCard from "../common/StatCard";
import DataTableShell, { type DataTableColumn } from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import AlertMessage from "../common/AlertMessage";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingState from "../common/LoadingState";
import CrearUsuarioModal from "./CrearUsuarioModal";

import { useAuth } from "../../auth/useAuth";
import type { BackendRole } from "../../auth/auth.types";
import {
  listarUsuariosApi,
  cambiarEstadoUsuarioApi,
  cambiarRolUsuarioApi,
  reenviarInvitacionApi,
  type UsuarioItem,
} from "../../services/usuariosApi";
import { ApiError } from "../../api/ApiError";
import { getUserRoleLabel } from "../../i18n/statusMap";

function UsuariosPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.rol === "ADMIN";

  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Modales y confirmaciones
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [targetToggleUser, setTargetToggleUser] = useState<UsuarioItem | null>(
    null,
  );
  const [isTogglingState, setIsTogglingState] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);

  const fetchUsuarios = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await listarUsuariosApi();
      setUsuarios(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setFeedback({ type: "error", message: err.message });
      } else {
        setFeedback({
          type: "error",
          message: t("auth.serverConnectionError"),
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, t]);

  useEffect(() => {
    void fetchUsuarios();
  }, [fetchUsuarios]);

  // Handlers
  async function handleConfirmToggleState() {
    if (!targetToggleUser) return;
    setIsTogglingState(true);
    try {
      const nuevoEstado = !targetToggleUser.activo;
      const res = await cambiarEstadoUsuarioApi(
        targetToggleUser.idUsuario,
        nuevoEstado,
      );

      setUsuarios((prev) =>
        prev.map((u) => (u.idUsuario === res.idUsuario ? res : u)),
      );

      setFeedback({
        type: "success",
        message: t("usuarios.statusUpdated"),
      });
      setTargetToggleUser(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setFeedback({ type: "error", message: err.message });
      } else {
        setFeedback({
          type: "error",
          message: t("auth.serverConnectionError"),
        });
      }
    } finally {
      setIsTogglingState(false);
    }
  }

  async function handleChangeRole(usuario: UsuarioItem, nuevoRol: BackendRole) {
    if (usuario.rol === nuevoRol) return;
    try {
      const res = await cambiarRolUsuarioApi(usuario.idUsuario, nuevoRol);
      setUsuarios((prev) =>
        prev.map((u) => (u.idUsuario === res.idUsuario ? res : u)),
      );
      setFeedback({
        type: "success",
        message: t("usuarios.roleUpdated"),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setFeedback({ type: "error", message: err.message });
      } else {
        setFeedback({
          type: "error",
          message: t("auth.serverConnectionError"),
        });
      }
    }
  }

  async function handleResendInvitation(usuario: UsuarioItem) {
    setResendingId(usuario.idUsuario);
    try {
      await reenviarInvitacionApi(usuario.idUsuario);
      setFeedback({
        type: "success",
        message: t("usuarios.resendSuccess"),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setFeedback({ type: "error", message: err.message });
      } else {
        setFeedback({
          type: "error",
          message: t("auth.serverConnectionError"),
        });
      }
    } finally {
      setResendingId(null);
    }
  }

  // Filtrado
  const filteredUsers = useMemo(() => {
    return usuarios.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (u.email ? u.email.toLowerCase().includes(search.toLowerCase()) : false);

      const matchRole = filterRole === "ALL" || u.rol === filterRole;

      let matchStatus = true;
      if (filterStatus === "ACTIVE") {
        matchStatus = u.activo && u.estadoActivacion !== "PENDIENTE_ACTIVACION";
      } else if (filterStatus === "PENDING") {
        matchStatus = u.estadoActivacion === "PENDIENTE_ACTIVACION";
      } else if (filterStatus === "INACTIVE") {
        matchStatus = !u.activo;
      }

      return matchSearch && matchRole && matchStatus;
    });
  }, [usuarios, search, filterRole, filterStatus]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = usuarios.length;
    const activos = usuarios.filter(
      (u) => u.activo && u.estadoActivacion !== "PENDIENTE_ACTIVACION",
    ).length;
    const pendientes = usuarios.filter(
      (u) => u.estadoActivacion === "PENDIENTE_ACTIVACION",
    ).length;
    return { total, activos, pendientes };
  }, [usuarios]);

  // Columnas para DataTable
  const columns: DataTableColumn<UsuarioItem>[] = useMemo(() => {
    return [
      {
        key: "username",
        header: t("usuarios.tableUsername"),
        render: (usuario: UsuarioItem) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-950 text-xs sm:text-sm">
              {usuario.username}
            </span>
            {currentUser?.idUsuario === usuario.idUsuario ? (
              <span className="rounded-md border border-blue-200/80 bg-blue-50/80 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 shadow-2xs">
                {t("common.you", "Tú")}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: "nombre",
        header: t("usuarios.tableName"),
        render: (usuario: UsuarioItem) => (
          <span className="text-zinc-700 text-xs sm:text-sm">{usuario.nombre}</span>
        ),
      },
      {
        key: "email",
        header: t("usuarios.tableEmail"),
        render: (usuario: UsuarioItem) =>
          usuario.email ? (
            <span className="text-zinc-600 text-xs">{usuario.email}</span>
          ) : (
            <span className="text-zinc-400 italic text-xs">
              {t("usuarios.noEmail", "Sin correo")}
            </span>
          ),
      },
      {
        key: "rol",
        header: t("usuarios.tableRole"),
        render: (usuario: UsuarioItem) => {
          const isSelf = currentUser?.idUsuario === usuario.idUsuario;
          if (isSelf) {
            return (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/70 bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                <Shield size={13} className="text-blue-600" />
                {getUserRoleLabel(t, usuario.rol)}
              </span>
            );
          }
          return (
            <select
              value={usuario.rol}
              aria-label={t("usuarios.tableRole")}
              onChange={(e) => handleChangeRole(usuario, e.target.value as BackendRole)}
              className="h-7.5 rounded-lg border border-zinc-200 bg-white/90 px-2 py-0.5 text-xs font-medium text-zinc-700 shadow-2xs hover:border-zinc-300 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950/10"
            >
              <option value="VENTAS">{getUserRoleLabel(t, "VENTAS")}</option>
              <option value="COMPRAS">{getUserRoleLabel(t, "COMPRAS")}</option>
              <option value="ADMIN">{getUserRoleLabel(t, "ADMIN")}</option>
              <option value="CONSULTA">{getUserRoleLabel(t, "CONSULTA")}</option>
              <option value="DEMO">{getUserRoleLabel(t, "DEMO")}</option>
            </select>
          );
        },
      },
      {
        key: "estado",
        header: t("usuarios.tableStatus"),
        render: (usuario: UsuarioItem) => {
          if (usuario.estadoActivacion === "PENDIENTE_ACTIVACION") {
            return (
              <StatusBadge
                label={t("usuarios.statusPending")}
                variant="warning"
              />
            );
          }
          if (usuario.activo) {
            return (
              <StatusBadge
                label={t("usuarios.statusActive")}
                variant="success"
              />
            );
          }
          return (
            <StatusBadge
                label={t("usuarios.statusInactive")}
                variant="danger"
              />
          );
        },
      },
      {
        key: "acciones",
        header: t("usuarios.tableActions"),
        headerClassName: "text-right",
        className: "text-right",
        render: (usuario: UsuarioItem) => {
          const isSelf = currentUser?.idUsuario === usuario.idUsuario;
          const isPending = usuario.estadoActivacion === "PENDIENTE_ACTIVACION";

          return (
            <div className="flex items-center justify-end gap-1.5">
              {isPending ? (
                <button
                  type="button"
                  onClick={() => handleResendInvitation(usuario)}
                  disabled={resendingId === usuario.idUsuario}
                  title={t("usuarios.resendInvite")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200/90 bg-amber-50/90 px-2.5 py-1 text-[11px] font-semibold text-amber-800 shadow-2xs hover:bg-amber-100 transition duration-150 disabled:opacity-50"
                >
                  <Send size={12} />
                  <span>
                    {resendingId === usuario.idUsuario
                      ? t("common.processing")
                      : t("usuarios.resendInvite")}
                  </span>
                </button>
              ) : null}

              {!isSelf ? (
                <button
                  type="button"
                  onClick={() => setTargetToggleUser(usuario)}
                  title={
                    usuario.activo
                      ? t("usuarios.confirmDeactivate")
                      : t("usuarios.confirmActivate")
                  }
                  className={`inline-flex items-center justify-center rounded-lg p-1.5 text-xs font-medium shadow-2xs transition duration-150 ${
                    usuario.activo
                      ? "border border-rose-200/70 bg-rose-50/70 text-rose-700 hover:bg-rose-100"
                      : "border border-emerald-200/70 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {usuario.activo ? (
                    <UserX size={15} aria-label={t("usuarios.confirmDeactivate")} />
                  ) : (
                    <UserCheck size={15} aria-label={t("usuarios.confirmActivate")} />
                  )}
                </button>
              ) : null}
            </div>
          );
        },
      },
    ];
  }, [t, currentUser, resendingId]);

  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={t("usuarios.title")}
          description={t("usuarios.subtitle")}
        />
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-5 text-amber-900 flex items-center gap-3.5 shadow-2xs">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
          <p className="font-semibold text-xs sm:text-sm">
            {t("usuarios.onlyAdminWarning")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("usuarios.title")}
        description={t("usuarios.subtitle")}
        action={
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-zinc-950 px-3.5 text-xs font-semibold text-white shadow-2xs transition duration-150 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
          >
            <UserPlus size={16} aria-hidden="true" />
            <span>{t("usuarios.inviteUser")}</span>
          </button>
        }
      />

      {feedback ? (
        <AlertMessage
          variant={feedback.type}
          title={feedback.type === "success" ? t("common.success") : t("common.errorOccurred")}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      ) : null}

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <StatCard
          label={t("common.all")}
          value={String(stats.total)}
          icon={Users}
          variant="info"
        />
        <StatCard
          label={t("usuarios.statusActive")}
          value={String(stats.activos)}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          label={t("usuarios.statusPending")}
          value={String(stats.pendientes)}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("usuarios.searchPlaceholder")}
            className="h-[38px] w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition hover:bg-white focus:bg-white focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterRole}
            aria-label={t("usuarios.tableRole")}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-[38px] rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 text-xs sm:text-sm font-medium text-zinc-700 transition hover:bg-white hover:border-zinc-300 focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10"
          >
            <option value="ALL">{t("usuarios.filterAllRoles")}</option>
            <option value="VENTAS">{getUserRoleLabel(t, "VENTAS")}</option>
            <option value="COMPRAS">{getUserRoleLabel(t, "COMPRAS")}</option>
            <option value="ADMIN">{getUserRoleLabel(t, "ADMIN")}</option>
            <option value="CONSULTA">{getUserRoleLabel(t, "CONSULTA")}</option>
              <option value="DEMO">{getUserRoleLabel(t, "DEMO")}</option>
          </select>

          <select
            value={filterStatus}
            aria-label={t("usuarios.tableStatus")}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-[38px] rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 text-xs sm:text-sm font-medium text-zinc-700 transition hover:bg-white hover:border-zinc-300 focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10"
          >
            <option value="ALL">{t("usuarios.filterAllStatuses")}</option>
            <option value="ACTIVE">{t("usuarios.statusActive")}</option>
            <option value="PENDING">{t("usuarios.statusPending")}</option>
            <option value="INACTIVE">{t("usuarios.statusInactive")}</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {isLoading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 shadow-2xs">
          <LoadingState message={t("common.loadingInfo")} />
        </div>
      ) : (
        <DataTableShell
          data={filteredUsers}
          columns={columns}
          getRowKey={(row) => row.idUsuario}
          emptyMessage={t("usuarios.noUsersFound")}
          emptyDescription={t("common.emptyStateHint")}
          tableName={t("usuarios.title")}
        />
      )}

      {/* Modal Crear Usuario */}
      <CrearUsuarioModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onUserCreated={(newUser) => {
          setUsuarios((prev) => [newUser, ...prev]);
          setFeedback({
            type: "success",
            message: t("usuarios.inviteSuccess"),
          });
        }}
      />

      {/* Diálogo de Confirmación para Activar/Desactivar */}
      {targetToggleUser ? (
        <ConfirmDialog
          isOpen={true}
          onCancel={() => setTargetToggleUser(null)}
          onConfirm={handleConfirmToggleState}
          title={
            targetToggleUser.activo
              ? t("usuarios.confirmDeactivate")
              : t("usuarios.confirmActivate")
          }
          message={
            targetToggleUser.activo
              ? t("usuarios.confirmDeactivateDesc")
              : t("usuarios.confirmActivateDesc")
          }
          confirmLabel={t("common.confirm")}
          cancelLabel={t("common.cancel")}
          variant={targetToggleUser.activo ? "danger" : "warning"}
          isLoading={isTogglingState}
        />
      ) : null}
    </div>
  );
}

export default UsuariosPage;
