using POS.Domain.Entities;

namespace POS.Domain.Interfaces;

public interface IProductoRepository
{
    Task<IEnumerable<Producto>> GetAllAsync(string? search = null, string? searchBy = null);
    Task<Producto?> GetByIdAsync(int id);
    Task<Producto?> GetByCodigoAsync(string codigo);
    Task<Producto> AddAsync(Producto producto);
    void Update(Producto producto);
    void Delete(Producto producto);
}
