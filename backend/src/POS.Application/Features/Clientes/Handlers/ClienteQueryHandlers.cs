using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Clientes.Queries;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Clientes.Handlers;

public class GetClientesQueryHandler : IRequestHandler<GetClientesQuery, IEnumerable<ClienteDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetClientesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ClienteDto>> Handle(GetClientesQuery request, CancellationToken cancellationToken)
    {
        var clientes = await _unitOfWork.Clientes.GetAllAsync(request.Search, request.SearchBy);
        return _mapper.Map<IEnumerable<ClienteDto>>(clientes);
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
