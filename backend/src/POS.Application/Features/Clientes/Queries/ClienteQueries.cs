using MediatR;
using POS.Application.DTOs;

namespace POS.Application.Features.Clientes.Queries;

// --- GET ALL (paginado) ---
public record GetClientesQuery(
    string? Search = null,
    string? SearchBy = null,
    int Page = 1,
    int PageSize = 25
) : IRequest<PagedResult<ClienteDto>>;

// --- GET BY ID ---
public record GetClienteByIdQuery(int Id) : IRequest<ClienteDto?>;
