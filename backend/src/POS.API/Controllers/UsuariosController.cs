using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Application.Features.Usuarios.Commands;
using POS.Application.Features.Usuarios.Queries;

namespace POS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class UsuariosController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsuariosController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _mediator.Send(new GetUsuariosQuery());
        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUsuarioCommand command)
    {
        var user = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUsuarioCommand command)
    {
        if (id != command.Id) return BadRequest();
        var user = await _mediator.Send(command);
        return Ok(user);
    }

    [HttpPost("{id}/toggle-bloqueo")]
    public async Task<IActionResult> ToggleBloqueo(int id)
    {
        var result = await _mediator.Send(new ToggleBloqueoCommand(id));
        return result ? Ok() : NotFound();
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _mediator.Send(new GetRolesQuery());
        return Ok(roles);
    }
}
