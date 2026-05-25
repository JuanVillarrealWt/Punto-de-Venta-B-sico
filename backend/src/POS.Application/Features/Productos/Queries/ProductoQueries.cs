using MediatR;
using POS.Application.DTOs;

namespace POS.Application.Features.Productos.Queries;

public record GetProductosQuery(string? Search = null, string? SearchBy = null) : IRequest<IEnumerable<ProductoDto>>;
public record GetProductoByIdQuery(int Id) : IRequest<ProductoDto?>;
