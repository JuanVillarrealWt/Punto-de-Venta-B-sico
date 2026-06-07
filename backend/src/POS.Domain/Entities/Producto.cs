namespace POS.Domain.Entities;

public class Producto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public int Stock { get; private set; }
    public DateTime FechaCreacion { get; private set; } = DateTime.UtcNow;
    public bool Activo { get; private set; } = true;

    // Navigation
    public ICollection<FacturaDetalle> FacturaDetalles { get; private set; } = new List<FacturaDetalle>();

    // Constructor vacío requerido por EF Core
    public Producto() { }

    public void ReducirStock(int cantidad)
    {
        if (cantidad <= 0) throw new InvalidOperationException("La cantidad a reducir debe ser mayor a cero.");
        if (Stock < cantidad) throw new InvalidOperationException($"Stock insuficiente para '{Nombre}'. Disponible: {Stock}, Solicitado: {cantidad}");
        
        Stock -= cantidad;
    }

    public void AumentarStock(int cantidad)
    {
        if (cantidad <= 0) throw new InvalidOperationException("La cantidad a aumentar debe ser mayor a cero.");
        Stock += cantidad;
    }

    public void EstablecerStock(int nuevoStock)
    {
        if (nuevoStock < 0) throw new InvalidOperationException("El stock no puede ser negativo.");
        Stock = nuevoStock;
    }

    public void Desactivar()
    {
        Activo = false;
    }

    public void Activar()
    {
        Activo = true;
    }
}
