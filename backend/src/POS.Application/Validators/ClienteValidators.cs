using FluentValidation;
using POS.Application.Features.Clientes.Commands;

namespace POS.Application.Validators;

public class CreateClienteValidator : AbstractValidator<CreateClienteCommand>
{
    public CreateClienteValidator()
    {
        // Identificación: exactamente 10 dígitos numéricos
        RuleFor(x => x.Identificacion)
            .NotEmpty().WithMessage("La identificación es requerida.")
            .Length(10).WithMessage("La identificación debe tener exactamente 10 dígitos.")
            .Matches(@"^\d{10}$").WithMessage("La identificación solo puede contener dígitos numéricos.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(60).WithMessage("El nombre no puede superar 60 caracteres.");

        RuleFor(x => x.Apellido)
            .NotEmpty().WithMessage("El apellido es requerido.")
            .MaximumLength(60).WithMessage("El apellido no puede superar 60 caracteres.");

        // Teléfono: exactamente 10 dígitos y empieza con 09
        RuleFor(x => x.Telefono)
            .Matches(@"^09\d{8}$").WithMessage("El teléfono debe tener 10 dígitos y empezar con 09.")
            .When(x => !string.IsNullOrEmpty(x.Telefono));

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("El email no tiene un formato válido.")
            .When(x => !string.IsNullOrEmpty(x.Email));
    }
}

public class UpdateClienteValidator : AbstractValidator<UpdateClienteCommand>
{
    public UpdateClienteValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);

        RuleFor(x => x.Identificacion)
            .NotEmpty().WithMessage("La identificación es requerida.")
            .Length(10).WithMessage("La identificación debe tener exactamente 10 dígitos.")
            .Matches(@"^\d{10}$").WithMessage("La identificación solo puede contener dígitos numéricos.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(60);

        RuleFor(x => x.Apellido)
            .NotEmpty().WithMessage("El apellido es requerido.")
            .MaximumLength(60);

        RuleFor(x => x.Telefono)
            .Matches(@"^09\d{8}$").WithMessage("El teléfono debe tener 10 dígitos y empezar con 09.")
            .When(x => !string.IsNullOrEmpty(x.Telefono));

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("El email no tiene un formato válido.")
            .When(x => !string.IsNullOrEmpty(x.Email));
    }
}
