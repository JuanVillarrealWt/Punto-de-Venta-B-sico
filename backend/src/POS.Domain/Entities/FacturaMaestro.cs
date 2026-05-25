namespace POS.Domain.Entities;

public class FacturaMaestro
{
    public int Id { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public int ClienteId { get; set; }
    public int UsuarioId { get; set; } // Vendedor
    public int MetodoPagoId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal PorcentajeIva { get; set; }
    public decimal MontoIva { get; set; }
    public decimal Total { get; set; }
    public string? Observaciones { get; set; }
    public string Estado { get; set; } = "CONFIRMADA"; // BORRADOR, CONFIRMADA, ANULADA

    // Navegación
    public Cliente? Cliente { get; set; }
    public Usuario? Usuario { get; set; }
    public MetodoPago? MetodoPago { get; set; }
    public ICollection<FacturaDetalle> Detalles { get; set; } = new List<FacturaDetalle>();
}
