using MediatR;
using Microsoft.AspNetCore.Mvc;
using POS.Application.DTOs;
using POS.Application.Features.Facturas.Commands;
using POS.Application.Features.Facturas.Queries;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
namespace POS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FacturasController : ControllerBase
{
    private readonly IMediator _mediator;

    public FacturasController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FacturaDto>>> GetAll(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] string? search,
        [FromQuery] string? searchBy)
    {
        var isAdmin = User.IsInRole("Administrador");
        int? filterUsuarioId = null;
        if (!isAdmin)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdStr, out int uId))
            {
                filterUsuarioId = uId;
            }
        }
        return Ok(await _mediator.Send(new GetFacturasQuery(desde, hasta, search, searchBy, filterUsuarioId)));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FacturaDto>> GetById(int id)
    {
        var result = await _mediator.Send(new GetFacturaByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<FacturaDto>> Generar([FromBody] CrearFacturaRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(userIdStr, out int usuarioId);

        var command = new GenerarFacturaCommand(
            request.ClienteId,
            request.MetodoPagoId == 0 ? 1 : request.MetodoPagoId,
            request.PorcentajeIva,
            request.Observaciones,
            request.Items.Select(i => new FacturaItemCommand(i.ProductoId, i.Cantidad)).ToList(),
            usuarioId > 0 ? usuarioId : 1
        );

        try
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<FacturaDto>> Anular(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(userIdStr, out int usuarioId);

        try
        {
            var result = await _mediator.Send(new AnularFacturaCommand(id, usuarioId > 0 ? usuarioId : 1));
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> DescargarPdf(int id)
    {
        try
        {
            var pdfBytes = await _mediator.Send(new GenerarPdfFacturaQuery(id));
            return File(pdfBytes, "application/pdf", $"Factura_{id}.pdf");
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
