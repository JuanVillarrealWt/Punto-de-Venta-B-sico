using MediatR;
using System.Text.Json;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using POS.Application.DTOs;
using POS.Application.Features.Facturas.Queries;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Facturas.Handlers;

public class GetFacturaReconstruidaQueryHandler : IRequestHandler<GetFacturaReconstruidaQuery, FacturaSnapshotDto?>
{
    private readonly IUnitOfWork _uow;

    public GetFacturaReconstruidaQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<FacturaSnapshotDto?> Handle(GetFacturaReconstruidaQuery request, CancellationToken ct)
    {
        var factura = await _uow.Facturas.GetByNumeroAsync(request.NumeroFactura);
        if (factura == null) return null;

        // Si tiene el snapshot histórico, lo deserializamos y lo retornamos directamente
        if (!string.IsNullOrWhiteSpace(factura.SnapshotJson))
        {
            try
            {
                var snapshot = JsonSerializer.Deserialize<FacturaSnapshotDto>(factura.SnapshotJson);
                if (snapshot != null)
                {
                    // Asegurar que el id de base de datos actual sea asignado
                    snapshot.Id = factura.Id;
                    return snapshot;
                }
            }
            catch
            {
                // Si falla por alguna razón la deserialización, caemos en la reconstrucción dinámica
            }
        }

        // Reconstrucción dinámica como plan de contingencia / soporte heredado
        var fallback = new FacturaSnapshotDto
        {
            Id = factura.Id,
            NumeroFactura = factura.NumeroFactura,
            Fecha = factura.Fecha,
            Subtotal = factura.Subtotal,
            PorcentajeIva = factura.PorcentajeIva,
            MontoIva = factura.MontoIva,
            Total = factura.Total,
            Observaciones = factura.Observaciones,
            Estado = factura.Estado,

            ClienteId = factura.ClienteId,
            ClienteNombre = factura.Cliente?.Nombre ?? "CONSUMIDOR",
            ClienteApellido = factura.Cliente?.Apellido ?? "FINAL",
            ClienteIdentificacion = factura.Cliente?.Identificacion ?? "",
            ClienteDireccion = factura.Cliente?.Direccion,
            ClienteTelefono = factura.Cliente?.Telefono,
            ClienteEmail = factura.Cliente?.Email,

            UsuarioId = factura.UsuarioId,
            VendedorNombre = factura.Usuario?.Nombre ?? "SISTEMA",
            VendedorApellido = factura.Usuario?.Apellido ?? "",
            VendedorUsername = factura.Usuario?.Username ?? "sistema",
            VendedorEmail = factura.Usuario?.Email,
            VendedorCedula = factura.Usuario?.Cedula,

            MetodoPagoId = factura.MetodoPagoId,
            MetodoPagoNombre = factura.MetodoPago?.Nombre ?? "EFECTIVO",

            Detalles = factura.Detalles.Select(d => new FacturaDetalleSnapshotDto
            {
                Id = d.Id,
                ProductoId = d.ProductoId,
                ProductoCodigo = d.ProductoCodigo,
                ProductoNombre = d.ProductoNombre,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                Subtotal = d.Subtotal
            }).ToList()
        };

        return fallback;
    }
}
