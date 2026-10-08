import { useTranslation } from "react-i18next";
import PrimaryButton from "../common/PrimaryButton";

type BotonAgregarTarifaProps = {
  onClick: () => void;
};

function BotonAgregarTarifa({ onClick }: BotonAgregarTarifaProps) {
  const { t } = useTranslation();
  return <PrimaryButton onClick={onClick}>+ {t("vatRates.newRate")}</PrimaryButton>;
}

export default BotonAgregarTarifa;
