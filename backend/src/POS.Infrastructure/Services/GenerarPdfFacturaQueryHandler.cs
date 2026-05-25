using MediatR;
using POS.Application.Features.Facturas.Queries;
using POS.Domain.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace POS.Infrastructure.Services;

public class GenerarPdfFacturaQueryHandler : IRequestHandler<GenerarPdfFacturaQuery, byte[]>
{
    private readonly IUnitOfWork _uow;

    public GenerarPdfFacturaQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> Handle(GenerarPdfFacturaQuery request, CancellationToken ct)
    {
        // Asegurarnos de traer la factura con todas sus relaciones
        var factura = await _uow.Facturas.GetByIdAsync(request.FacturaId)
            ?? throw new KeyNotFoundException($"Factura con Id {request.FacturaId} no encontrada.");

        // Validar que tengamos datos básicos para el reporte
        if (factura.Cliente == null)
            throw new InvalidOperationException("No se puede generar el PDF porque la factura no tiene un cliente asociado.");

        try
        {
            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    // Header
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("FACTURA DE VENTA").FontSize(20).Bold().FontColor(Colors.Teal.Medium);
                                c.Item().Text($"No. {factura.NumeroFactura}").FontSize(14).Bold();
                            });
                            row.RelativeItem().AlignRight().Column(c =>
                            {
                                c.Item().Text("ABARROTES VILLARREAL").FontSize(14).Bold().FontColor(Colors.Teal.Medium);
                                c.Item().Text($"Fecha: {factura.Fecha:dd/MM/yyyy HH:mm}");
                            });
                        });
                        col.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // Customer Info
                    page.Content().Column(col =>
                    {
                        col.Item().PaddingBottom(15).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("DATOS DEL CLIENTE").Bold().FontSize(11);
                                c.Item().Text($"Nombre: {factura.Cliente.Nombre} {factura.Cliente.Apellido}");
                                c.Item().Text($"Identificación: {factura.Cliente.Identificacion}");
                            });
                            row.RelativeItem().AlignRight().Column(c =>
                            {
                                c.Item().Text("CONTACTO").Bold().FontSize(11);
                                c.Item().Text($"Email: {factura.Cliente.Email ?? "S/N"}");
                                c.Item().Text($"Teléfono: {factura.Cliente.Telefono ?? "S/N"}");
                            });
                        });

                        // Table
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(cols =>
                            {
                                cols.ConstantColumn(30);
                                cols.RelativeColumn(3);
                                cols.RelativeColumn(1);
                                cols.RelativeColumn(1);
                                cols.RelativeColumn(1);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("#");
                                header.Cell().Element(CellStyle).Text("Producto");
                                header.Cell().Element(CellStyle).AlignCenter().Text("Cant.");
                                header.Cell().Element(CellStyle).AlignRight().Text("P. Unit.");
                                header.Cell().Element(CellStyle).AlignRight().Text("Subtotal");

                                static IContainer CellStyle(IContainer container) => container.DefaultTextStyle(x => x.Bold().FontSize(11)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            });

                            int idx = 1;
                            foreach (var item in factura.Detalles)
                            {
                                table.Cell().Element(RowStyle).Text($"{idx}");
                                table.Cell().Element(RowStyle).Text(item.ProductoNombre);
                                table.Cell().Element(RowStyle).AlignCenter().Text($"{item.Cantidad}");
                                table.Cell().Element(RowStyle).AlignRight().Text($"{item.PrecioUnitario:C2}");
                                table.Cell().Element(RowStyle).AlignRight().Text($"{item.Subtotal:C2}");

                                static IContainer RowStyle(IContainer container) => container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3);
                                idx++;
                            }
                        });

                        // Observaciones
                        if (!string.IsNullOrWhiteSpace(factura.Observaciones))
                        {
                            col.Item().PaddingTop(15).Column(c =>
                            {
                                c.Item().Text("OBSERVACIONES:").Bold().FontSize(10);
                                c.Item().Text(factura.Observaciones).FontSize(10).FontColor(Colors.Grey.Darken2);
                            });
                        }

                        // Totals
                        col.Item().AlignRight().PaddingTop(20).Column(c =>
                        {
                            c.Item().Text($"Subtotal: {factura.Subtotal:C2}");
                            c.Item().Text($"IVA ({factura.PorcentajeIva}%): {factura.MontoIva:C2}");
                            c.Item().PaddingTop(5).Text($"TOTAL: {factura.Total:C2}").FontSize(14).Bold().FontColor(Colors.Teal.Medium);
                        });
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Página ");
                        x.CurrentPageNumber();
                    });
                });
            });

            return pdf.GeneratePdf();
        }
        catch (Exception ex)
        {
            throw new Exception("Error crítico al generar el PDF de la factura: " + ex.Message);
        }
    }
}
