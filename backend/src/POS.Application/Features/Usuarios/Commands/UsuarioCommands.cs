using FluentValidation;
using MediatR;
using POS.Application.DTOs;
using System.Text.RegularExpressions;

namespace POS.Application.Features.Usuarios.Commands;

public record CreateUsuarioCommand(
    string Username,
    string Password,
    string Nombre,
    string Apellido,
    string? Cedula,
    string Email,
    int RoleId
) : IRequest<UsuarioDto>;

public record UpdateUsuarioCommand(
    int Id,
    string Username,
    string? Password, // Opcional al actualizar
    string Nombre,
    string Apellido,
    string? Cedula,
    string Email,
    int RoleId,
    bool Activo,
    bool Bloqueado
) : IRequest<UsuarioDto>;

public record DeleteUsuarioCommand(int Id) : IRequest<bool>;

public record ToggleBloqueoCommand(int Id) : IRequest<bool>;

/// <summary>
/// Reglas compartidas de validación de formato para Usuarios.
/// La unicidad de username y email se verifica en el Handler (consulta a BD).
/// </summary>
file static class UsuarioRules
{
    // Solo letras (incluye tildes y ñ), sin espacios ni números
    public const string SoloLetrasPattern = @"^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$";

    // Username: alfanumérico + guión bajo, sin espacios
    public const string UsernamePattern   = @"^[a-zA-Z0-9_]+$";

    // Email: un solo @, algo antes, punto + algo después del @
    public const string EmailPattern      = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";

    public static void AplicarReglasPersona<T>(AbstractValidator<T> v,
        System.Linq.Expressions.Expression<Func<T, string>> nombre,
        System.Linq.Expressions.Expression<Func<T, string>> apellido)
    {
        v.RuleFor(nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.")
            .Matches(SoloLetrasPattern).WithMessage("El nombre solo puede contener letras, sin espacios ni números.");

        v.RuleFor(apellido)
            .NotEmpty().WithMessage("El apellido es requerido.")
            .MaximumLength(100).WithMessage("El apellido no puede superar 100 caracteres.")
            .Matches(SoloLetrasPattern).WithMessage("El apellido solo puede contener letras, sin espacios ni números.");
    }
}

public class CreateUsuarioValidator : AbstractValidator<CreateUsuarioCommand>
{
    public CreateUsuarioValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("El username es requerido.")
            .MaximumLength(50).WithMessage("El username no puede superar 50 caracteres.")
            .Matches(UsuarioRules.UsernamePattern)
            .WithMessage("El username solo puede contener letras, números y guiones bajos, sin espacios.");

        UsuarioRules.AplicarReglasPersona(this, x => x.Nombre, x => x.Apellido);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo es requerido.")
            .Matches(UsuarioRules.EmailPattern)
            .WithMessage("El correo debe tener un solo @, algo antes y algo.algo después.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .Length(8, 10)
            .Must(p => Regex.IsMatch(p, @"[A-Z]")).WithMessage("La clave debe tener al menos una mayúscula.")
            .Must(p => Regex.IsMatch(p, @"[a-z]")).WithMessage("La clave debe tener al menos una minúscula.")
            .Must(p => Regex.IsMatch(p, @"[0-9]")).WithMessage("La clave debe tener al menos un número.")
            .Must(p => Regex.IsMatch(p, @"[^a-zA-Z0-9]")).WithMessage("La clave debe tener al menos un carácter especial.");
    }
}

public class UpdateUsuarioValidator : AbstractValidator<UpdateUsuarioCommand>
{
    public UpdateUsuarioValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("El username es requerido.")
            .MaximumLength(50).WithMessage("El username no puede superar 50 caracteres.")
            .Matches(UsuarioRules.UsernamePattern)
            .WithMessage("El username solo puede contener letras, números y guiones bajos, sin espacios.");

        UsuarioRules.AplicarReglasPersona(this, x => x.Nombre, x => x.Apellido);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo es requerido.")
            .Matches(UsuarioRules.EmailPattern)
            .WithMessage("El correo debe tener un solo @, algo antes y algo.algo después.");

        // Contraseña es opcional al editar, pero si se provee debe cumplir requisitos
        When(x => !string.IsNullOrWhiteSpace(x.Password), () =>
        {
            RuleFor(x => x.Password!)
                .Length(8, 10)
                .Must(p => Regex.IsMatch(p, @"[A-Z]")).WithMessage("La clave debe tener al menos una mayúscula.")
                .Must(p => Regex.IsMatch(p, @"[a-z]")).WithMessage("La clave debe tener al menos una minúscula.")
                .Must(p => Regex.IsMatch(p, @"[0-9]")).WithMessage("La clave debe tener al menos un número.")
                .Must(p => Regex.IsMatch(p, @"[^a-zA-Z0-9]")).WithMessage("La clave debe tener al menos un carácter especial.");
        });
    }
}
