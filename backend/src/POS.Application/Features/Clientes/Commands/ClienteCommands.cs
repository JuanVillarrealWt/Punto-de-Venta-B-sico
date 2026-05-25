using MediatR;
using POS.Application.DTOs;

namespace POS.Application.Features.Clientes.Commands;

// --- CREATE ---
public record CreateClienteCommand(
    string Identificacion,
    string Nombre,
    string Apellido,
    string? Direccion,
    string? Telefono,
    string? Email
) : IRequest<ClienteDto>;

// --- UPDATE ---
public record UpdateClienteCommand(
    int Id,
    string Identificacion,
    string Nombre,
    string Apellido,
    string? Direccion,
    string? Telefono,
    string? Email
) : IRequest<ClienteDto>;

// --- DELETE ---
public record DeleteClienteCommand(int Id) : IRequest<bool>;
