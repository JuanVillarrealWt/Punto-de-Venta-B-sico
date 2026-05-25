using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Application.DTOs;
using POS.Application.Features.Clientes.Commands;
using POS.Application.Features.Clientes.Queries;

namespace POS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Todo el controlador requiere autenticación
public class ClientesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClientesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    // Accesible por Administrador y Vendedor (ambos necesitan buscar clientes)
    public async Task<ActionResult<PagedResult<ClienteDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? searchBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
        => Ok(await _mediator.Send(new GetClientesQuery(search, searchBy, page, pageSize)));

    [HttpGet("{id}")]
    public async Task<ActionResult<ClienteDto>> GetById(int id)
    {
        var result = await _mediator.Send(new GetClienteByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador,Vendedor")] // Vendedor puede crear clientes desde la caja
    public async Task<ActionResult<ClienteDto>> Create([FromBody] CreateClienteCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador,Vendedor")]
    public async Task<ActionResult<ClienteDto>> Update(int id, [FromBody] UpdateClienteCommand command)
    {
        if (id != command.Id) return BadRequest("El Id no coincide.");
        return Ok(await _mediator.Send(command));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")] // Solo admin puede eliminar
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteClienteCommand(id));
        return result ? NoContent() : NotFound();
    }
}
