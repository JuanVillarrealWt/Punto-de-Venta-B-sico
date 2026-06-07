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

    public string? SnapshotJson { get; set; }

    // Navegación
    public Cliente? Cliente { get; set; }
    public Usuario? Usuario { get; set; }
    public MetodoPago? MetodoPago { get; set; }
    public ICollection<FacturaDetalle> Detalles { get; private set; } = new List<FacturaDetalle>();

    public void AgregarDetalle(Producto producto, int cantidad)
    {
        if (cantidad <= 0) throw new InvalidOperationException("La cantidad debe ser mayor a 0.");
        
        var detalle = new FacturaDetalle
        {
            ProductoId = producto.Id,
            ProductoCodigo = producto.Codigo,
            ProductoNombre = producto.Nombre,
            Cantidad = cantidad,
            PrecioUnitario = producto.Precio,
            Subtotal = producto.Precio * cantidad
        };
        
        Detalles.Add(detalle);
    }

    public void CalcularTotales()
    {
        Subtotal = Detalles.Sum(d => d.Subtotal);
        MontoIva = Math.Round(Subtotal * (PorcentajeIva / 100m), 2);
        Total = Subtotal + MontoIva;
    }

    public void Anular()
    {
        if (Estado == "ANULADA")
            throw new InvalidOperationException("La factura ya se encuentra anulada.");
            
        Estado = "ANULADA";
    }
}
