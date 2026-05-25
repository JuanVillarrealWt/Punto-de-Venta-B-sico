using MediatR;
using Microsoft.AspNetCore.Mvc;
using POS.Application.DTOs;
using POS.Application.Features.Clientes.Commands;
using POS.Application.Features.Clientes.Queries;

namespace POS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClientesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClienteDto>>> GetAll([FromQuery] string? search, [FromQuery] string? searchBy)
        => Ok(await _mediator.Send(new GetClientesQuery(search, searchBy)));

    [HttpGet("{id}")]
    public async Task<ActionResult<ClienteDto>> GetById(int id)
    {
        var result = await _mediator.Send(new GetClienteByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> Create([FromBody] CreateClienteCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ClienteDto>> Update(int id, [FromBody] UpdateClienteCommand command)
    {
        if (id != command.Id) return BadRequest("El Id no coincide.");
        return Ok(await _mediator.Send(command));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteClienteCommand(id));
        return result ? NoContent() : NotFound();
    }
}
