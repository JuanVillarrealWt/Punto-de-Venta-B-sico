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

        if (exception is FluentValidation.ValidationException valEx)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            var errors = valEx.Errors.Select(e => e.ErrorMessage).ToList();
            var responseObj = new { error = string.Join(" ", errors) };
            await context.Response.WriteAsync(JsonSerializer.Serialize(responseObj));
            return;
        }

        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        // Log to Database using a fresh scope
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
