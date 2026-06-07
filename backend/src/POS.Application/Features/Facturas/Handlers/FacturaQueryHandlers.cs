using AutoMapper;
using MediatR;
using System.Linq;
using System.Text.Json;
using POS.Application.DTOs;
using POS.Application.Features.Facturas.Queries;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Facturas.Handlers;

public class GetFacturasQueryHandler : IRequestHandler<GetFacturasQuery, IEnumerable<FacturaDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetFacturasQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<IEnumerable<FacturaDto>> Handle(GetFacturasQuery request, CancellationToken ct)
    {
        var facturas = await _uow.Facturas.GetAllAsync(request.Desde, request.Hasta, request.SearchCliente, request.SearchBy, request.UsuarioId);
        var dtos = _mapper.Map<IEnumerable<FacturaDto>>(facturas).ToList();
        
        var facturaDict = facturas.ToDictionary(f => f.Id);
        foreach (var dto in dtos)
        {
            if (facturaDict.TryGetValue(dto.Id, out var entity))
            {
                FacturaQueryHelper.EnforceSnapshot(dto, entity.SnapshotJson);
            }
        }
        return dtos;
    }
}

public class GetFacturaByIdQueryHandler : IRequestHandler<GetFacturaByIdQuery, FacturaDto?>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetFacturaByIdQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<FacturaDto?> Handle(GetFacturaByIdQuery request, CancellationToken ct)
    {
        var factura = await _uow.Facturas.GetByIdAsync(request.Id);
        if (factura is null) return null;
        
        var dto = _mapper.Map<FacturaDto>(factura);
        FacturaQueryHelper.EnforceSnapshot(dto, factura.SnapshotJson);
        return dto;
    }
}

public static class FacturaQueryHelper
{
    public static void EnforceSnapshot(FacturaDto dto, string? snapshotJson)
    {
        if (string.IsNullOrWhiteSpace(snapshotJson)) return;
        try
        {
            var snapshot = JsonSerializer.Deserialize<FacturaSnapshotDto>(snapshotJson);
            if (snapshot != null)
            {
                dto.ClienteNombre = $"{snapshot.ClienteNombre} {snapshot.ClienteApellido}".Trim();
                dto.ClienteIdentificacion = snapshot.ClienteIdentificacion;
                dto.VendedorNombre = $"{snapshot.VendedorNombre} {snapshot.VendedorApellido}".Trim();
                dto.MetodoPagoNombre = snapshot.MetodoPagoNombre;
                dto.Subtotal = snapshot.Subtotal;
                dto.PorcentajeIva = snapshot.PorcentajeIva;
                dto.MontoIva = snapshot.MontoIva;
                dto.Total = snapshot.Total;
                // DO NOT overwrite Estado or Observaciones from snapshot
                // dto.Estado = snapshot.Estado;
                // dto.Observaciones = snapshot.Observaciones;
                if (snapshot.Detalles != null && snapshot.Detalles.Any())
                {
                    dto.Detalles = snapshot.Detalles.Select(d => new FacturaDetalleDto
                    {
                        Id = d.Id,
                        ProductoId = d.ProductoId,
                        ProductoCodigo = d.ProductoCodigo,
                        ProductoNombre = d.ProductoNombre,
                        Cantidad = d.Cantidad,
                        PrecioUnitario = d.PrecioUnitario,
                        Subtotal = d.Subtotal
                    }).ToList();
                }
            }
        }
        catch { }
    }
}
