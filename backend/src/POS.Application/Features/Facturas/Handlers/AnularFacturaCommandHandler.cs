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
        // 1. Obtener factura con detalles
        var factura = await _uow.Facturas.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Factura con Id {request.Id} no encontrada.");

        // 2. Anular lógicamente delegando en el dominio
        factura.Anular();

        // 3. Revertir stock y registrar movimientos
        foreach (var detalle in factura.Detalles)
        {
            var producto = await _uow.Productos.GetByIdAsync(detalle.ProductoId);
            if (producto != null)
            {
                int stockAnterior = producto.Stock;
                
                // Lógica de Dominio
                producto.AumentarStock(detalle.Cantidad);
                
                int stockNuevo = producto.Stock;

                _uow.Productos.Update(producto);

                // Registrar Movimiento de Stock (ENTRADA por anulación)
                await _uow.MovimientosStock.AddAsync(new POS.Domain.Entities.MovimientoStock
                {
                    ProductoId = producto.Id,
                    TipoMovimiento = "ENTRADA",
                    Cantidad = detalle.Cantidad,
                    StockAnterior = stockAnterior,
                    StockNuevo = stockNuevo,
                    Referencia = $"Anulación Factura #{factura.NumeroFactura}",
                    Fecha = DateTime.UtcNow,
                    UsuarioId = request.UsuarioId
                });
            }
        }

        // 4. Persistir todos los cambios
        await _uow.CommitAsync(ct);

        return _mapper.Map<FacturaDto>(factura);
    }
}
