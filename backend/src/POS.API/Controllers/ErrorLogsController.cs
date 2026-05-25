using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Application.Features.ErrorLogs.Queries;

namespace POS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // Solo el admin puede ver logs
public class ErrorLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ErrorLogsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _mediator.Send(new GetErrorLogsQuery());
        return Ok(logs);
    }
}
