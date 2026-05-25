namespace POS.Domain.Entities;

public class Producto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public int Stock { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public bool Activo { get; set; } = true;

    // Navigation
    public ICollection<FacturaDetalle> FacturaDetalles { get; set; } = new List<FacturaDetalle>();
}
