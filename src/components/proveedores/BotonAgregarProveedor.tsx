import { useTranslation } from "react-i18next";
import PrimaryButton from "../common/PrimaryButton";

type BotonAgregarProveedorProps = {
  onClick: () => void;
};

function BotonAgregarProveedor({ onClick }: BotonAgregarProveedorProps) {
  const { t } = useTranslation();
  return <PrimaryButton onClick={onClick}>+ {t("suppliers.newSupplier")}</PrimaryButton>;
}

export default BotonAgregarProveedor;
