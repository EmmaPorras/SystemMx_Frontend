import PrimaryButton from "../common/PrimaryButton";

type BotonAgregarProveedorProps = {
  onClick: () => void;
};

function BotonAgregarProveedor({ onClick }: BotonAgregarProveedorProps) {
  return <PrimaryButton onClick={onClick}>+ Nuevo proveedor</PrimaryButton>;
}

export default BotonAgregarProveedor;
