using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Usuarios.Commands;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using System.Globalization;
using BC = BCrypt.Net.BCrypt;

namespace POS.Application.Features.Usuarios.Handlers;

/// <summary>Formatea nombre y apellido con TitleCase sin espacios.</summary>
file static class TextHelper
{
    private static readonly TextInfo Ti = new CultureInfo("es-EC").TextInfo;
    public static string TitleCase(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : Ti.ToTitleCase(value.Trim().Replace(" ", "").ToLower());
}

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
        // Verificar unicidad de username
        if (await _uow.Usuarios.ExisteUsernameAsync(request.Username))
            throw new InvalidOperationException("El nombre de usuario ya está en uso.");

        // Verificar unicidad cruzada de email (usuarios + clientes)
        var emailNorm = request.Email.Trim().ToLower();
        if (await _uow.Usuarios.ExisteEmailAsync(emailNorm))
            throw new InvalidOperationException("El correo electrónico ya está registrado en usuarios.");

        var usuario = new Usuario
        {
            Username     = request.Username.Trim(),
            PasswordHash = BC.HashPassword(request.Password, 8),
            Nombre       = TextHelper.TitleCase(request.Nombre),
            Apellido     = TextHelper.TitleCase(request.Apellido),
            Cedula       = request.Cedula,
            Email        = emailNorm,
            RoleId       = request.RoleId,
            Activo       = true
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

        // Verificar unicidad de username excluyendo al propio usuario
        if (await _uow.Usuarios.ExisteUsernameAsync(request.Username, excludeId: request.Id))
            throw new InvalidOperationException("El nombre de usuario ya está en uso.");

        // Verificar unicidad cruzada de email excluyendo al propio usuario
        var emailNorm = request.Email.Trim().ToLower();
        if (await _uow.Usuarios.ExisteEmailAsync(emailNorm, excludeId: request.Id))
            throw new InvalidOperationException("El correo electrónico ya está registrado en usuarios.");

        usuario.Username  = request.Username.Trim();
        usuario.Nombre    = TextHelper.TitleCase(request.Nombre);
        usuario.Apellido  = TextHelper.TitleCase(request.Apellido);
        usuario.Cedula    = request.Cedula;
        usuario.Email     = emailNorm;
        usuario.RoleId    = request.RoleId;
        usuario.Activo    = request.Activo;
        usuario.Bloqueado = request.Bloqueado;

        if (usuario.Bloqueado == false) usuario.IntentosFallidos = 0;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            usuario.PasswordHash = BC.HashPassword(request.Password, 8);
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
