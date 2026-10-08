import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import ProtectedRoute from "./auth/ProtectedRoute";

import AppLayout from "./components/common/AppLayout";
import LoginPage from "./components/auth/LoginPage";
import RecuperarPasswordPage from "./auth/RecuperarPasswordPage";
import RestablecerPasswordPage from "./auth/RestablecerPasswordPage";
import ActivarCuentaPage from "./auth/ActivarCuentaPage";

import HomePage from "./components/home/HomePage";
import ProveedoresPage from "./components/proveedores/ProveedoresPage";
import CategoriasPage from "./components/categorias/CategoriasPage";
import TarifasIVAPage from "./components/tarifas-iva/TarifasIVAPage";
import ProductosPage from "./components/productos/ProductosPage";
import PedidosPage from "./components/pedidos/PedidosPage";
import LotesPage from "./components/lotes/LotesPage";
import MovimientosPage from "./components/movimientos/MovimientosPage";
import VentasPage from "./components/ventas/VentasPage";
import CuentasPorCobrarPage from "./components/cuentas-por-cobrar/CuentasPorCobrarPage";
import ReportesPage from "./components/reportes/ReportesPage";
import AuditoriaPage from "./components/auditoria/AuditoriaPage";
import UsuariosPage from "./components/usuarios/UsuariosPage";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/recuperar-contrasena"
        element={<RecuperarPasswordPage />}
      />

      <Route
        path="/restablecer-contrasena"
        element={<RestablecerPasswordPage />}
      />

      <Route
        path="/activar-cuenta"
        element={<ActivarCuentaPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/usuarios"
            element={<UsuariosPage />}
          />

          <Route
            path="/proveedores"
            element={<ProveedoresPage />}
          />

          <Route
            path="/categorias"
            element={<CategoriasPage />}
          />

          <Route
            path="/tarifas-iva"
            element={<TarifasIVAPage />}
          />

          <Route
            path="/productos"
            element={<ProductosPage />}
          />

          <Route
            path="/pedidos"
            element={<PedidosPage />}
          />

          <Route
            path="/lotes"
            element={<LotesPage />}
          />

          <Route
            path="/inventario/movimientos"
            element={<MovimientosPage />}
          />

          <Route
            path="/ventas"
            element={<VentasPage />}
          />

          <Route
            path="/cuentas-por-cobrar"
            element={<CuentasPorCobrarPage />}
          />

          <Route
            path="/reportes"
            element={<ReportesPage />}
          />

          <Route
            path="/auditoria"
            element={<AuditoriaPage />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
