import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import ClientesPage from './pages/ClientesPage';
import ProductosPage from './pages/ProductosPage';
import FacturacionPage from './pages/FacturacionPage';
import ConsultasPage from './pages/ConsultasPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/facturacion" replace />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/facturacion" element={<FacturacionPage />} />
            <Route path="/consultas" element={<ConsultasPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
