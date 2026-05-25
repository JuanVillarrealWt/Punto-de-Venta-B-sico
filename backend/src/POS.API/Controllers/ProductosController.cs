using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Application.DTOs;
using POS.Application.Features.Productos.Commands;
using POS.Application.Features.Productos.Queries;
using System.Security.Claims;

namespace POS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Todo el controlador requiere autenticación
public class ProductosController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductosController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    // Accesible por Administrador y Vendedor (el vendedor necesita ver productos para facturar)
    public async Task<ActionResult<PagedResult<ProductoDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? searchBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
        => Ok(await _mediator.Send(new GetProductosQuery(search, searchBy, page, pageSize)));

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductoDto>> GetById(int id)
    {
        var result = await _mediator.Send(new GetProductoByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")] // Solo admin puede crear productos
    public async Task<ActionResult<ProductoDto>> Create([FromBody] CreateProductoCommand command)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(userIdStr, out int usuarioId);

        var commandWithUser = command with { UsuarioId = usuarioId > 0 ? usuarioId : null };
        var result = await _mediator.Send(commandWithUser);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")] // Solo admin puede actualizar productos
    public async Task<ActionResult<ProductoDto>> Update(int id, [FromBody] UpdateProductoCommand command)
    {
        if (id != command.Id) return BadRequest("El Id no coincide.");

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(userIdStr, out int usuarioId);

        var commandWithUser = command with { UsuarioId = usuarioId > 0 ? usuarioId : null };
        return Ok(await _mediator.Send(commandWithUser));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")] // Solo admin puede eliminar productos
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteProductoCommand(id));
        return result ? NoContent() : NotFound();
    }
}
