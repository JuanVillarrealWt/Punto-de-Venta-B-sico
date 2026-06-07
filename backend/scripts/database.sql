-- ============================================================
-- Script DDL v4 - Base de Datos PuntoDeVentaDB
-- SQL Server - Sistema POS (Punto de Venta)
-- Sincronizado con las entidades de POS.Domain y POSDbContext
-- Última actualización: 2026-06-04
-- ============================================================

-- Crear la base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PuntoDeVentaDB')
    CREATE DATABASE PuntoDeVentaDB;
GO

USE PuntoDeVentaDB;
GO

-- ============================================================
-- Tabla: Roles
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
CREATE TABLE Roles (
    Id          INT           IDENTITY(1,1) PRIMARY KEY,
    Nombre      NVARCHAR(50)  NOT NULL,
    Descripcion NVARCHAR(200) NULL,
    Activo      BIT           NOT NULL DEFAULT 1,
    CONSTRAINT UQ_Roles_Nombre UNIQUE (Nombre)
);
GO

-- ============================================================
-- Tabla: Usuarios
-- Incluye campos de Refresh Token para JWT (sesión persistente)
-- y control de bloqueo por intentos fallidos.
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
CREATE TABLE Usuarios (
    Id                    INT           IDENTITY(1,1) PRIMARY KEY,
    Username              NVARCHAR(50)  NOT NULL,
    PasswordHash          NVARCHAR(MAX) NOT NULL,
    Nombre                NVARCHAR(100) NOT NULL,
    Apellido              NVARCHAR(100) NOT NULL,
    Cedula                CHAR(10)      NULL,
    Email                 NVARCHAR(100) NOT NULL,
    RoleId                INT           NOT NULL,
    Activo                BIT           NOT NULL DEFAULT 1,
    Bloqueado             BIT           NOT NULL DEFAULT 0,
    IntentosFallidos      INT           NOT NULL DEFAULT 0,
    FechaCreacion         DATETIME2(0)  NOT NULL DEFAULT GETUTCDATE(),
    RefreshToken          NVARCHAR(200) NULL,
    RefreshTokenExpiryTime DATETIME2    NULL,

    CONSTRAINT UQ_Usuarios_Username UNIQUE (Username),
    CONSTRAINT FK_Usuarios_Role FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);
GO

-- Índice para búsquedas por Email
CREATE NONCLUSTERED INDEX IX_Usuarios_Email ON Usuarios(Email);
GO

-- ============================================================
-- Tabla: MetodosPago
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MetodosPago')
CREATE TABLE MetodosPago (
    Id          INT           IDENTITY(1,1) PRIMARY KEY,
    Nombre      NVARCHAR(50)  NOT NULL,
    Activo      BIT           NOT NULL DEFAULT 1,
    CONSTRAINT UQ_MetodosPago_Nombre UNIQUE (Nombre)
);
GO

-- ============================================================
-- Tabla: Clientes
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clientes')
CREATE TABLE Clientes (
    Id              INT           IDENTITY(1,1) PRIMARY KEY,
    Identificacion  CHAR(10)      NOT NULL,
    Nombre          NVARCHAR(60)  NOT NULL,
    Apellido        NVARCHAR(60)  NOT NULL,
    Direccion       NVARCHAR(200) NULL,
    Telefono        CHAR(10)      NULL,
    Email           NVARCHAR(100) NULL,
    FechaCreacion   DATETIME2(0)  NOT NULL DEFAULT GETUTCDATE(),
    Activo          BIT           NOT NULL DEFAULT 1,

    CONSTRAINT UQ_Clientes_Identificacion UNIQUE (Identificacion),
    CONSTRAINT CHK_Clientes_Identificacion CHECK (Identificacion LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    CONSTRAINT CHK_Clientes_Telefono CHECK (Telefono IS NULL OR Telefono LIKE '09[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    CONSTRAINT CHK_Clientes_Email CHECK (Email IS NULL OR (Email LIKE '%@%.%' AND LEN(Email) >= 5))
);
GO

-- Índices para búsquedas frecuentes por Nombre y Apellido
CREATE NONCLUSTERED INDEX IX_Clientes_Nombre ON Clientes(Nombre);
CREATE NONCLUSTERED INDEX IX_Clientes_Apellido ON Clientes(Apellido);
CREATE NONCLUSTERED INDEX IX_Clientes_Email ON Clientes(Email);
GO

-- ============================================================
-- Tabla: Productos
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Productos')
CREATE TABLE Productos (
    Id              INT           IDENTITY(1,1) PRIMARY KEY,
    Codigo          NVARCHAR(20)  NOT NULL,
    Nombre          NVARCHAR(150) NOT NULL,
    Descripcion     NVARCHAR(300) NULL,
    Precio          DECIMAL(10,2) NOT NULL,
    Stock           INT           NOT NULL DEFAULT 0,
    FechaCreacion   DATETIME2(0)  NOT NULL DEFAULT GETUTCDATE(),
    Activo          BIT           NOT NULL DEFAULT 1,

    CONSTRAINT UQ_Productos_Codigo UNIQUE (Codigo),
    CONSTRAINT CHK_Productos_Precio CHECK (Precio >= 0),
    CONSTRAINT CHK_Productos_Stock CHECK (Stock >= 0),
    CONSTRAINT CHK_Productos_Codigo CHECK (LEN(LTRIM(RTRIM(Codigo))) > 0)
);
GO

-- Índice para búsquedas por Nombre
CREATE NONCLUSTERED INDEX IX_Productos_Nombre ON Productos(Nombre);
GO

-- ============================================================
-- Tabla: FacturaMaestro
-- Contiene SnapshotJson (NVARCHAR(MAX)) para almacenar una
-- copia inmutable de los datos del cliente, vendedor, método
-- de pago y detalles al momento de la venta (datos históricos).
-- Las FK usan ON DELETE NO ACTION (Restrict) para proteger
-- la integridad referencial.
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FacturaMaestro')
CREATE TABLE FacturaMaestro (
    Id              INT            IDENTITY(1,1) PRIMARY KEY,
    NumeroFactura   NVARCHAR(10)   NOT NULL,
    Fecha           DATETIME2(0)   NOT NULL DEFAULT GETUTCDATE(),
    ClienteId       INT            NOT NULL,
    UsuarioId       INT            NOT NULL,
    MetodoPagoId    INT            NOT NULL,
    Subtotal        DECIMAL(10,2)  NOT NULL DEFAULT 0,
    PorcentajeIva   DECIMAL(4,2)   NOT NULL DEFAULT 15,
    MontoIva        DECIMAL(10,2)  NOT NULL DEFAULT 0,
    Total           DECIMAL(10,2)  NOT NULL DEFAULT 0,
    Observaciones   NVARCHAR(300)  NULL,
    Estado          NVARCHAR(20)   NOT NULL DEFAULT 'CONFIRMADA',
    SnapshotJson    NVARCHAR(MAX)  NULL,

    CONSTRAINT UQ_FacturaMaestro_Numero UNIQUE (NumeroFactura),
    CONSTRAINT FK_FacturaMaestro_Cliente FOREIGN KEY (ClienteId) REFERENCES Clientes(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_FacturaMaestro_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_FacturaMaestro_MetodoPago FOREIGN KEY (MetodoPagoId) REFERENCES MetodosPago(Id) ON DELETE NO ACTION,
    CONSTRAINT CHK_FacturaMaestro_Estado CHECK (Estado IN ('BORRADOR', 'CONFIRMADA', 'ANULADA'))
);
GO

-- ============================================================
-- Tabla: FacturaDetalle (CON DATOS HISTÓRICOS - REQUISITO #28)
-- Guarda ProductoCodigo, ProductoNombre y PrecioUnitario como
-- snapshot inmutable del producto al momento de la venta.
-- ON DELETE CASCADE desde FacturaMaestro.
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FacturaDetalle')
CREATE TABLE FacturaDetalle (
    Id                INT           IDENTITY(1,1) PRIMARY KEY,
    FacturaMaestroId  INT           NOT NULL,
    ProductoId        INT           NOT NULL,
    ProductoCodigo    NVARCHAR(20)  NOT NULL,
    ProductoNombre    NVARCHAR(150) NOT NULL,
    Cantidad          INT           NOT NULL,
    PrecioUnitario    DECIMAL(10,2) NOT NULL,
    Subtotal          DECIMAL(10,2) NOT NULL,

    CONSTRAINT FK_FacturaDetalle_Maestro FOREIGN KEY (FacturaMaestroId) REFERENCES FacturaMaestro(Id) ON DELETE CASCADE,
    CONSTRAINT FK_FacturaDetalle_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE NO ACTION
);
GO

-- ============================================================
-- Tabla: MovimientoStock (KARDEX - REQUISITO #31)
-- Registra cada entrada/salida de inventario con trazabilidad
-- completa: stock anterior, stock nuevo, referencia y usuario.
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MovimientoStock')
CREATE TABLE MovimientoStock (
    Id                INT           IDENTITY(1,1) PRIMARY KEY,
    ProductoId        INT           NOT NULL,
    TipoMovimiento    NVARCHAR(20)  NOT NULL,
    Cantidad          INT           NOT NULL,
    StockAnterior     INT           NOT NULL,
    StockNuevo        INT           NOT NULL,
    Referencia        NVARCHAR(100) NULL,
    Fecha             DATETIME2(0)  NOT NULL DEFAULT GETUTCDATE(),
    UsuarioId         INT           NOT NULL,

    CONSTRAINT FK_MovimientoStock_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(Id),
    CONSTRAINT FK_MovimientoStock_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id)
);
GO

-- ============================================================
-- Tabla: ErrorLog (REQUISITO #26)
-- Almacena excepciones capturadas por el middleware global.
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ErrorLog')
CREATE TABLE ErrorLog (
    Id              INT           IDENTITY(1,1) PRIMARY KEY,
    Message         NVARCHAR(MAX) NOT NULL,
    ExceptionType   NVARCHAR(200) NULL,
    StackTrace      NVARCHAR(MAX) NULL,
    Source          NVARCHAR(200) NULL,
    Pantalla        NVARCHAR(100) NULL,
    Evento          NVARCHAR(100) NULL,
    UserId          INT           NULL,
    CreatedAt       DATETIME2(0)  NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ============================================================
-- Semillas (Seeds) Obligatorias
-- Todos los INSERT especifican TODAS las columnas editables
-- para servir como guía completa del esquema.
-- ============================================================

-- -------------------------------------------------------
-- 1. Roles
-- Columnas: Nombre, Descripcion, Activo
-- -------------------------------------------------------
INSERT INTO Roles (Nombre, Descripcion, Activo) VALUES
    ('Administrador', 'Acceso total al sistema', 1),
    ('Vendedor', 'Caja y Ventas', 1);
GO

-- -------------------------------------------------------
-- 2. Usuarios
-- Columnas: Username, PasswordHash, Nombre, Apellido,
--           Cedula, Email, RoleId, Activo, Bloqueado,
--           IntentosFallidos, RefreshToken, RefreshTokenExpiryTime
-- Nota: FechaCreacion usa DEFAULT GETUTCDATE()
-- Password: admin123 (hash BCrypt)
-- -------------------------------------------------------
INSERT INTO Usuarios (Username, PasswordHash, Nombre, Apellido, Cedula, Email, RoleId, Activo, Bloqueado, IntentosFallidos, RefreshToken, RefreshTokenExpiryTime) VALUES
    ('admin', '$2b$10$Z2YI9ily8/8OGNFtSvCuP.28PSxuHbAZJLVTWFRWoFy9Qkpir809O', 'Admin', 'Sistema', NULL, 'admin@pos.com', 1, 1, 0, 0, NULL, NULL);
GO

-- -------------------------------------------------------
-- 3. MetodosPago
-- Columnas: Nombre, Activo
-- (SOLO EFECTIVO - REQUISITO #29)
-- -------------------------------------------------------
INSERT INTO MetodosPago (Nombre, Activo) VALUES
    ('Efectivo', 1);
GO

-- -------------------------------------------------------
-- 4. Clientes
-- Columnas: Identificacion, Nombre, Apellido, Direccion,
--           Telefono, Email, Activo
-- Nota: FechaCreacion usa DEFAULT GETUTCDATE()
-- -------------------------------------------------------
INSERT INTO Clientes (Identificacion, Nombre, Apellido, Direccion, Telefono, Email, Activo) VALUES
    ('1102030405', 'Juan', 'Villarreal', NULL, NULL, NULL, 1);
GO

-- -------------------------------------------------------
-- 5. Productos
-- Columnas: Codigo, Nombre, Descripcion, Precio, Stock, Activo
-- Nota: FechaCreacion usa DEFAULT GETUTCDATE()
-- -------------------------------------------------------
INSERT INTO Productos (Codigo, Nombre, Descripcion, Precio, Stock, Activo) VALUES
    ('ARR-001', 'Arroz 1kg',  NULL, 1.25, 100, 1),
    ('AZU-002', 'Azucar 1kg', NULL, 1.10,  90, 1);
GO
