using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Facturas.Queries;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Facturas.Handlers;

public class GetFacturasQueryHandler : IRequestHandler<GetFacturasQuery, IEnumerable<FacturaDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetFacturasQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<IEnumerable<FacturaDto>> Handle(GetFacturasQuery request, CancellationToken ct)
    {
        var facturas = await _uow.Facturas.GetAllAsync(request.Desde, request.Hasta, request.SearchCliente, request.SearchBy);
        return _mapper.Map<IEnumerable<FacturaDto>>(facturas);
    }
}

public class GetFacturaByIdQueryHandler : IRequestHandler<GetFacturaByIdQuery, FacturaDto?>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetFacturaByIdQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<FacturaDto?> Handle(GetFacturaByIdQuery request, CancellationToken ct)
    {
        var factura = await _uow.Facturas.GetByIdAsync(request.Id);
        return factura is null ? null : _mapper.Map<FacturaDto>(factura);
    }
}
