using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Clientes.Commands;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using System.Globalization;

namespace POS.Application.Features.Clientes.Handlers;

file static class TextHelper
{
    private static readonly TextInfo Ti = new CultureInfo("es-EC").TextInfo;

    public static string RemoveSpaces(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Replace(" ", "");

    public static string TitleCase(string? value) =>
        Ti.ToTitleCase(RemoveSpaces(value).ToLower());
}

file static class UniquenessChecker
{
    public static async Task VerificarAsync(
        IUnitOfWork uow,
        string? identificacion,
        string? telefono,
        string? email,
        int? excludeClienteId = null)
    {
        var idNorm = string.IsNullOrWhiteSpace(identificacion) ? null : identificacion.Trim();
        if (!string.IsNullOrWhiteSpace(idNorm))
        {
            if (await uow.Clientes.ExisteIdentificacionAsync(idNorm, excludeClienteId))
                throw new InvalidOperationException("La cédula ya está registrada en clientes.");

            if (await uow.Usuarios.ExisteCedulaAsync(idNorm, null))
                throw new InvalidOperationException("La cédula ya está registrada en usuarios.");
        }

        var telefonoNorm = string.IsNullOrWhiteSpace(telefono) ? null : telefono.Trim();
        if (!string.IsNullOrWhiteSpace(telefonoNorm))
        {
            if (await uow.Clientes.ExisteTelefonoAsync(telefonoNorm, excludeClienteId))
                throw new InvalidOperationException("El teléfono ya está registrado en clientes.");
        }

        if (string.IsNullOrWhiteSpace(email)) return;

        var emailNorm = email.Trim().ToLower();
        if (await uow.Clientes.ExisteEmailAsync(emailNorm, excludeClienteId))
            throw new InvalidOperationException("El correo electrónico ya está registrado en clientes.");

        if (await uow.Usuarios.ExisteEmailAsync(emailNorm, null))
            throw new InvalidOperationException("El correo electrónico ya está registrado en usuarios.");
    }
}

public class CreateClienteCommandHandler : IRequestHandler<CreateClienteCommand, ClienteDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateClienteCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ClienteDto> Handle(CreateClienteCommand request, CancellationToken ct)
    {
        await UniquenessChecker.VerificarAsync(_uow, request.Identificacion, request.Telefono, request.Email);

        var cliente = new Cliente
        {
            Identificacion = TextHelper.RemoveSpaces(request.Identificacion),
            Nombre = TextHelper.TitleCase(request.Nombre),
            Apellido = TextHelper.TitleCase(request.Apellido),
            Direccion = string.IsNullOrWhiteSpace(request.Direccion) ? null : request.Direccion.Trim(),
            Telefono = string.IsNullOrWhiteSpace(request.Telefono) ? null : TextHelper.RemoveSpaces(request.Telefono),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : TextHelper.RemoveSpaces(request.Email).ToLower()
        };

        await _uow.Clientes.AddAsync(cliente);
        await _uow.CommitAsync(ct);
        return _mapper.Map<ClienteDto>(cliente);
    }
}

public class UpdateClienteCommandHandler : IRequestHandler<UpdateClienteCommand, ClienteDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateClienteCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ClienteDto> Handle(UpdateClienteCommand request, CancellationToken ct)
    {
        var cliente = await _uow.Clientes.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Cliente con Id {request.Id} no encontrado.");

        await UniquenessChecker.VerificarAsync(_uow, request.Identificacion, request.Telefono, request.Email, excludeClienteId: request.Id);

        cliente.Identificacion = TextHelper.RemoveSpaces(request.Identificacion);
        cliente.Nombre = TextHelper.TitleCase(request.Nombre);
        cliente.Apellido = TextHelper.TitleCase(request.Apellido);
        cliente.Direccion = string.IsNullOrWhiteSpace(request.Direccion) ? null : request.Direccion.Trim();
        cliente.Telefono = string.IsNullOrWhiteSpace(request.Telefono) ? null : TextHelper.RemoveSpaces(request.Telefono);
        cliente.Email = string.IsNullOrWhiteSpace(request.Email) ? null : TextHelper.RemoveSpaces(request.Email).ToLower();

        _uow.Clientes.Update(cliente);
        await _uow.CommitAsync(ct);
        return _mapper.Map<ClienteDto>(cliente);
    }
}

public class DeleteClienteCommandHandler : IRequestHandler<DeleteClienteCommand, bool>
{
    private readonly IUnitOfWork _uow;

    public DeleteClienteCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<bool> Handle(DeleteClienteCommand request, CancellationToken ct)
    {
        var cliente = await _uow.Clientes.GetByIdAsync(request.Id);
        if (cliente is null) return false;

        bool hasHistory = await _uow.Clientes.HasHistoryAsync(request.Id);

        if (hasHistory)
        {
            cliente.Activo = false;
            _uow.Clientes.Update(cliente);
        }
        else
        {
            _uow.Clientes.Delete(cliente);
        }

        await _uow.CommitAsync(ct);
        return true;
    }
}
