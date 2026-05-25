using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Usuarios.Commands;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using BC = BCrypt.Net.BCrypt;

namespace POS.Application.Features.Usuarios.Handlers;

public class CreateUsuarioCommandHandler : IRequestHandler<CreateUsuarioCommand, UsuarioDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateUsuarioCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<UsuarioDto> Handle(CreateUsuarioCommand request, CancellationToken ct)
    {
        var usuario = new Usuario
        {
            Username = request.Username,
            PasswordHash = BC.HashPassword(request.Password),
            Nombre = request.Nombre,
            Apellido = request.Apellido,
            Cedula = request.Cedula,
            Email = request.Email,
            RoleId = request.RoleId,
            Activo = true
        };

        await _uow.Usuarios.AddAsync(usuario);
        await _uow.CommitAsync(ct);

        var result = await _uow.Usuarios.GetByUsernameAsync(usuario.Username);
        return _mapper.Map<UsuarioDto>(result!);
    }
}

public class UpdateUsuarioCommandHandler : IRequestHandler<UpdateUsuarioCommand, UsuarioDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateUsuarioCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<UsuarioDto> Handle(UpdateUsuarioCommand request, CancellationToken ct)
    {
        var usuario = await _uow.Usuarios.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException("Usuario no encontrado");

        usuario.Username = request.Username;
        usuario.Nombre = request.Nombre;
        usuario.Apellido = request.Apellido;
        usuario.Cedula = request.Cedula;
        usuario.Email = request.Email;
        usuario.RoleId = request.RoleId;
        usuario.Activo = request.Activo;
        usuario.Bloqueado = request.Bloqueado;

        if (usuario.Bloqueado == false) usuario.IntentosFallidos = 0;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            usuario.PasswordHash = BC.HashPassword(request.Password);
        }

        _uow.Usuarios.Update(usuario);
        await _uow.CommitAsync(ct);

        var result = await _uow.Usuarios.GetByUsernameAsync(usuario.Username);
        return _mapper.Map<UsuarioDto>(result!);
    }
}

public class ToggleBloqueoCommandHandler : IRequestHandler<ToggleBloqueoCommand, bool>
{
    private readonly IUnitOfWork _uow;

    public ToggleBloqueoCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<bool> Handle(ToggleBloqueoCommand request, CancellationToken ct)
    {
        var usuario = await _uow.Usuarios.GetByIdAsync(request.Id);
        if (usuario == null) return false;

        usuario.Bloqueado = !usuario.Bloqueado;
        if (!usuario.Bloqueado) usuario.IntentosFallidos = 0;

        _uow.Usuarios.Update(usuario);
        await _uow.CommitAsync(ct);
        return true;
    }
}
