import { Navigate, Route, Routes } from "react-router";
import AppLayout from "./components/common/AppLayout";
import HomePage from "./components/home/HomePage";
import ProveedoresPage from "./components/proveedores/ProveedoresPage";
import TarifasIVAPage from "./components/tarifas-iva/TarifasIVAPage";
import ProductosPage from "./components/productos/ProductosPage";
import PedidosPage from "./components/pedidos/PedidosPage";
import LotesPage from "./components/lotes/LotesPage";
import VentasPage from "./components/ventas/VentasPage";
import ReportesPage from "./components/reportes/ReportesPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/proveedores" element={<ProveedoresPage />} />
        <Route path="/tarifas-iva" element={<TarifasIVAPage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/lotes" element={<LotesPage />} />
        <Route path="/ventas" element={<VentasPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
