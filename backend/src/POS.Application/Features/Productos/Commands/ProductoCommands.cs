using MediatR;
using POS.Application.DTOs;

namespace POS.Application.Features.Productos.Commands;

public record CreateProductoCommand(
    string Codigo,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int Stock
) : IRequest<ProductoDto>;

public record UpdateProductoCommand(
    int Id,
    string Codigo,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int Stock
) : IRequest<ProductoDto>;

public record DeleteProductoCommand(int Id) : IRequest<bool>;
