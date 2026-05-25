using MediatR;
using POS.Application.DTOs;

namespace POS.Application.Features.Facturas.Commands;

public record GenerarFacturaCommand(
    int ClienteId,
    int MetodoPagoId,
    decimal PorcentajeIva,
    string? Observaciones,
    List<FacturaItemCommand> Items,
    int UsuarioId
) : IRequest<FacturaDto>;

public record FacturaItemCommand(int ProductoId, int Cantidad);

public record AnularFacturaCommand(int Id, int UsuarioId) : IRequest<FacturaDto>;
