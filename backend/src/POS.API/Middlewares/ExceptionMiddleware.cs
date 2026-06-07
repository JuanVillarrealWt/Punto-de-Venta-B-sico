using System.Net;
using System.Text.Json;
using System.Linq;
using POS.Domain.Entities;
using POS.Domain.Interfaces;

namespace POS.API.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IServiceProvider serviceProvider)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Uncaught exception occurred.");
            await HandleExceptionAsync(context, ex, serviceProvider);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, IServiceProvider serviceProvider)
    {
        context.Response.ContentType = "application/json";

        // ── Errores de validación FluentValidation → 400 con detalles ──────────
        if (exception is FluentValidation.ValidationException valEx)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            var errors = valEx.Errors.Select(e => e.ErrorMessage).ToList();
            var responseObj = new { error = string.Join(" ", errors) };
            await context.Response.WriteAsync(JsonSerializer.Serialize(responseObj));
            return;
        }

        // ── Errores de negocio esperados (duplicados, unicidad) → 400 ─────────
        // Estos son errores que el usuario puede corregir; no se registran en bitácora.
        if (exception is InvalidOperationException)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            var responseObj = new { error = exception.Message };
            await context.Response.WriteAsync(JsonSerializer.Serialize(responseObj));
            return;
        }

        // ── Errores de clave única en base de datos (SqlException) ────────────
        // Detectamos constraint de cédula/identificación duplicada incluso si SQL Server está en español.
        var innerMsg = exception.InnerException?.Message ?? string.Empty;
        if (exception is Microsoft.EntityFrameworkCore.DbUpdateException &&
            (innerMsg.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase) ||
             innerMsg.Contains("duplicate", StringComparison.OrdinalIgnoreCase) ||
             innerMsg.Contains("duplicada", StringComparison.OrdinalIgnoreCase) ||
             innerMsg.Contains("violation", StringComparison.OrdinalIgnoreCase) ||
             innerMsg.Contains("infracción", StringComparison.OrdinalIgnoreCase)))
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            string friendlyMsg = "Ya existe un registro con esos datos. Verifica e inténtalo de nuevo.";

            if (innerMsg.Contains("Identificacion", StringComparison.OrdinalIgnoreCase) ||
                innerMsg.Contains("cedula", StringComparison.OrdinalIgnoreCase) ||
                innerMsg.Contains("IX_Clientes_Identificacion", StringComparison.OrdinalIgnoreCase))
                friendlyMsg = "La cédula ingresada ya está registrada por otro cliente. Cámbiala e inténtalo de nuevo.";
            else if (innerMsg.Contains("email", StringComparison.OrdinalIgnoreCase) ||
                     innerMsg.Contains("Email", StringComparison.OrdinalIgnoreCase))
                friendlyMsg = "El correo electrónico ya está registrado. Usa otro correo e inténtalo de nuevo.";
            else if (innerMsg.Contains("Username", StringComparison.OrdinalIgnoreCase) ||
                     innerMsg.Contains("username", StringComparison.OrdinalIgnoreCase))
                friendlyMsg = "El nombre de usuario ya está en uso. Elige un username diferente e inténtalo de nuevo.";
            else if (innerMsg.Contains("Codigo", StringComparison.OrdinalIgnoreCase) ||
                     innerMsg.Contains("codigo", StringComparison.OrdinalIgnoreCase))
                friendlyMsg = "El código de barras ya está registrado en otro producto. Usa un código diferente.";

            var responseObj = new { error = friendlyMsg, isWarning = true };
            await context.Response.WriteAsync(JsonSerializer.Serialize(responseObj));
            return;
        }

        // ── Error inesperado → 500 + registro en bitácora ────────────────────
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        using (var scope = serviceProvider.CreateScope())
        {
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            
            int? userId = null;
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var userIdStr = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdStr, out int parsedId))
                {
                    userId = parsedId;
                }
            }

            var errorLog = new ErrorLog
            {
                Message = exception.Message,
                ExceptionType = exception.GetType().Name,
                StackTrace = exception.StackTrace,
                Source = exception.Source,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            await uow.ErrorLogs.AddAsync(errorLog);
            await uow.CommitAsync();
        }

        var response = new { error = "Ocurrió un error interno en el servidor. El administrador ha sido notificado." };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
