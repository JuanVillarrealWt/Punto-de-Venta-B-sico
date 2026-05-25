namespace POS.Application.DTOs;

public class FacturaDto
{
    public int Id { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public int ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string ClienteIdentificacion { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal PorcentajeIva { get; set; }
    public decimal MontoIva { get; set; }
    public decimal Total { get; set; }
    public string? Observaciones { get; set; }
    public string Estado { get; set; } = "ACTIVA";
    public List<FacturaDetalleDto> Detalles { get; set; } = new();
}

public class FacturaDetalleDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public class CrearFacturaRequest
{
    public int ClienteId { get; set; }
    public decimal PorcentajeIva { get; set; } = 15;
    public string? Observaciones { get; set; }
    public List<CrearFacturaItemRequest> Items { get; set; } = new();
}

public class CrearFacturaItemRequest
{
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
}
