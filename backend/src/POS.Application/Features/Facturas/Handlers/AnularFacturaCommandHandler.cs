using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Facturas.Commands;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Facturas.Handlers;

/// <summary>
/// Anula una factura de forma lógica y revierte el stock de todos sus productos.
/// </summary>
public class AnularFacturaCommandHandler : IRequestHandler<AnularFacturaCommand, FacturaDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public AnularFacturaCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<FacturaDto> Handle(AnularFacturaCommand request, CancellationToken ct)
    {
        // AnularAsync ya valida existencia, estado y revierte stock
        var factura = await _uow.Facturas.AnularAsync(request.Id)
            ?? throw new KeyNotFoundException($"Factura con Id {request.Id} no encontrada.");

        // Persistir todos los cambios (estado + stock) en una sola transacción
        await _uow.CommitAsync(ct);

        // Recargar con navegaciones para devolver el DTO completo
        var facturaCompleta = await _uow.Facturas.GetByIdAsync(factura.Id);
        return _mapper.Map<FacturaDto>(facturaCompleta!);
    }
}
