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
                    page.Margin(0); // We will handle margins inside the content for edge-to-edge header
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Arial));

                    // Header con fondo verde
                    page.Header().Background(Colors.Teal.Darken2).Padding(30).Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("ABARROTES VILLARREAL").FontSize(24).Bold().FontColor(Colors.White);
                                c.Item().Text("Factura Electrónica").FontSize(12).FontColor(Colors.Teal.Lighten3);
                            });
                            row.RelativeItem().AlignRight().Column(c =>
                            {
                                c.Item().Text($"Factura No. {factura.NumeroFactura}").FontSize(16).Bold().FontColor(Colors.White);
                                c.Item().Text($"Fecha: {factura.Fecha:dd/MM/yyyy HH:mm}").FontSize(10).FontColor(Colors.Teal.Lighten5);
                            });
                        });
                    });

                    // Customer Info & Table
                    page.Content().PaddingHorizontal(30).PaddingVertical(20).Column(col =>
                    {
                        col.Item().PaddingBottom(20).Row(row =>
                        {
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(c =>
                            {
                                c.Item().Text("FACTURAR A:").Bold().FontSize(9).FontColor(Colors.Teal.Darken2);
                                c.Item().Text($"{factura.Cliente.Nombre} {factura.Cliente.Apellido}").Bold().FontSize(12);
                                c.Item().Text($"ID: {factura.Cliente.Identificacion}").FontColor(Colors.Grey.Darken2);
                                c.Item().Text($"Email: {factura.Cliente.Email ?? "S/N"}").FontColor(Colors.Grey.Darken2);
                            });
                            
                            row.ConstantItem(20); // Spacing

                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(c =>
                            {
                                c.Item().Text("DETALLES DE LA VENTA:").Bold().FontSize(9).FontColor(Colors.Teal.Darken2);
                                c.Item().Text($"Vendedor: {factura.Usuario?.Nombre ?? "S/S"}").FontColor(Colors.Grey.Darken3);
                                c.Item().Text($"Método Pago: {factura.MetodoPago?.Nombre ?? "Efectivo"}").FontColor(Colors.Grey.Darken3);
                                c.Item().Text($"Estado: {factura.Estado}").Bold().FontColor(factura.Estado == "ANULADA" ? Colors.Red.Medium : Colors.Teal.Medium);
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
                                header.Cell().Element(CellStyle).Text("Descripción");
                                header.Cell().Element(CellStyle).AlignCenter().Text("Cant.");
                                header.Cell().Element(CellStyle).AlignRight().Text("P. Unit.");
                                header.Cell().Element(CellStyle).AlignRight().Text("Subtotal");

                                static IContainer CellStyle(IContainer container) => container.Background(Colors.Teal.Darken2).PaddingVertical(8).PaddingHorizontal(5).DefaultTextStyle(x => x.Bold().FontSize(10).FontColor(Colors.White));
                            });

                            int idx = 1;
                            foreach (var item in factura.Detalles)
                            {
                                var backgroundColor = idx % 2 == 0 ? Colors.Teal.Lighten5 : Colors.White;
                                
                                table.Cell().Element(c => RowStyle(c, backgroundColor)).Text($"{idx}");
                                table.Cell().Element(c => RowStyle(c, backgroundColor)).Text(item.ProductoNombre);
                                table.Cell().Element(c => RowStyle(c, backgroundColor)).AlignCenter().Text($"{item.Cantidad}");
                                table.Cell().Element(c => RowStyle(c, backgroundColor)).AlignRight().Text($"{item.PrecioUnitario:C2}");
                                table.Cell().Element(c => RowStyle(c, backgroundColor)).AlignRight().Text($"{item.Subtotal:C2}").Bold().FontColor(Colors.Teal.Darken3);

                                static IContainer RowStyle(IContainer container, string bgColor) => container.Background(bgColor).BorderBottom(1).BorderColor(Colors.Grey.Lighten3).PaddingVertical(6).PaddingHorizontal(5);
                                idx++;
                            }
                        });

                        // Observaciones
                        if (!string.IsNullOrWhiteSpace(factura.Observaciones))
                        {
                            col.Item().PaddingTop(15).Column(c =>
                            {
                                c.Item().Text("OBSERVACIONES:").Bold().FontSize(9).FontColor(Colors.Teal.Darken2);
                                c.Item().Text(factura.Observaciones).FontSize(10).FontColor(Colors.Grey.Darken2);
                            });
                        }

                        // Totals
                        col.Item().PaddingTop(20).Row(row => 
                        {
                            row.RelativeItem(); // spacer
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingBottom(5).Row(r => 
                                {
                                    r.RelativeItem().Text("Subtotal:").Bold().FontColor(Colors.Grey.Darken2);
                                    r.RelativeItem().AlignRight().Text($"{factura.Subtotal:C2}");
                                });
                                c.Item().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).Row(r => 
                                {
                                    r.RelativeItem().Text($"IVA ({factura.PorcentajeIva}%):").Bold().FontColor(Colors.Grey.Darken2);
                                    r.RelativeItem().AlignRight().Text($"{factura.MontoIva:C2}");
                                });
                                c.Item().Background(Colors.Teal.Lighten5).Padding(10).Row(r => 
                                {
                                    r.RelativeItem().Text("TOTAL:").FontSize(14).Bold().FontColor(Colors.Teal.Darken3);
                                    r.RelativeItem().AlignRight().Text($"{factura.Total:C2}").FontSize(14).Bold().FontColor(Colors.Teal.Darken3);
                                });
                            });
                        });
                    });

                    page.Footer().PaddingHorizontal(30).PaddingBottom(20).Column(col => 
                    {
                        col.Item().PaddingBottom(5).LineHorizontal(1).LineColor(Colors.Teal.Lighten2);
                        col.Item().AlignCenter().Text("¡Gracias por su compra en Abarrotes Villarreal!").Italic().FontColor(Colors.Teal.Darken2);
                        col.Item().AlignCenter().Text(x =>
                        {
                            x.Span("Página ").FontSize(9).FontColor(Colors.Grey.Medium);
                            x.CurrentPageNumber().FontSize(9).FontColor(Colors.Grey.Medium);
                            x.Span(" de ").FontSize(9).FontColor(Colors.Grey.Medium);
                            x.TotalPages().FontSize(9).FontColor(Colors.Grey.Medium);
                        });
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
