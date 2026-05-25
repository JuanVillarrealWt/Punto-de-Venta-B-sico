import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import ClientesPage from './pages/ClientesPage';
import ProductosPage from './pages/ProductosPage';
import FacturacionPage from './pages/FacturacionPage';
import ConsultasPage from './pages/ConsultasPage';
import UsuariosPage from './pages/UsuariosPage';
import ErrorLogsPage from './pages/ErrorLogsPage';
import AuditoriaPage from './pages/AuditoriaPage';

import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';

export default function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  const user = useAuthStore(state => state.user);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="flex h-screen bg-white text-zinc-800 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-zinc-50/50 border-l border-zinc-200 relative">
          <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route 
              path="/" 
              element={<Navigate to={user?.role === 'Administrador' ? '/consultas' : '/facturacion'} replace />} 
            />
            
            {/* Rutas con restricción de Rol */}
            {user?.role === 'Administrador' ? (
              <>
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/productos" element={<ProductosPage />} />
                <Route path="/usuarios" element={<UsuariosPage />} />
                <Route path="/logs" element={<ErrorLogsPage />} />
                <Route path="/auditoria" element={<AuditoriaPage />} />
                <Route path="/facturacion" element={<Navigate to="/consultas" replace />} />
              </>
            ) : (
              <>
                <Route path="/clientes" element={<Navigate to="/facturacion" replace />} />
                <Route path="/productos" element={<Navigate to="/facturacion" replace />} />
                <Route path="/usuarios" element={<Navigate to="/facturacion" replace />} />
                <Route path="/logs" element={<Navigate to="/facturacion" replace />} />
                <Route path="/auditoria" element={<Navigate to="/facturacion" replace />} />
                <Route path="/facturacion" element={<FacturacionPage />} />
              </>
            )}

            <Route path="/consultas" element={<ConsultasPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
