namespace POS.Domain.Entities;

public class FacturaDetalle
{
    public int Id { get; set; }
    public int FacturaMaestroId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }

    // Navigation
    public FacturaMaestro FacturaMaestro { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
}
