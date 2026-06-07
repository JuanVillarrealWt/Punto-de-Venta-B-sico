using AutoMapper;
using MediatR;
using System.Text.Json;
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

        // Validar vendedor
        var usuario = await _uow.Usuarios.GetByIdAsync(request.UsuarioId)
            ?? throw new KeyNotFoundException($"Usuario con Id {request.UsuarioId} no encontrado.");

        // Validar método de pago
        var metodoPago = await _uow.MetodosPago.GetByIdAsync(request.MetodoPagoId)
            ?? throw new KeyNotFoundException($"Método de pago con Id {request.MetodoPagoId} no encontrado.");

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

        var detallesSnapshot = new List<FacturaDetalleSnapshotDto>();

        // 5. Procesar cada item: delegar en dominio (ReducirStock, AgregarDetalle), registrar movimientos
        foreach (var item in request.Items)
        {
            var producto = await _uow.Productos.GetByIdAsync(item.ProductoId)
                ?? throw new KeyNotFoundException($"Producto con Id {item.ProductoId} no encontrado.");

            int stockAnterior = producto.Stock;

            // Delegamos las validaciones matemáticas y lógicas a las entidades de dominio
            producto.ReducirStock(item.Cantidad);
            factura.AgregarDetalle(producto, item.Cantidad);

            int stockNuevo = producto.Stock;

            detallesSnapshot.Add(new FacturaDetalleSnapshotDto
            {
                ProductoId = producto.Id,
                ProductoCodigo = producto.Codigo,
                ProductoNombre = producto.Nombre,
                Cantidad = item.Cantidad,
                PrecioUnitario = producto.Precio,
                Subtotal = producto.Precio * item.Cantidad
            });

            // Registrar Movimiento de Stock

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

        // 6. Calcular totales mediante la entidad de dominio
        factura.CalcularTotales();

        // Construir snapshot
        var snapshot = new FacturaSnapshotDto
        {
            NumeroFactura = numeroFactura,
            Fecha = factura.Fecha,
            Subtotal = factura.Subtotal,
            PorcentajeIva = factura.PorcentajeIva,
            MontoIva = factura.MontoIva,
            Total = factura.Total,
            Observaciones = factura.Observaciones,
            Estado = factura.Estado,

            ClienteId = cliente.Id,
            ClienteNombre = cliente.Nombre,
            ClienteApellido = cliente.Apellido,
            ClienteIdentificacion = cliente.Identificacion,
            ClienteDireccion = cliente.Direccion,
            ClienteTelefono = cliente.Telefono,
            ClienteEmail = cliente.Email,

            UsuarioId = usuario.Id,
            VendedorNombre = usuario.Nombre,
            VendedorApellido = usuario.Apellido,
            VendedorUsername = usuario.Username,
            VendedorEmail = usuario.Email,
            VendedorCedula = usuario.Cedula,

            MetodoPagoId = metodoPago.Id,
            MetodoPagoNombre = metodoPago.Nombre,

            Detalles = detallesSnapshot
        };

        factura.SnapshotJson = JsonSerializer.Serialize(snapshot);

        // 7. Guardar factura
        await _uow.Facturas.AddAsync(factura);

        // 8. Commit: todo o nada (transacción atómica)
        await _uow.CommitAsync(ct);

        // 9. Recargar con navegaciones para el DTO
        var facturaCompleta = await _uow.Facturas.GetByIdAsync(factura.Id);
        return _mapper.Map<FacturaDto>(facturaCompleta!);
    }
}
