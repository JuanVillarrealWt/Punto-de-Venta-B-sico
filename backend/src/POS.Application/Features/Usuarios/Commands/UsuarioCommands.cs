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

public class CreateUsuarioValidator : AbstractValidator<CreateUsuarioCommand>
{
    public CreateUsuarioValidator()
    {
        RuleFor(x => x.Username).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Apellido).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password)
            .NotEmpty()
            .Length(8, 10)
            .Must(p => Regex.IsMatch(p, @"[A-Z]"))
            .WithMessage("La clave debe tener al menos una mayúscula.")
            .Must(p => Regex.IsMatch(p, @"[a-z]"))
            .WithMessage("La clave debe tener al menos una minúscula.")
            .Must(p => Regex.IsMatch(p, @"[0-9]"))
            .WithMessage("La clave debe tener al menos un número.")
            .Must(p => Regex.IsMatch(p, @"[^a-zA-Z0-9]"))
            .WithMessage("La clave debe tener al menos un carácter especial.");
    }
}
