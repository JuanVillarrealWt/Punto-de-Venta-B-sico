using Microsoft.EntityFrameworkCore;
using POS.Domain.Entities;

namespace POS.Infrastructure.Data;

public class POSDbContext : DbContext
{
    public POSDbContext(DbContextOptions<POSDbContext> options) : base(options) { }

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<FacturaMaestro> FacturasMaestro => Set<FacturaMaestro>();
    public DbSet<FacturaDetalle> FacturasDetalle => Set<FacturaDetalle>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<MetodoPago> MetodosPago => Set<MetodoPago>();
    public DbSet<MovimientoStock> MovimientosStock => Set<MovimientoStock>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Cliente
        modelBuilder.Entity<Cliente>(e =>
        {
            e.ToTable("Clientes");
            e.HasKey(c => c.Id);
            e.Property(c => c.Identificacion).HasColumnType("char(10)").IsRequired();
            e.Property(c => c.Nombre).HasMaxLength(60).IsRequired();
            e.Property(c => c.Apellido).HasMaxLength(60).IsRequired();
            e.Property(c => c.Direccion).HasMaxLength(200);
            e.Property(c => c.Telefono).HasColumnType("char(10)");
            e.Property(c => c.Email).HasMaxLength(100);
            e.HasIndex(c => c.Identificacion).IsUnique();
            e.HasIndex(c => c.Nombre);
            e.HasIndex(c => c.Apellido);
            e.HasIndex(c => c.Email);
        });

        // Producto
        modelBuilder.Entity<Producto>(e =>
        {
            e.ToTable("Productos");
            e.HasKey(p => p.Id);
            e.Property(p => p.Codigo).HasMaxLength(20).IsRequired();
            e.Property(p => p.Nombre).HasMaxLength(150).IsRequired();
            e.Property(p => p.Descripcion).HasMaxLength(300);
            e.Property(p => p.Precio).HasColumnType("decimal(10,2)");
            e.HasIndex(p => p.Codigo).IsUnique();
            e.HasIndex(p => p.Nombre);
        });

        // FacturaMaestro
        modelBuilder.Entity<FacturaMaestro>(e =>
        {
            e.ToTable("FacturaMaestro");
            e.HasKey(f => f.Id);
            e.Property(f => f.NumeroFactura).HasMaxLength(10).IsRequired();
            e.Property(f => f.Subtotal).HasColumnType("decimal(10,2)");
            e.Property(f => f.PorcentajeIva).HasColumnType("decimal(4,2)");
            e.Property(f => f.MontoIva).HasColumnType("decimal(10,2)");
            e.Property(f => f.Total).HasColumnType("decimal(10,2)");
            e.Property(f => f.Observaciones).HasMaxLength(300);
            e.Property(f => f.Estado).HasMaxLength(20).IsRequired().HasDefaultValue("CONFIRMADA");
            e.Property(f => f.SnapshotJson).IsRequired(false);
            e.HasIndex(f => f.NumeroFactura).IsUnique();

            e.HasOne(f => f.Cliente)
                .WithMany(c => c.Facturas)
                .HasForeignKey(f => f.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(f => f.Usuario)
                .WithMany()
                .HasForeignKey(f => f.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(f => f.MetodoPago)
                .WithMany()
                .HasForeignKey(f => f.MetodoPagoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // FacturaDetalle
        modelBuilder.Entity<FacturaDetalle>(e =>
        {
            e.ToTable("FacturaDetalle");
            e.HasKey(d => d.Id);
            e.Property(d => d.ProductoCodigo).HasMaxLength(20).IsRequired();
            e.Property(d => d.ProductoNombre).HasMaxLength(150);
            e.Property(d => d.PrecioUnitario).HasColumnType("decimal(10,2)");
            e.Property(d => d.Subtotal).HasColumnType("decimal(10,2)");

            e.HasOne(d => d.FacturaMaestro)
                .WithMany(f => f.Detalles)
                .HasForeignKey(d => d.FacturaMaestroId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(d => d.Producto)
                .WithMany(p => p.FacturaDetalles)
                .HasForeignKey(d => d.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Rol
        modelBuilder.Entity<Rol>(e =>
        {
            e.ToTable("Roles");
            e.HasKey(r => r.Id);
            e.Property(r => r.Nombre).HasMaxLength(50).IsRequired();
            e.HasIndex(r => r.Nombre).IsUnique();
        });

        // Usuario
        modelBuilder.Entity<Usuario>(e =>
        {
            e.ToTable("Usuarios");
            e.HasKey(u => u.Id);
            e.Property(u => u.Username).HasMaxLength(50).IsRequired();
            e.Property(u => u.Nombre).HasMaxLength(100).IsRequired();
            e.Property(u => u.Apellido).HasMaxLength(100).IsRequired();
            e.Property(u => u.Cedula).HasColumnType("char(10)");
            e.Property(u => u.Email).HasMaxLength(100).IsRequired();
            e.Property(u => u.RefreshToken).HasMaxLength(200);
            e.Property(u => u.RefreshTokenExpiryTime);
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email);
        });

        // MetodoPago
        modelBuilder.Entity<MetodoPago>(e =>
        {
            e.ToTable("MetodosPago");
            e.HasKey(m => m.Id);
            e.Property(m => m.Nombre).HasMaxLength(50).IsRequired();
        });

        // MovimientoStock
        modelBuilder.Entity<MovimientoStock>(e =>
        {
            e.ToTable("MovimientoStock");
            e.HasKey(ms => ms.Id);
            e.Property(ms => ms.TipoMovimiento).HasMaxLength(20).IsRequired();
            e.Property(ms => ms.Referencia).HasMaxLength(100);
            e.Property(ms => ms.StockAnterior).IsRequired();
            e.Property(ms => ms.StockNuevo).IsRequired();
        });

        // ErrorLog
        modelBuilder.Entity<ErrorLog>(e =>
        {
            e.ToTable("ErrorLog");
            e.HasKey(err => err.Id);
            e.Property(err => err.Pantalla).HasMaxLength(100);
            e.Property(err => err.Evento).HasMaxLength(100);
            e.Property(err => err.CreatedAt);
        });
    }
}
