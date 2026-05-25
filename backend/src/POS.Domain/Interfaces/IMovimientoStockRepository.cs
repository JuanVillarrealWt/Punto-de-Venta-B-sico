using POS.Domain.Entities;

namespace POS.Domain.Interfaces;

public interface IMovimientoStockRepository : IGenericRepository<MovimientoStock>
{
    Task<IEnumerable<MovimientoStock>> GetAllWithDetailsAsync();
}
