using POS.Application;
using POS.Infrastructure;
using FluentValidation;
using QuestPDF.Infrastructure;
using Microsoft.EntityFrameworkCore;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// Clean Architecture DI
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configuración de JWT
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKeyQueDebeSerMasLargaParaProduccion123!";
var key = System.Text.Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key)
    };
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "POS API", Version = "v1" });
});

// CORS para React (Vite en localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger en development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Middleware de registro de errores en BD
app.UseMiddleware<POS.API.Middlewares.ExceptionMiddleware>();

// Middleware global para atrapar errores de validación y mandarlos limpios al frontend
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (FluentValidation.ValidationException ex)
    {
        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        var errorMessages = string.Join(" | ", ex.Errors.Select(e => e.ErrorMessage));
        await context.Response.WriteAsJsonAsync(new { error = errorMessages });
    }
});

app.MapControllers();

// Auto-crear la BD si no existe y asegurar columnas de Refresh Token
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<POS.Infrastructure.Data.POSDbContext>();
    db.Database.Migrate();
}

app.Run();
