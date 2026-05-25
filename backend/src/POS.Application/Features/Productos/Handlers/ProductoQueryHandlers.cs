using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Productos.Queries;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Productos.Handlers;

public class GetProductosQueryHandler : IRequestHandler<GetProductosQuery, PagedResult<ProductoDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetProductosQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<PagedResult<ProductoDto>> Handle(GetProductosQuery request, CancellationToken ct)
    {
        var (items, totalCount) = await _uow.Productos.GetAllAsync(
            request.Search,
            request.SearchBy,
            request.Page,
            request.PageSize);

        return new PagedResult<ProductoDto>
        {
            Items = _mapper.Map<IEnumerable<ProductoDto>>(items),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
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
