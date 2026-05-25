using Microsoft.EntityFrameworkCore;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using POS.Infrastructure.Data;

namespace POS.Infrastructure.Repositories;

public class FacturaRepository : IFacturaRepository
{
    private readonly POSDbContext _db;

    public FacturaRepository(POSDbContext db) => _db = db;

    public async Task<IEnumerable<FacturaMaestro>> GetAllAsync(DateTime? desde = null, DateTime? hasta = null, string? searchCliente = null, string? searchBy = null)
    {
        var query = _db.FacturasMaestro
            .AsNoTracking()
            .Include(f => f.Cliente)
            .Include(f => f.Detalles)
            .Where(f => f.Estado == "ACTIVA")  // Solo facturas activas
            .AsQueryable();

        if (desde.HasValue)
            query = query.Where(f => f.Fecha >= desde.Value);
        if (hasta.HasValue)
            query = query.Where(f => f.Fecha <= hasta.Value.AddDays(1));
        if (!string.IsNullOrWhiteSpace(searchCliente))
        {
            if (string.Equals(searchBy, "factura", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(f => f.NumeroFactura.Contains(searchCliente));
            }
            else if (string.Equals(searchBy, "cliente_nombre", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(f => f.Cliente.Nombre.Contains(searchCliente) || f.Cliente.Apellido.Contains(searchCliente));
            }
            else if (string.Equals(searchBy, "cliente_identificacion", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(f => f.Cliente.Identificacion.Contains(searchCliente));
            }
            else
            {
                query = query.Where(f =>
                    f.Cliente.Nombre.Contains(searchCliente) ||
                    f.Cliente.Apellido.Contains(searchCliente) ||
                    f.NumeroFactura.Contains(searchCliente));
            }
            // Limit results for broader searches
            return await query.OrderByDescending(f => f.Fecha).Take(100).ToListAsync();
        }

        return await query.OrderByDescending(f => f.Fecha).ToListAsync();
    }

    public async Task<FacturaMaestro?> GetByIdAsync(int id) =>
        await _db.FacturasMaestro
            .Include(f => f.Cliente)
            .Include(f => f.Detalles)
            .FirstOrDefaultAsync(f => f.Id == id);

    public async Task<FacturaMaestro?> GetByNumeroAsync(string numero) =>
        await _db.FacturasMaestro
            .Include(f => f.Cliente)
            .Include(f => f.Detalles)
            .FirstOrDefaultAsync(f => f.NumeroFactura == numero);

    public async Task<string> GetSiguienteNumeroAsync()
    {
        var ultima = await _db.FacturasMaestro
            .OrderByDescending(f => f.Id)
            .FirstOrDefaultAsync();

        if (ultima is null)
            return "0001";

        if (int.TryParse(ultima.NumeroFactura, out var num))
            return (num + 1).ToString("D4");

        return (ultima.Id + 1).ToString("D4");
    }

    public async Task<FacturaMaestro> AddAsync(FacturaMaestro factura)
    {
        await _db.FacturasMaestro.AddAsync(factura);
        return factura;
    }

    /// <summary>
    /// Anulación lógica: marca la factura como ANULADA y revierte el stock de cada producto.
    /// </summary>
    public async Task<FacturaMaestro?> AnularAsync(int id)
    {
        var factura = await _db.FacturasMaestro
            .Include(f => f.Detalles)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (factura is null) return null;
        if (factura.Estado == "ANULADA")
            throw new InvalidOperationException("La factura ya está anulada.");

        // Revertir stock de cada producto
        foreach (var detalle in factura.Detalles)
        {
            var producto = await _db.Productos.FindAsync(detalle.ProductoId);
            if (producto is not null)
                producto.Stock += detalle.Cantidad;
        }

        // Borrado lógico
        factura.Estado = "ANULADA";

        return factura;
    }
}
