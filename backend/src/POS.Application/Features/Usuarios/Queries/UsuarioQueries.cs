using MediatR;
using POS.Application.DTOs;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Usuarios.Queries;

public record GetUsuariosQuery() : IRequest<IEnumerable<UsuarioDto>>;
public record GetRolesQuery() : IRequest<IEnumerable<RolDto>>;

public class UsuarioQueryHandlers : 
    IRequestHandler<GetUsuariosQuery, IEnumerable<UsuarioDto>>,
    IRequestHandler<GetRolesQuery, IEnumerable<RolDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly AutoMapper.IMapper _mapper;

    public UsuarioQueryHandlers(IUnitOfWork uow, AutoMapper.IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UsuarioDto>> Handle(GetUsuariosQuery request, CancellationToken ct)
    {
        var users = await _uow.Usuarios.GetAllWithRolesAsync();
        return _mapper.Map<IEnumerable<UsuarioDto>>(users);
    }

    public async Task<IEnumerable<RolDto>> Handle(GetRolesQuery request, CancellationToken ct)
    {
        var roles = await _uow.Roles.GetAllAsync();
        return _mapper.Map<IEnumerable<RolDto>>(roles);
    }
}
