using Microsoft.EntityFrameworkCore;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using POS.Infrastructure.Data;

namespace POS.Infrastructure.Repositories;

public class MovimientoStockRepository : GenericRepository<MovimientoStock>, IMovimientoStockRepository
{
    public MovimientoStockRepository(POSDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<MovimientoStock>> GetAllWithDetailsAsync()
    {
        return await _context.Set<MovimientoStock>()
            .Include(m => m.Producto)
            .Include(m => m.Usuario)
            .OrderByDescending(m => m.Fecha)
            .ToListAsync();
    }
}
