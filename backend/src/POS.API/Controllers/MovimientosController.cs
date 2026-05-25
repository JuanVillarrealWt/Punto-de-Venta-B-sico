using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace POS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Tanto admin como vendedor pueden ver auditoría? El PDF dice admin puede consultar todas las ventas.
public class MovimientosController : ControllerBase
{
    private readonly IMediator _mediator;

    public MovimientosController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var movimientos = await _mediator.Send(new POS.Application.Features.Movimientos.Queries.GetMovimientosQuery());
        return Ok(movimientos);
    }
}
