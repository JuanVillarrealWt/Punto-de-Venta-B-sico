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
            e.Property(f => f.Estado).HasMaxLength(10).IsRequired().HasDefaultValue("ACTIVA");
            e.HasIndex(f => f.NumeroFactura).IsUnique();

            e.HasOne(f => f.Cliente)
                .WithMany(c => c.Facturas)
                .HasForeignKey(f => f.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // FacturaDetalle
        modelBuilder.Entity<FacturaDetalle>(e =>
        {
            e.ToTable("FacturaDetalle");
            e.HasKey(d => d.Id);
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
    }
}
