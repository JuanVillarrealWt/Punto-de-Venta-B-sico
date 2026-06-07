using FluentValidation;
using POS.Application.Features.Clientes.Commands;

namespace POS.Application.Validators;

/// <summary>
/// Valida los campos comunes de creación y edición de clientes.
/// Principio SRP: este validator solo se ocupa de la estructura/formato de los datos.
/// La unicidad de email se verifica en el Handler (consulta a BD).
/// </summary>
file static class ClienteRules
{
    // Cédula ecuatoriana: empieza con 01..24, exactamente 10 dígitos numéricos
    public const string CedulaPattern     = @"^(0[1-9]|1[0-9]|2[0-4])\d{8}$";

    // Solo letras (incluye tildes y ñ), sin espacios ni números
    public const string SoloLetrasPattern = @"^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$";

    // Email: al menos un carácter antes del @, algo después del @ con un punto y algo más
    public const string EmailPattern      = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";

    public static void AplicarReglasCedula<T>(AbstractValidator<T> v, System.Linq.Expressions.Expression<Func<T, string>> prop)
    {
        v.RuleFor(prop)
            .NotEmpty().WithMessage("La cédula es requerida.")
            .Length(10).WithMessage("La cédula debe tener exactamente 10 dígitos.")
            .Matches(CedulaPattern).WithMessage("La cédula debe ser ecuatoriana (provincia 01–24) y tener 10 dígitos numéricos.");
    }

    public static void AplicarReglasNombre<T>(AbstractValidator<T> v, System.Linq.Expressions.Expression<Func<T, string>> prop, string campo)
    {
        v.RuleFor(prop)
            .NotEmpty().WithMessage($"El {campo} es requerido.")
            .MaximumLength(60).WithMessage($"El {campo} no puede superar 60 caracteres.")
            .Matches(SoloLetrasPattern).WithMessage($"El {campo} solo puede contener letras, sin espacios ni números.");
    }

    public static void AplicarReglasEmail<T>(AbstractValidator<T> v, System.Linq.Expressions.Expression<Func<T, string?>> prop)
    {
        v.RuleFor(prop)
            .Matches(EmailPattern).WithMessage("El correo debe tener un solo @, algo antes y algo.algo después.")
            .When(x =>
            {
                // Solo validamos cuando el campo tiene valor
                var val = prop.Compile()(x);
                return !string.IsNullOrEmpty(val);
            });
    }
}

public class CreateClienteValidator : AbstractValidator<CreateClienteCommand>
{
    public CreateClienteValidator()
    {
        ClienteRules.AplicarReglasCedula(this, x => x.Identificacion);
        ClienteRules.AplicarReglasNombre(this, x => x.Nombre,   "nombre");
        ClienteRules.AplicarReglasNombre(this, x => x.Apellido, "apellido");

        // Teléfono: solo dígitos, empieza con 09, exactamente 10 dígitos
        RuleFor(x => x.Telefono)
            .Matches(@"^09\d{8}$").WithMessage("El teléfono debe tener 10 dígitos y empezar con 09.")
            .When(x => !string.IsNullOrEmpty(x.Telefono));

        ClienteRules.AplicarReglasEmail(this, x => x.Email);
    }
}

public class UpdateClienteValidator : AbstractValidator<UpdateClienteCommand>
{
    public UpdateClienteValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);

        ClienteRules.AplicarReglasCedula(this, x => x.Identificacion);
        ClienteRules.AplicarReglasNombre(this, x => x.Nombre,   "nombre");
        ClienteRules.AplicarReglasNombre(this, x => x.Apellido, "apellido");

        RuleFor(x => x.Telefono)
            .Matches(@"^09\d{8}$").WithMessage("El teléfono debe tener 10 dígitos y empezar con 09.")
            .When(x => !string.IsNullOrEmpty(x.Telefono));

        ClienteRules.AplicarReglasEmail(this, x => x.Email);
    }
}
