using MediatR;
using POS.Application.DTOs;

namespace POS.Application.Features.Clientes.Queries;

// --- GET ALL ---
public record GetClientesQuery(string? Search = null, string? SearchBy = null) : IRequest<IEnumerable<ClienteDto>>;

// --- GET BY ID ---
public record GetClienteByIdQuery(int Id) : IRequest<ClienteDto?>;
