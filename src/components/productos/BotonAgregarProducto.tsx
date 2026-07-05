import PrimaryButton from "../common/PrimaryButton";

type BotonAgregarProductoProps = {
  onClick: () => void;
};

function BotonAgregarProducto({ onClick }: BotonAgregarProductoProps) {
  return <PrimaryButton onClick={onClick}>+ Nuevo producto</PrimaryButton>;
}

export default BotonAgregarProducto;
