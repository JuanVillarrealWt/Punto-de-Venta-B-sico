using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Identificacion = table.Column<string>(type: "char(10)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Direccion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Telefono = table.Column<string>(type: "char(10)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ErrorLog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExceptionType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StackTrace = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pantalla = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Evento = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErrorLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MetodosPago",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetodosPago", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Productos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Precio = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Stock = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Cedula = table.Column<string>(type: "char(10)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Bloqueado = table.Column<bool>(type: "bit", nullable: false),
                    IntentosFallidos = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FacturaMaestro",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumeroFactura = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClienteId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    MetodoPagoId = table.Column<int>(type: "int", nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    PorcentajeIva = table.Column<decimal>(type: "decimal(4,2)", nullable: false),
                    MontoIva = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "CONFIRMADA"),
                    SnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FacturaMaestro", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FacturaMaestro_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FacturaMaestro_MetodosPago_MetodoPagoId",
                        column: x => x.MetodoPagoId,
                        principalTable: "MetodosPago",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FacturaMaestro_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MovimientoStock",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    TipoMovimiento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    StockAnterior = table.Column<int>(type: "int", nullable: false),
                    StockNuevo = table.Column<int>(type: "int", nullable: false),
                    Referencia = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientoStock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimientoStock_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimientoStock_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FacturaDetalle",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FacturaMaestroId = table.Column<int>(type: "int", nullable: false),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    ProductoCodigo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ProductoNombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FacturaDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FacturaDetalle_FacturaMaestro_FacturaMaestroId",
                        column: x => x.FacturaMaestroId,
                        principalTable: "FacturaMaestro",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FacturaDetalle_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_Apellido",
                table: "Clientes",
                column: "Apellido");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_Email",
                table: "Clientes",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_Identificacion",
                table: "Clientes",
                column: "Identificacion",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_Nombre",
                table: "Clientes",
                column: "Nombre");

            migrationBuilder.CreateIndex(
                name: "IX_FacturaDetalle_FacturaMaestroId",
                table: "FacturaDetalle",
                column: "FacturaMaestroId");

            migrationBuilder.CreateIndex(
                name: "IX_FacturaDetalle_ProductoId",
                table: "FacturaDetalle",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_FacturaMaestro_ClienteId",
                table: "FacturaMaestro",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_FacturaMaestro_MetodoPagoId",
                table: "FacturaMaestro",
                column: "MetodoPagoId");

            migrationBuilder.CreateIndex(
                name: "IX_FacturaMaestro_NumeroFactura",
                table: "FacturaMaestro",
                column: "NumeroFactura",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FacturaMaestro_UsuarioId",
                table: "FacturaMaestro",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientoStock_ProductoId",
                table: "MovimientoStock",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientoStock_UsuarioId",
                table: "MovimientoStock",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_Codigo",
                table: "Productos",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Productos_Nombre",
                table: "Productos",
                column: "Nombre");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Nombre",
                table: "Roles",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_RoleId",
                table: "Usuarios",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Username",
                table: "Usuarios",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ErrorLog");

            migrationBuilder.DropTable(
                name: "FacturaDetalle");

            migrationBuilder.DropTable(
                name: "MovimientoStock");

            migrationBuilder.DropTable(
                name: "FacturaMaestro");

            migrationBuilder.DropTable(
                name: "Productos");

            migrationBuilder.DropTable(
                name: "Clientes");

            migrationBuilder.DropTable(
                name: "MetodosPago");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
