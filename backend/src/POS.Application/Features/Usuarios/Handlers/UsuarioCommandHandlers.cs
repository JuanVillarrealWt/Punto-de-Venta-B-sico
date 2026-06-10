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

file static class UniquenessChecker
{
    public static async Task VerificarAsync(
        IUnitOfWork uow,
        string? cedula,
        string email,
        int? excludeUserId = null)
    {
        var cedulaNorm = string.IsNullOrWhiteSpace(cedula) ? null : cedula.Trim();
        if (!string.IsNullOrWhiteSpace(cedulaNorm))
        {
            if (await uow.Usuarios.ExisteCedulaAsync(cedulaNorm, excludeUserId))
                throw new InvalidOperationException("La cédula ya está registrada en usuarios.");

            if (await uow.Clientes.ExisteIdentificacionAsync(cedulaNorm, null))
                throw new InvalidOperationException("La cédula ya está registrada en clientes.");
        }

        var emailNorm = email.Trim().ToLower();
        if (await uow.Usuarios.ExisteEmailAsync(emailNorm, excludeUserId))
            throw new InvalidOperationException("El correo electrónico ya está registrado en usuarios.");

        if (await uow.Clientes.ExisteEmailAsync(emailNorm, null))
            throw new InvalidOperationException("El correo electrónico ya está registrado en clientes.");
    }
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

        await UniquenessChecker.VerificarAsync(_uow, request.Cedula, request.Email);

        var usuario = new Usuario
        {
            Username     = request.Username.Trim(),
            PasswordHash = BC.HashPassword(request.Password, 8),
            Nombre       = TextHelper.TitleCase(request.Nombre),
            Apellido     = TextHelper.TitleCase(request.Apellido),
            Cedula       = request.Cedula?.Trim(),
            Email        = request.Email.Trim().ToLower(),
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

        await UniquenessChecker.VerificarAsync(_uow, request.Cedula, request.Email, excludeUserId: request.Id);

        usuario.Username  = request.Username.Trim();
        usuario.Nombre    = TextHelper.TitleCase(request.Nombre);
        usuario.Apellido  = TextHelper.TitleCase(request.Apellido);
        usuario.Cedula    = request.Cedula?.Trim();
        usuario.Email     = request.Email.Trim().ToLower();
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

public class DeleteUsuarioCommandHandler : IRequestHandler<DeleteUsuarioCommand, bool>
{
    private readonly IUnitOfWork _uow;

    public DeleteUsuarioCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<bool> Handle(DeleteUsuarioCommand request, CancellationToken ct)
    {
        var usuario = await _uow.Usuarios.GetByIdAsync(request.Id);
        if (usuario == null) return false;

        if (string.Equals(usuario.Role?.Nombre, "Administrador", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("No se puede eliminar un usuario administrador.");

        usuario.Activo = false;
        usuario.Bloqueado = true;
        usuario.RefreshToken = null;
        usuario.RefreshTokenExpiryTime = null;
        _uow.Usuarios.Update(usuario);
        await _uow.CommitAsync(ct);
        return true;
    }
}
