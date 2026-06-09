using Microsoft.EntityFrameworkCore;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using POS.Infrastructure.Data;

namespace POS.Infrastructure.Repositories;

public class ProductoRepository : IProductoRepository
{
    private readonly POSDbContext _db;

    public ProductoRepository(POSDbContext db) => _db = db;

    public async Task<(IEnumerable<Producto> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? searchBy = null,
        int page = 1,
        int pageSize = 25)
    {
        var query = _db.Productos.AsNoTracking().AsQueryable();

        // Si hay búsqueda, filtra y devuelve un slice pequeño (máx 50) sin paginación estricta
        if (!string.IsNullOrWhiteSpace(search))
        {
            if (string.Equals(searchBy, "nombre", StringComparison.OrdinalIgnoreCase))
                query = query.Where(p => p.Nombre.Contains(search));
            else if (string.Equals(searchBy, "codigo", StringComparison.OrdinalIgnoreCase))
                query = query.Where(p => p.Codigo.Contains(search));
            else
                query = query.Where(p => p.Nombre.Contains(search) || p.Codigo.Contains(search));

            // Búsqueda: devuelve hasta 50 resultados ordenados, sin paginación pesada
        }

        // Sin búsqueda: paginación del servidor
        var totalCount = await query.CountAsync();

        var clampedPage = Math.Max(1, page);
        var clampedPageSize = Math.Clamp(pageSize, 10, 100);

        var items = await query
            .OrderBy(p => p.Nombre)
            .Skip((clampedPage - 1) * clampedPageSize)
            .Take(clampedPageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Producto?> GetByIdAsync(int id) =>
        await _db.Productos.FindAsync(id);

    public async Task<Producto?> GetByCodigoAsync(string codigo) =>
        await _db.Productos.FirstOrDefaultAsync(p => p.Codigo == codigo);

    public async Task<Producto> AddAsync(Producto producto)
    {
        await _db.Productos.AddAsync(producto);
        return producto;
    }

    public void Update(Producto producto) => _db.Productos.Update(producto);

    public void Delete(Producto producto) => _db.Productos.Remove(producto);

    public async Task<bool> HasHistoryAsync(int id) =>
        await _db.FacturasDetalle.AnyAsync(fd => fd.ProductoId == id);
}
