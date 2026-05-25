using MediatR;
using Microsoft.AspNetCore.Mvc;
using POS.Application.DTOs;
using POS.Application.Features.Productos.Commands;
using POS.Application.Features.Productos.Queries;

namespace POS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductosController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductoDto>>> GetAll([FromQuery] string? search, [FromQuery] string? searchBy)
        => Ok(await _mediator.Send(new GetProductosQuery(search, searchBy)));

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductoDto>> GetById(int id)
    {
        var result = await _mediator.Send(new GetProductoByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ProductoDto>> Create([FromBody] CreateProductoCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductoDto>> Update(int id, [FromBody] UpdateProductoCommand command)
    {
        if (id != command.Id) return BadRequest("El Id no coincide.");
        return Ok(await _mediator.Send(command));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteProductoCommand(id));
        return result ? NoContent() : NotFound();
    }
}
