using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Productos.Queries;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Productos.Handlers;

public class GetProductosQueryHandler : IRequestHandler<GetProductosQuery, IEnumerable<ProductoDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetProductosQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductoDto>> Handle(GetProductosQuery request, CancellationToken ct)
    {
        var productos = await _uow.Productos.GetAllAsync(request.Search, request.SearchBy);
        return _mapper.Map<IEnumerable<ProductoDto>>(productos);
    }
}

public class GetProductoByIdQueryHandler : IRequestHandler<GetProductoByIdQuery, ProductoDto?>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetProductoByIdQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ProductoDto?> Handle(GetProductoByIdQuery request, CancellationToken ct)
    {
        var producto = await _uow.Productos.GetByIdAsync(request.Id);
        return producto is null ? null : _mapper.Map<ProductoDto>(producto);
    }
}
