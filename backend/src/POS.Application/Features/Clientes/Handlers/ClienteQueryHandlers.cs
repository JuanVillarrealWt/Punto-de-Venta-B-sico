using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Clientes.Queries;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Clientes.Handlers;

public class GetClientesQueryHandler : IRequestHandler<GetClientesQuery, PagedResult<ClienteDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetClientesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<ClienteDto>> Handle(GetClientesQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Clientes.GetAllAsync(
            request.Search,
            request.SearchBy,
            request.Page,
            request.PageSize);

        return new PagedResult<ClienteDto>
        {
            Items = _mapper.Map<IEnumerable<ClienteDto>>(items),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}

public class GetClienteByIdQueryHandler : IRequestHandler<GetClienteByIdQuery, ClienteDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetClienteByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ClienteDto?> Handle(GetClienteByIdQuery request, CancellationToken cancellationToken)
    {
        var cliente = await _unitOfWork.Clientes.GetByIdAsync(request.Id);
        return cliente is null ? null : _mapper.Map<ClienteDto>(cliente);
    }
}
