using MediatR;
using POS.Application.DTOs;

namespace POS.Application.Features.Facturas.Commands;

public record GenerarFacturaCommand(
    int ClienteId,
    decimal PorcentajeIva,
    string? Observaciones,
    List<FacturaItemCommand> Items
) : IRequest<FacturaDto>;

public record FacturaItemCommand(int ProductoId, int Cantidad);

public record AnularFacturaCommand(int Id) : IRequest<FacturaDto>;
