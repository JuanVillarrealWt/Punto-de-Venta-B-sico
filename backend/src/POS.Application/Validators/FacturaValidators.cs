using FluentValidation;
using POS.Application.Features.Facturas.Commands;

namespace POS.Application.Validators;

public class GenerarFacturaValidator : AbstractValidator<GenerarFacturaCommand>
{
    public GenerarFacturaValidator()
    {
        RuleFor(x => x.ClienteId).GreaterThan(0).WithMessage("Debe seleccionar un cliente.");
        RuleFor(x => x.PorcentajeIva).GreaterThanOrEqualTo(0).WithMessage("El IVA no puede ser negativo.");
        RuleFor(x => x.Items).NotEmpty().WithMessage("La factura debe tener al menos un producto.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductoId).GreaterThan(0).WithMessage("Producto inválido.");
            item.RuleFor(i => i.Cantidad).GreaterThan(0).WithMessage("La cantidad debe ser mayor a 0.");
        });
    }
}
