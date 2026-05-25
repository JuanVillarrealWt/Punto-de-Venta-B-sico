using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Productos.Commands;
using POS.Domain.Entities;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Productos.Handlers;

public class CreateProductoCommandHandler : IRequestHandler<CreateProductoCommand, ProductoDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateProductoCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ProductoDto> Handle(CreateProductoCommand request, CancellationToken ct)
    {
        var producto = new Producto
        {
            Codigo = request.Codigo,
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            Precio = request.Precio,
            Stock = request.Stock
        };
        await _uow.Productos.AddAsync(producto);
        await _uow.CommitAsync(ct);
        return _mapper.Map<ProductoDto>(producto);
    }
}

public class UpdateProductoCommandHandler : IRequestHandler<UpdateProductoCommand, ProductoDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateProductoCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ProductoDto> Handle(UpdateProductoCommand request, CancellationToken ct)
    {
        var producto = await _uow.Productos.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Producto con Id {request.Id} no encontrado.");

        producto.Codigo = request.Codigo;
        producto.Nombre = request.Nombre;
        producto.Descripcion = request.Descripcion;
        producto.Precio = request.Precio;
        producto.Stock = request.Stock;

        _uow.Productos.Update(producto);
        await _uow.CommitAsync(ct);
        return _mapper.Map<ProductoDto>(producto);
    }
}

public class DeleteProductoCommandHandler : IRequestHandler<DeleteProductoCommand, bool>
{
    private readonly IUnitOfWork _uow;

    public DeleteProductoCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<bool> Handle(DeleteProductoCommand request, CancellationToken ct)
    {
        var producto = await _uow.Productos.GetByIdAsync(request.Id);
        if (producto is null) return false;
        _uow.Productos.Delete(producto);
        await _uow.CommitAsync(ct);
        return true;
    }
}
