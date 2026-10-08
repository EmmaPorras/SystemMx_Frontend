import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/useAuth";
import { getDefaultRouteForRole } from "./auth/permissions";

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

function HomeRoute() {
  const { user } = useAuth();
  if (user && user.rol !== "ADMIN") {
    return <Navigate to={getDefaultRouteForRole(user.rol)} replace />;
  }
  return <HomePage />;
}

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
          {/* Inicio (ADMIN o redirección automática a módulo asignado) */}
          <Route
            path="/"
            element={<HomeRoute />}
          />

          {/* Administración exclusiva ADMIN */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proveedores"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ProveedoresPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categorias"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CategoriasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tarifas-iva"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <TarifasIVAPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditoria"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AuditoriaPage />
              </ProtectedRoute>
            }
          />

          {/* Compras y Pedidos (ADMIN, COMPRAS) */}
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COMPRAS"]}>
                <PedidosPage />
              </ProtectedRoute>
            }
          />

          {/* Ventas y Cuentas por Cobrar (ADMIN, VENTAS) */}
          <Route
            path="/ventas"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "VENTAS"]}>
                <VentasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cuentas-por-cobrar"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "VENTAS"]}>
                <CuentasPorCobrarPage />
              </ProtectedRoute>
            }
          />

          {/* Reportes Globales (ADMIN, CONSULTA) */}
          <Route
            path="/reportes"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CONSULTA"]}>
                <ReportesPage />
              </ProtectedRoute>
            }
          />

          {/* Inventario compartido (ADMIN, VENTAS, COMPRAS, CONSULTA) */}
          <Route
            path="/productos"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "VENTAS", "COMPRAS", "CONSULTA"]}>
                <ProductosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lotes"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "VENTAS", "COMPRAS", "CONSULTA"]}>
                <LotesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario/movimientos"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "VENTAS", "COMPRAS", "CONSULTA"]}>
                <MovimientosPage />
              </ProtectedRoute>
            }
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
