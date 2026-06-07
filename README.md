# 🛒 Sistema POS Web — Punto de Venta Profesional

---

## 💻 Resumen de Tecnologías y Dónde se Usan

Para que entiendas fácilmente cómo está construido este programa, aquí tienes un resumen claro de las tecnologías utilizadas y su función:

*   **React 18 (Frontend):** Se utiliza para construir toda la interfaz web con la que interactúa el usuario (botones, formularios, tablas, carrito de compras).
*   **Vite (Frontend):** Es el motor que compila y arranca el código frontend de manera ultra rápida durante el desarrollo.
*   **Tailwind CSS (Frontend):** Se encarga de todo el diseño visual, estilos, colores y de hacer que la web se adapte a celulares y computadoras (diseño responsivo).
*   **Zustand (Frontend):** Se utiliza para manejar el estado global de la aplicación web, como por ejemplo almacenar los productos agregados al carrito de compras mientras navegas.
*   **Axios (Frontend):** Es la librería que envía peticiones HTTP desde la web hacia el servidor (Backend) para guardar, editar o traer datos.
*   **C# y .NET 10 (Backend):** Es el lenguaje y el entorno donde corre el servidor de la aplicación (la lógica del negocio, seguridad, API y reglas del sistema).
*   **Entity Framework Core 10 (Backend):** Funciona como un puente inteligente (ORM) para consultar y guardar información en la base de datos sin escribir código SQL directamente.
*   **SQL Server (Base de Datos):** El motor donde se guarda de forma segura toda la información real de los productos, clientes, facturas, usuarios y logs.
*   **QuestPDF (Backend):** Librería especializada para crear y estructurar los archivos PDF de las facturas que se descargan.
*   **MediatR (Backend):** Implementa el patrón CQRS para separar las operaciones de lectura y escritura del sistema, manteniendo el código limpio y organizado.
*   **FluentValidation (Backend):** Se encarga de validar que los datos enviados a la API (como crear un cliente o producto) cumplan con las reglas de negocio antes de guardarse.

---

## 🌟 Módulos y Páginas del Sistema

El sistema cuenta con las siguientes pantallas e interfaces interactivas:

| 📄 Página / Módulo | 🛠️ Descripción y Funcionalidad |
| :--- | :--- |
| **🔐 Login** | Acceso protegido al sistema mediante tokens JWT. Las contraseñas se almacenan encriptadas con BCrypt. |
| **🛒 Facturación** | Interfaz ágil tipo punto de venta (POS). Permite buscar productos, gestionar un carrito de compras interactivo en tiempo real, calcular totales automáticamente con el **15% de IVA** y generar la factura final. |
| **📦 Productos** | CRUD completo (Crear, Leer, Actualizar, Eliminar) para administrar el inventario con control de stock en tiempo real. |
| **👥 Clientes** | Registro y control de los clientes del negocio para asociarlos a las facturas de venta. |
| **👨‍💼 Usuarios** | Administración de los empleados/usuarios que pueden acceder al sistema y asignación de sus respectivos roles. |
| **📊 Consultas** | Historial de todas las facturas procesadas con filtros de búsqueda y la capacidad de descargar el comprobante en formato **PDF**. |
| **🕵️ Auditoría** | Registro interno para el control y supervisión que almacena el historial de las acciones de cada usuario dentro del sistema. |
| **🚨 Error Logs** | Módulo de monitoreo técnico que registra excepciones del backend para ayudar al administrador a diagnosticar fallos rápidamente. |

---

## 🏗️ Arquitectura del Proyecto (Carpetas)

El proyecto está separado limpiamente para mantener el orden de desarrollo:

### 📁 Directorio Frontend (`/frontend`)
*   `src/pages/`: Contiene el código de cada una de las pantallas de la aplicación listadas arriba.
*   `src/components/`: Componentes comunes reutilizables (modales, botones personalizados, tablas).
*   `src/store/`: Estado global de la aplicación (Zustand) para coordinar el carrito de compras.

### 📁 Directorio Backend (`/backend`)
Estructurado bajo **Clean Architecture**:
*   `POS.Domain`: Contiene las entidades principales, tipos básicos y las interfaces sin dependencias de terceros.
*   `POS.Application`: Lógica central del sistema, comandos, consultas, DTOs y validaciones de flujo.
*   `POS.Infrastructure`: Manejo directo de base de datos (DbContext), migraciones de EF Core, repositorios y generación física de PDFs.
*   `POS.API`: Capa externa con los controladores HTTP de la API, configuración de autenticación JWT y archivos de configuración del servidor.

---

## 🚀 Cómo Configurar y Correr el Proyecto Localmente

> [!IMPORTANT]  
> **Requisitos Previos Obligatorios:**
> 1. Tener instalado el SDK de **.NET 10**.
> 2. Tener instalado **Node.js** (versión 18 o superior).
> 3. Tener una instancia local de **SQL Server** activa.

### Paso 1: Configurar la Base de Datos

1. Abre una terminal en la carpeta `/backend`.
2. Ejecuta el siguiente comando para generar y aplicar las tablas automáticamente en tu base de datos mediante Entity Framework Core:
   ```bash
   dotnet ef database update --project src/POS.Infrastructure --startup-project src/POS.API
   ```

> ℹ️ **Credenciales de Administrador Iniciales:**
> *   **Usuario:** `admin`
> *   **Contraseña:** `Admin123!`

### Paso 2: Ejecutar el Backend

1. En la carpeta `/backend`, levanta el servidor ejecutando:
   ```bash
   dotnet run --project src/POS.API
   ```
2. El servidor iniciará en el puerto `http://localhost:5251`.
3. Puedes ver la documentación de los endpoints en Swagger entrando a: `http://localhost:5251/swagger`.

### Paso 3: Ejecutar el Frontend

1. Abre otra terminal en la carpeta `/frontend`.
2. Instala las librerías necesarias con:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo web ejecutando:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en la dirección: `http://localhost:5173`.

---

## 📦 Guía de Transferencia (Cómo pasar el proyecto a otra PC)

Si vas a enviar este proyecto comprimido en un archivo `.ZIP` a otra persona, sigue estos pasos para asegurar que funcione sin problemas y no sea extremadamente pesado:

> [!WARNING]  
> **¡MUY IMPORTANTE ANTES DE COMPRIMIR!**
> Borra estas carpetas del proyecto. Son archivos temporales de compilación y dependencias locales que se autogeneran de nuevo al correr el proyecto. Si no las borras, el archivo ZIP pesará cientos de megabytes innecesariamente:
> *   ❌ La carpeta `frontend/node_modules/`
>   *   ❌ Las carpetas `bin/` y `obj/` dentro de cada subproyecto del backend (`POS.API`, `POS.Application`, `POS.Domain`, `POS.Infrastructure`).

### 🛠️ Pasos para la persona que recibe el proyecto en su máquina:

| Paso | Acción |
| :---: | :--- |
| **1** | **Extraer** el archivo `.ZIP` en cualquier carpeta de su disco local. |
| **2** | **Configurar SQL Server:** Abrir el archivo `backend/src/POS.API/appsettings.json` y en `DefaultConnection` cambiar `Server=.\\PUNTO_VENTA` por el nombre de su instancia local de SQL Server (por ejemplo, `Server=.\\SQLEXPRESS` o `Server=.`). |
| **3** | **Aplicar base de datos:** En una terminal dentro de `/backend` ejecutar:<br>`dotnet ef database update --project src/POS.Infrastructure --startup-project src/POS.API` |
| **4** | **Instalar dependencias del Cliente:** En una terminal dentro de `/frontend` ejecutar:<br>`npm install` |
| **5** | **Iniciar el programa:**<br>▶️ Terminal 1 (en `/backend`): `dotnet run --project src/POS.API`<br>▶️ Terminal 2 (en `/frontend`): `npm run dev` |
