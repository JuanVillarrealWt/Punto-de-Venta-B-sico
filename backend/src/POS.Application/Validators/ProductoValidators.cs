using FluentValidation;
using POS.Application.Features.Productos.Commands;

namespace POS.Application.Validators;

public class CreateProductoValidator : AbstractValidator<CreateProductoCommand>
{
    public CreateProductoValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Precio).GreaterThan(0).WithMessage("El precio debe ser mayor a 0.");
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0).WithMessage("El stock no puede ser negativo.");
    }
}

public class UpdateProductoValidator : AbstractValidator<UpdateProductoCommand>
{
    public UpdateProductoValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Precio).GreaterThan(0);
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
    }
}
