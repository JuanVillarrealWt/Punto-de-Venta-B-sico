namespace POS.Domain.Entities;

public class ErrorLog
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ExceptionType { get; set; }
    public string? StackTrace { get; set; }
    public string? Source { get; set; }
    public string? Pantalla { get; set; }
    public string? Evento { get; set; }
    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
