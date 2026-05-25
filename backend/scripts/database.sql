-- ============================================================
-- Script DDL v2 - Base de Datos PuntoDeVentaDB
-- SQL Server - Sistema POS (Compra y Venta)
-- Incluye: Constraints, CHECK, Índices de rendimiento,
--          columna Estado en facturas, tipos optimizados
-- ============================================================

-- Crear la base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PuntoDeVentaDB')
    CREATE DATABASE PuntoDeVentaDB;
GO

USE PuntoDeVentaDB;
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

    -- Identificación: exactamente 10 dígitos numéricos
    CONSTRAINT CHK_Clientes_Identificacion
        CHECK (Identificacion LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),

    -- Teléfono: 10 dígitos, empieza con 09
    CONSTRAINT CHK_Clientes_Telefono
        CHECK (Telefono IS NULL OR Telefono LIKE '09[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),

    -- Email: formato mínimo con @ y punto
    CONSTRAINT CHK_Clientes_Email
        CHECK (Email IS NULL OR (Email LIKE '%@%.%' AND LEN(Email) >= 5))
);
GO

-- Índices para búsqueda de clientes por nombre/apellido
CREATE INDEX IX_Clientes_Nombre   ON Clientes(Nombre);
CREATE INDEX IX_Clientes_Apellido ON Clientes(Apellido);
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

    -- Precio no puede ser negativo
    CONSTRAINT CHK_Productos_Precio
        CHECK (Precio >= 0),

    -- Stock no puede ser negativo
    CONSTRAINT CHK_Productos_Stock
        CHECK (Stock >= 0),

    -- Código no puede ser cadena vacía
    CONSTRAINT CHK_Productos_Codigo
        CHECK (LEN(LTRIM(RTRIM(Codigo))) > 0)
);
GO

-- Índice para búsqueda de productos por nombre (modal de facturación)
CREATE INDEX IX_Productos_Nombre ON Productos(Nombre);
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
    Subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
    PorcentajeIva   DECIMAL(4,2)  NOT NULL DEFAULT 15,
    MontoIva        DECIMAL(10,2) NOT NULL DEFAULT 0,
    Total           DECIMAL(10,2) NOT NULL DEFAULT 0,
    Observaciones   NVARCHAR(300) NULL,
    Estado          NVARCHAR(10)  NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT UQ_FacturaMaestro_Numero UNIQUE (NumeroFactura),

    CONSTRAINT FK_FacturaMaestro_Cliente FOREIGN KEY (ClienteId)
        REFERENCES Clientes(Id) ON DELETE NO ACTION,

    -- Solo valores de estado permitidos
    CONSTRAINT CHK_FacturaMaestro_Estado
        CHECK (Estado IN ('ACTIVA', 'ANULADA')),

    -- Montos no negativos
    CONSTRAINT CHK_FacturaMaestro_Subtotal
        CHECK (Subtotal >= 0),
    CONSTRAINT CHK_FacturaMaestro_Total
        CHECK (Total >= 0),
    CONSTRAINT CHK_FacturaMaestro_IVA
        CHECK (PorcentajeIva >= 0 AND PorcentajeIva <= 100)
);
GO

-- Índices de rendimiento para el módulo de Consultas
CREATE INDEX IX_FacturaMaestro_Fecha     ON FacturaMaestro(Fecha DESC);
CREATE INDEX IX_FacturaMaestro_ClienteId ON FacturaMaestro(ClienteId);
CREATE INDEX IX_FacturaMaestro_Estado    ON FacturaMaestro(Estado);
GO

-- ============================================================
-- Tabla: FacturaDetalle
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FacturaDetalle')
CREATE TABLE FacturaDetalle (
    Id                INT           IDENTITY(1,1) PRIMARY KEY,
    FacturaMaestroId  INT           NOT NULL,
    ProductoId        INT           NOT NULL,
    ProductoNombre    NVARCHAR(150) NOT NULL,
    Cantidad          INT           NOT NULL,
    PrecioUnitario    DECIMAL(10,2) NOT NULL,
    Subtotal          DECIMAL(10,2) NOT NULL,

    CONSTRAINT FK_FacturaDetalle_Maestro FOREIGN KEY (FacturaMaestroId)
        REFERENCES FacturaMaestro(Id) ON DELETE CASCADE,

    CONSTRAINT FK_FacturaDetalle_Producto FOREIGN KEY (ProductoId)
        REFERENCES Productos(Id) ON DELETE NO ACTION,

    -- Cantidad mínima 1
    CONSTRAINT CHK_FacturaDetalle_Cantidad
        CHECK (Cantidad >= 1),

    -- Valores no negativos
    CONSTRAINT CHK_FacturaDetalle_Precio
        CHECK (PrecioUnitario >= 0),
    CONSTRAINT CHK_FacturaDetalle_Subtotal
        CHECK (Subtotal >= 0)
);
GO

-- Índice para cargar el detalle de una factura rápidamente
CREATE INDEX IX_FacturaDetalle_FacturaMaestroId ON FacturaDetalle(FacturaMaestroId);
GO

-- ============================================================
-- Datos de Prueba
-- ============================================================

-- Clientes
INSERT INTO Clientes (Identificacion, Nombre, Apellido, Direccion, Telefono, Email, Activo) VALUES
('1102030405', 'Juan',      'Villarreal', 'Calle Sucre 120',       '0991111111', 'juan.villarreal@email.com',  1),
('1203040506', 'Camila',    'Sandoval',   'Av Amazonas 456',        '0992222222', 'camila.sandoval@email.com',  1),
('1304050607', 'Evelim',    'Arroba',     'Barrio Central Casa 12', '0993333333', 'evelim.arroba@email.com',    1),
('1405060708', 'Sebastian', 'Arroba',     'Calle Bolivar 890',      '0994444444', 'sebastian.arroba@email.com', 1),
('1506070809', 'Patricio',  'Villarreal', 'Av Quito 321',           '0995555555', 'patricio.villarreal@email.com', 1);
GO

-- Productos Abarrotes
INSERT INTO Productos (Codigo, Nombre, Descripcion, Precio, Stock, Activo) VALUES
('ARR-001', 'Arroz 1kg',          'Arroz blanco funda 1kg',             1.25, 100, 1),
('AZU-002', 'Azucar 1kg',         'Azucar blanca refinada 1kg',         1.10,  90, 1),
('ACE-003', 'Aceite 900ml',       'Aceite vegetal botella 900ml',       2.75,  60, 1),
('LEC-004', 'Leche 1L',           'Leche entera larga vida 1 litro',    1.35,  80, 1),
('ATU-005', 'Atun lata',          'Atun en aceite lata 170g',           1.60,  70, 1),
('FID-006', 'Fideos 400g',        'Fideos tipo espagueti 400g',         0.85, 120, 1),
('GAL-007', 'Galletas chocolate', 'Galletas rellenas sabor chocolate',  0.95, 110, 1),
('SAL-008', 'Sal 500g',           'Sal yodada funda 500g',              0.45, 150, 1),
('CAF-009', 'Cafe 100g',          'Cafe soluble frasco 100g',           3.20,  40, 1),
('HAR-010', 'Harina 1kg',         'Harina de trigo funda 1kg',          1.05,  85, 1);
GO
