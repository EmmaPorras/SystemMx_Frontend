import PrimaryButton from "../common/PrimaryButton";

type BotonAgregarTarifaProps = {
  onClick: () => void;
};

function BotonAgregarTarifa({ onClick }: BotonAgregarTarifaProps) {
  return <PrimaryButton onClick={onClick}>+ Nueva tarifa</PrimaryButton>;
}

export default BotonAgregarTarifa;
