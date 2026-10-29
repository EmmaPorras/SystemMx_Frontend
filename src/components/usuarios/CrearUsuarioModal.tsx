import { useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SelectField from "../common/SelectField";
import { ApiError } from "../../api/ApiError";
import { invitarUsuarioApi, type UsuarioItem } from "../../services/usuariosApi";
import type { BackendRole } from "../../auth/auth.types";
import { getUserRoleLabel } from "../../i18n/statusMap";

type CrearUsuarioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: UsuarioItem) => void;
};

function CrearUsuarioModal({
  isOpen,
  onClose,
  onUserCreated,
}: CrearUsuarioModalProps) {
  const { t, i18n } = useTranslation();

  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<BackendRole>("VENTAS");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setNombre("");
    setUsername("");
    setEmail("");
    setRol("VENTAS");
    setErrors({});
    setApiError(null);
  }

  function handleClose() {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      nextErrors.nombre = t("common.required");
    } else if (nombre.trim().length < 2) {
      nextErrors.nombre = t("usuarios.nameMinLength", { defaultValue: "Mínimo 2 caracteres." });
    }

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      nextErrors.username = t("common.required");
    } else if (trimmedUser.length < 3 || trimmedUser.length > 50) {
      nextErrors.username = t("usuarios.usernameLength", { defaultValue: "Entre 3 y 50 caracteres." });
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUser)) {
      nextErrors.username = t("usuarios.usernameInvalidChars", {
        defaultValue: "Solo letras, números, puntos y guiones.",
      });
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      nextErrors.email = t("common.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = t("auth.emailInvalid");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;
    if (!validate()) return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      const currentLang = (i18n.language?.slice(0, 2) as "es" | "en" | "pt") || "es";
      const res = await invitarUsuarioApi({
        nombre: nombre.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        rol,
        lang: ["es", "en", "pt"].includes(currentLang) ? currentLang : "es",
      });

      onUserCreated(res.usuario);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError(t("auth.serverConnectionError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("usuarios.inviteModalTitle")}
      description={t("usuarios.inviteModalSubtitle")}
      maxWidthClassName="max-w-md"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {apiError ? (
          <AlertMessage
            variant="error"
            title={t("common.errorOccurred")}
            message={apiError}
            onClose={() => setApiError(null)}
          />
        ) : null}

        <div className="flex items-center gap-3 rounded-xl bg-blue-50/70 border border-blue-200/60 p-3 text-xs text-blue-900">
          <Mail className="h-5 w-5 text-blue-600 shrink-0" />
          <p>
            {t(
              "usuarios.inviteNotice",
              "El usuario recibirá una invitación en su correo electrónico oficial para crear su propia contraseña.",
            )}
          </p>
        </div>

        <InputField
          label={t("usuarios.nameField")}
          value={nombre}
          onChange={(val) => {
            setNombre(val);
            if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: "" }));
          }}
          placeholder={t("usuarios.namePlaceholder")}
          required
          maxLength={100}
          error={errors.nombre}
        />

        <InputField
          label={t("usuarios.usernameField")}
          value={username}
          onChange={(val) => {
            setUsername(val);
            if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
          }}
          placeholder={t("usuarios.usernamePlaceholder")}
          required
          maxLength={50}
          error={errors.username}
        />

        <InputField
          label={t("usuarios.emailField")}
          value={email}
          onChange={(val) => {
            setEmail(val);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          type="email"
          placeholder={t("usuarios.emailPlaceholder")}
          required
          maxLength={100}
          error={errors.email}
        />

        <SelectField
          label={t("usuarios.roleField")}
          value={rol}
          onChange={(val) => setRol(val as BackendRole)}
          options={[
            { value: "VENTAS", label: `${getUserRoleLabel(t, "VENTAS")} (VENTAS)` },
            { value: "COMPRAS", label: `${getUserRoleLabel(t, "COMPRAS")} (COMPRAS)` },
            { value: "ADMIN", label: `${getUserRoleLabel(t, "ADMIN")} (ADMIN)` },
            { value: "CONSULTA", label: `${getUserRoleLabel(t, "CONSULTA")} (CONSULTA)` },
            { value: "DEMO", label: `${getUserRoleLabel(t, "DEMO")} (DEMO)` },
          ]}
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
          >
            {t("common.cancel")}
          </button>

          <PrimaryButton
            type="submit"
            loading={isSubmitting}
            loadingText={t("usuarios.sendingInvitation")}
          >
            <Send size={16} aria-hidden="true" />
            <span>{t("usuarios.sendInvitation")}</span>
          </PrimaryButton>
        </div>
      </form>
    </AppModal>
  );
}

export default CrearUsuarioModal;
