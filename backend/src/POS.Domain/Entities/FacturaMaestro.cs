namespace POS.Domain.Entities;

public class FacturaMaestro
{
    public int Id { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public int ClienteId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal PorcentajeIva { get; set; }
    public decimal MontoIva { get; set; }
    public decimal Total { get; set; }
    public string? Observaciones { get; set; }
    public string Estado { get; set; } = "ACTIVA"; // ACTIVA | ANULADA

    // Navigation
    public Cliente Cliente { get; set; } = null!;
    public ICollection<FacturaDetalle> Detalles { get; set; } = new List<FacturaDetalle>();
}
