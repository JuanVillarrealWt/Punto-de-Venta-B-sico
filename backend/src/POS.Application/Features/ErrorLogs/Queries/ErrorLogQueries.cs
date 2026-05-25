using MediatR;
using POS.Application.DTOs;
using POS.Domain.Interfaces;

namespace POS.Application.Features.ErrorLogs.Queries;

public record GetErrorLogsQuery() : IRequest<IEnumerable<ErrorLogDto>>;

public class ErrorLogDto
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ExceptionType { get; set; }
    public string? StackTrace { get; set; }
    public string? Source { get; set; }
    public string? Pantalla { get; set; }
    public string? Evento { get; set; }
    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetErrorLogsQueryHandler : IRequestHandler<GetErrorLogsQuery, IEnumerable<ErrorLogDto>>
{
    private readonly IUnitOfWork _uow;

    public GetErrorLogsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<ErrorLogDto>> Handle(GetErrorLogsQuery request, CancellationToken ct)
    {
        var logs = await _uow.ErrorLogs.GetAllAsync();
        return logs.OrderByDescending(x => x.CreatedAt).Select(x => new ErrorLogDto
        {
            Id = x.Id,
            Message = x.Message,
            ExceptionType = x.ExceptionType,
            StackTrace = x.StackTrace,
            Source = x.Source,
            Pantalla = x.Pantalla,
            Evento = x.Evento,
            UserId = x.UserId,
            CreatedAt = x.CreatedAt
        });
    }
}
