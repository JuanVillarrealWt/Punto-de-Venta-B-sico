-- ============================================================
-- Script DDL v3 - Base de Datos PuntoDeVentaDB
-- SQL Server - Sistema POS (Compra y Venta)
-- Cumple con todos los requisitos de la UTA
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
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
CREATE TABLE Usuarios (
    Id              INT           IDENTITY(1,1) PRIMARY KEY,
    Username        NVARCHAR(50)  NOT NULL,
    PasswordHash    NVARCHAR(MAX) NOT NULL,
    Nombre          NVARCHAR(100) NOT NULL,
    Apellido        NVARCHAR(100) NOT NULL,
    Cedula          CHAR(10)      NULL,
    Email           NVARCHAR(100) NOT NULL,
    RoleId          INT           NOT NULL,
    Activo          BIT           NOT NULL DEFAULT 1,
    Bloqueado       BIT           NOT NULL DEFAULT 0,
    IntentosFallidos INT          NOT NULL DEFAULT 0,
    FechaCreacion   DATETIME2(0)  NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_Usuarios_Username UNIQUE (Username),
    CONSTRAINT FK_Usuarios_Role FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);
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

-- ============================================================
-- Tabla: FacturaMaestro
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FacturaMaestro')
CREATE TABLE FacturaMaestro (
    Id              INT           IDENTITY(1,1) PRIMARY KEY,
    NumeroFactura   NVARCHAR(10)  NOT NULL,
    Fecha           DATETIME2(0)  NOT NULL DEFAULT GETUTCDATE(),
    ClienteId       INT           NOT NULL,
    UsuarioId       INT           NOT NULL,
    MetodoPagoId    INT           NOT NULL,
    Subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
    PorcentajeIva   DECIMAL(4,2)  NOT NULL DEFAULT 15,
    MontoIva        DECIMAL(10,2) NOT NULL DEFAULT 0,
    Total           DECIMAL(10,2) NOT NULL DEFAULT 0,
    Observaciones   NVARCHAR(300) NULL,
    Estado          NVARCHAR(20)  NOT NULL DEFAULT 'CONFIRMADA',

    CONSTRAINT UQ_FacturaMaestro_Numero UNIQUE (NumeroFactura),
    CONSTRAINT FK_FacturaMaestro_Cliente FOREIGN KEY (ClienteId) REFERENCES Clientes(Id),
    CONSTRAINT FK_FacturaMaestro_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id),
    CONSTRAINT FK_FacturaMaestro_MetodoPago FOREIGN KEY (MetodoPagoId) REFERENCES MetodosPago(Id),
    CONSTRAINT CHK_FacturaMaestro_Estado CHECK (Estado IN ('BORRADOR', 'CONFIRMADA', 'ANULADA'))
);
GO

-- ============================================================
-- Tabla: FacturaDetalle (CON DATOS HISTÓRICOS - REQUISITO #28)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FacturaDetalle')
CREATE TABLE FacturaDetalle (
    Id                INT           IDENTITY(1,1) PRIMARY KEY,
    FacturaMaestroId  INT           NOT NULL,
    ProductoId        INT           NOT NULL,
    ProductoCodigo    NVARCHAR(20)  NOT NULL, -- HISTÓRICO REQUERIDO
    ProductoNombre    NVARCHAR(150) NOT NULL, -- HISTÓRICO REQUERIDO
    Cantidad          INT           NOT NULL,
    PrecioUnitario    DECIMAL(10,2) NOT NULL, -- HISTÓRICO REQUERIDO
    Subtotal          DECIMAL(10,2) NOT NULL,

    CONSTRAINT FK_FacturaDetalle_Maestro FOREIGN KEY (FacturaMaestroId) REFERENCES FacturaMaestro(Id) ON DELETE CASCADE,
    CONSTRAINT FK_FacturaDetalle_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(Id)
);
GO

-- ============================================================
-- Tabla: MovimientoStock (KARDEX - REQUISITO #31)
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
-- ============================================================

-- Roles y Usuarios
INSERT INTO Roles (Nombre, Descripcion) VALUES ('Administrador', 'Acceso total'), ('Vendedor', 'Caja y Ventas');
INSERT INTO Usuarios (Username, PasswordHash, Nombre, Apellido, Email, RoleId) VALUES ('admin', '$2b$10$Z2YI9ily8/8OGNFtSvCuP.28PSxuHbAZJLVTWFRWoFy9Qkpir809O', 'Admin', 'Sistema', 'admin@pos.com', 1);

-- Metodos de Pago (SOLO EFECTIVO - REQUISITO #29)
INSERT INTO MetodosPago (Nombre) VALUES ('Efectivo');

-- Clientes Base
INSERT INTO Clientes (Identificacion, Nombre, Apellido, Activo) VALUES ('1102030405', 'Juan', 'Villarreal', 1);

-- Productos Base
INSERT INTO Productos (Codigo, Nombre, Precio, Stock, Activo) VALUES ('ARR-001', 'Arroz 1kg', 1.25, 100, 1), ('AZU-002', 'Azucar 1kg', 1.10, 90, 1);
GO
