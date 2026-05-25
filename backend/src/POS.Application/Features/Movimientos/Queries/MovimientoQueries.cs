using MediatR;
using POS.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace POS.Application.Features.Movimientos.Queries;

public record GetMovimientosQuery() : IRequest<IEnumerable<MovimientoStockDto>>;

public class MovimientoStockDto
{
    public int Id { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public decimal StockAnterior { get; set; }
    public decimal StockNuevo { get; set; }
    public string Referencia { get; set; } = string.Empty;
    public string VendedorNombre { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class GetMovimientosQueryHandler : IRequestHandler<GetMovimientosQuery, IEnumerable<MovimientoStockDto>>
{
    private readonly IUnitOfWork _uow;

    public GetMovimientosQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<MovimientoStockDto>> Handle(GetMovimientosQuery request, CancellationToken ct)
    {
        var logs = await _uow.MovimientosStock.GetAllWithDetailsAsync();
        // Nota: Para mejorar rendimiento en producción se debería incluir Producto y Usuario en el repositorio
        // Aquí lo ordenamos por fecha descendente
        return logs.OrderByDescending(x => x.Fecha).Select(x => new MovimientoStockDto
        {
            Id = x.Id,
            ProductoNombre = x.Producto?.Nombre ?? "N/A",
            Tipo = x.TipoMovimiento,
            Cantidad = x.Cantidad,
            StockAnterior = x.StockAnterior,
            StockNuevo = x.StockNuevo,
            Referencia = x.Referencia ?? "",
            VendedorNombre = x.Usuario?.Nombre ?? "Sistema",
            CreatedAt = x.Fecha
        });
    }
}
