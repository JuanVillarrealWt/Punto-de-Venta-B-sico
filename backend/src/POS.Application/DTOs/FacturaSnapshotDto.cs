using System;
using System.Collections.Generic;

namespace POS.Application.DTOs;

public class FacturaSnapshotDto
{
    public int Id { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public decimal Subtotal { get; set; }
    public decimal PorcentajeIva { get; set; }
    public decimal MontoIva { get; set; }
    public decimal Total { get; set; }
    public string? Observaciones { get; set; }
    public string Estado { get; set; } = "CONFIRMADA";

    // Cliente Snapshot
    public int ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string ClienteApellido { get; set; } = string.Empty;
    public string ClienteIdentificacion { get; set; } = string.Empty;
    public string? ClienteDireccion { get; set; }
    public string? ClienteTelefono { get; set; }
    public string? ClienteEmail { get; set; }

    // Vendedor Snapshot
    public int UsuarioId { get; set; }
    public string VendedorNombre { get; set; } = string.Empty;
    public string VendedorApellido { get; set; } = string.Empty;
    public string VendedorUsername { get; set; } = string.Empty;
    public string? VendedorEmail { get; set; }
    public string? VendedorCedula { get; set; }

    // MetodoPago Snapshot
    public int MetodoPagoId { get; set; }
    public string MetodoPagoNombre { get; set; } = string.Empty;

    // Detalles
    public List<FacturaDetalleSnapshotDto> Detalles { get; set; } = new();
}

public class FacturaDetalleSnapshotDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}
