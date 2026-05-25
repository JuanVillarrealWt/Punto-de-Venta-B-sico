using MediatR;
using POS.Application.DTOs;

namespace POS.Application.Features.Productos.Queries;

public record GetProductosQuery(
    string? Search = null,
    string? SearchBy = null,
    int Page = 1,
    int PageSize = 25
) : IRequest<PagedResult<ProductoDto>>;

public record GetProductoByIdQuery(int Id) : IRequest<ProductoDto?>;
