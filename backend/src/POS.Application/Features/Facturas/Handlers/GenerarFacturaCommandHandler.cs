using AutoMapper;
using MediatR;
using POS.Application.DTOs;
using POS.Application.Features.Facturas.Commands;
using POS.Domain.Entities;
using POS.Domain.Interfaces;

namespace POS.Application.Features.Facturas.Handlers;

/// <summary>
/// Handler crítico: Crea la factura, descuenta stock y usa Unit of Work
/// para asegurar integridad transaccional.
/// </summary>
public class GenerarFacturaCommandHandler : IRequestHandler<GenerarFacturaCommand, FacturaDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GenerarFacturaCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<FacturaDto> Handle(GenerarFacturaCommand request, CancellationToken ct)
    {
        // 1. Validar que haya items
        if (request.Items == null || request.Items.Count == 0)
            throw new InvalidOperationException("La factura debe tener al menos un producto.");

        // 2. Validar cliente
        var cliente = await _uow.Clientes.GetByIdAsync(request.ClienteId)
            ?? throw new KeyNotFoundException($"Cliente con Id {request.ClienteId} no encontrado.");

        // 3. Obtener número de factura correlativo
        var numeroFactura = await _uow.Facturas.GetSiguienteNumeroAsync();

        // 4. Crear factura maestro
        var factura = new FacturaMaestro
        {
            NumeroFactura = numeroFactura,
            Fecha = DateTime.UtcNow,
            ClienteId = request.ClienteId,
            UsuarioId = request.UsuarioId,
            MetodoPagoId = request.MetodoPagoId,
            PorcentajeIva = request.PorcentajeIva,
            Observaciones = request.Observaciones,
            Estado = "CONFIRMADA"
        };

        decimal subtotal = 0;

        // 5. Procesar cada item: validar stock, crear detalle, descontar inventario
        foreach (var item in request.Items)
        {
            var producto = await _uow.Productos.GetByIdAsync(item.ProductoId)
                ?? throw new KeyNotFoundException($"Producto con Id {item.ProductoId} no encontrado.");

            if (item.Cantidad <= 0)
                throw new InvalidOperationException($"La cantidad debe ser mayor a 0 para el producto '{producto.Nombre}'.");

            if (producto.Stock <= 0)
                throw new InvalidOperationException(
                    $"Ya no hay stock disponible para el producto '{producto.Nombre}'. Por favor, quítelo del carrito para poder continuar.");
            else if (producto.Stock < item.Cantidad)
                throw new InvalidOperationException(
                    $"Stock insuficiente para '{producto.Nombre}'. Disponible: {producto.Stock}, Solicitado: {item.Cantidad}");

            var detalle = new FacturaDetalle
            {
                ProductoId = producto.Id,
                ProductoCodigo = producto.Codigo,
                ProductoNombre = producto.Nombre,
                Cantidad = item.Cantidad,
                PrecioUnitario = producto.Precio,
                Subtotal = producto.Precio * item.Cantidad
            };

            factura.Detalles.Add(detalle);
            subtotal += detalle.Subtotal;

            // Registrar Movimiento de Stock
            int stockAnterior = producto.Stock;
            producto.Stock -= item.Cantidad;
            int stockNuevo = producto.Stock;

            _uow.Productos.Update(producto);

            await _uow.MovimientosStock.AddAsync(new MovimientoStock
            {
                ProductoId = producto.Id,
                TipoMovimiento = "SALIDA",
                Cantidad = item.Cantidad,
                StockAnterior = stockAnterior,
                StockNuevo = stockNuevo,
                Referencia = $"Venta #{numeroFactura}",
                Fecha = DateTime.UtcNow,
                UsuarioId = request.UsuarioId
            });
        }

        // 6. Calcular totales
        factura.Subtotal = subtotal;
        factura.MontoIva = Math.Round(subtotal * (request.PorcentajeIva / 100m), 2);
        factura.Total = factura.Subtotal + factura.MontoIva;

        // 7. Guardar factura
        await _uow.Facturas.AddAsync(factura);

        // 8. Commit: todo o nada (transacción atómica)
        await _uow.CommitAsync(ct);

        // 9. Recargar con navegaciones para el DTO
        var facturaCompleta = await _uow.Facturas.GetByIdAsync(factura.Id);
        return _mapper.Map<FacturaDto>(facturaCompleta!);
    }
}
