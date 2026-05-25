using MediatR;
using POS.Application.DTOs;

namespace POS.Application.Features.Facturas.Queries;

public record GetFacturasQuery(DateTime? Desde = null, DateTime? Hasta = null, string? SearchCliente = null, string? SearchBy = null) : IRequest<IEnumerable<FacturaDto>>;
public record GetFacturaByIdQuery(int Id) : IRequest<FacturaDto?>;
public record GenerarPdfFacturaQuery(int FacturaId) : IRequest<byte[]>;
