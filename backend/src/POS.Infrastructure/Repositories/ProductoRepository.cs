using Microsoft.EntityFrameworkCore;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using POS.Infrastructure.Data;

namespace POS.Infrastructure.Repositories;

public class ProductoRepository : IProductoRepository
{
    private readonly POSDbContext _db;

    public ProductoRepository(POSDbContext db) => _db = db;

    public async Task<IEnumerable<Producto>> GetAllAsync(string? search = null, string? searchBy = null)
    {
        var query = _db.Productos.AsNoTracking().Where(p => p.Activo);
        if (!string.IsNullOrWhiteSpace(search))
        {
            if (string.Equals(searchBy, "nombre", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.Nombre.Contains(search));
            }
            else if (string.Equals(searchBy, "codigo", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.Codigo.Contains(search));
            }
            else
            {
                query = query.Where(p =>
                    p.Nombre.Contains(search) ||
                    p.Codigo.Contains(search));
            }
            // Limit search results to top 50 for performance
            return await query.OrderBy(p => p.Nombre).Take(50).ToListAsync();
        }
        return await query.OrderBy(p => p.Nombre).ToListAsync();
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
    public void Delete(Producto producto)
    {
        producto.Activo = false;
        _db.Productos.Update(producto);
    }
}
