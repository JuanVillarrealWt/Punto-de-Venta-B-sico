# Sistema POS Web — Punto de Venta

## Requisitos Previos
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/sql-server) (Express o Developer)

---

## 🗄️ Base de Datos

Ejecutar el script SQL en SQL Server Management Studio:

```sql
-- Abrir y ejecutar:
backend/scripts/database.sql
```

Esto crea la base de datos `PuntoDeVentaDB` con tablas y datos de prueba.

---

## 🔧 Backend (.NET 10)

```bash
cd backend

# Restaurar paquetes NuGet
dotnet restore

# Ejecutar la API (puerto 5000)
dotnet run --project src/POS.API
```

La API estará disponible en `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

### Estructura Clean Architecture:
```
backend/src/
├── POS.Domain/          → Entidades, Interfaces
├── POS.Application/     → Commands, Queries, Handlers, Validators, DTOs
├── POS.Infrastructure/  → EF Core, Repositorios, UnitOfWork, PDF
└── POS.API/             → Controllers, Program.cs
```

---

## 🖥️ Frontend (React + Vite + Tailwind)

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo (puerto 5173)
npm run dev
```

Abrir `http://localhost:5173`

### Módulos:
- **Facturación** — POS con carrito, modales de búsqueda, cálculos en tiempo real
- **Clientes** — CRUD completo
- **Productos** — CRUD con gestión de stock
- **Consultas** — Historial de facturas + descarga PDF

---

## 📦 Dependencias Principales

### Backend (NuGet)
| Paquete | Uso |
|---------|-----|
| MediatR | Patrón Mediator (CQRS) |
| FluentValidation | Validación de comandos |
| AutoMapper | Mapeo Entidad → DTO |
| EF Core SQL Server | ORM + Base de datos |
| QuestPDF | Generación de facturas PDF |

### Frontend (npm)
| Paquete | Uso |
|---------|-----|
| React + Vite | Framework + Build tool |
| Tailwind CSS | Estilos utilitarios |
| Zustand | Estado global (carrito) |
| Axios | HTTP Client |
| React Router | Navegación SPA |
| Heroicons | Íconos |
| React Hot Toast | Notificaciones |

---

## 🎨 Paleta de Colores
- **Fondo**: `slate-50`
- **Encabezados/Sidebar**: `slate-800`
- **Acento navegación**: `indigo-600`
- **Finalizar venta**: `emerald-500`

---

## 📝 IVA
Configurado al **15%** (Ecuador). Se aplica automáticamente en el cálculo de facturas.

## 📄 Formato de Factura
Numeración secuencial: `0001`, `0002`, `0003`, etc.
