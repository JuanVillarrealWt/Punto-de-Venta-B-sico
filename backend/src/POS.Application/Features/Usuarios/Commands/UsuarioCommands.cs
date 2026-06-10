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
    string? Password,
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

file static class UsuarioRules
{
    public const string SoloLetrasPattern = @"^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$";
    public const string CedulaPattern = @"^(0[1-9]|1[0-9]|2[0-4])\d{8}$";
    public const string UsernamePattern = @"^[a-zA-Z0-9_]+$";
    public const string EmailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";

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

    public static void AplicarReglasCedula<T>(AbstractValidator<T> v, System.Linq.Expressions.Expression<Func<T, string?>> cedula)
    {
        v.RuleFor(cedula)
            .NotEmpty().WithMessage("La cédula es requerida.")
            .Length(10).WithMessage("La cédula debe tener exactamente 10 dígitos.")
            .Matches(CedulaPattern).WithMessage("La cédula debe ser ecuatoriana (provincia 01-24) y tener 10 dígitos numéricos.");
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

        UsuarioRules.AplicarReglasCedula(this, x => x.Cedula);
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

        UsuarioRules.AplicarReglasCedula(this, x => x.Cedula);
        UsuarioRules.AplicarReglasPersona(this, x => x.Nombre, x => x.Apellido);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo es requerido.")
            .Matches(UsuarioRules.EmailPattern)
            .WithMessage("El correo debe tener un solo @, algo antes y algo.algo después.");

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
