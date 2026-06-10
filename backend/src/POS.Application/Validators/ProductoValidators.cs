using FluentValidation;
using POS.Application.Features.Productos.Commands;

namespace POS.Application.Validators;

public class CreateProductoValidator : AbstractValidator<CreateProductoCommand>
{
    private const decimal MaxPrecio = 999.99m;
    private const int MaxStock = 999;

    public CreateProductoValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Precio)
            .GreaterThan(0).WithMessage("El precio debe ser mayor a 0.")
            .LessThanOrEqualTo(MaxPrecio).WithMessage($"El precio no puede superar {MaxPrecio:0.00}.");
        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("El stock no puede ser negativo.")
            .LessThanOrEqualTo(MaxStock).WithMessage($"El stock no puede superar {MaxStock}.");
    }
}

public class UpdateProductoValidator : AbstractValidator<UpdateProductoCommand>
{
    private const decimal MaxPrecio = 999.99m;
    private const int MaxStock = 999;

    public UpdateProductoValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Precio)
            .GreaterThan(0)
            .LessThanOrEqualTo(MaxPrecio).WithMessage($"El precio no puede superar {MaxPrecio:0.00}.");
        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(MaxStock).WithMessage($"El stock no puede superar {MaxStock}.");
    }
}
