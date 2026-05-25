using POS.Domain.Entities;

namespace POS.Domain.Interfaces;

public interface IProductoRepository
{
    Task<(IEnumerable<Producto> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? searchBy = null,
        int page = 1,
        int pageSize = 25);
    Task<Producto?> GetByIdAsync(int id);
    Task<Producto?> GetByCodigoAsync(string codigo);
    Task<Producto> AddAsync(Producto producto);
    void Update(Producto producto);
    void Delete(Producto producto);
    Task<bool> HasHistoryAsync(int id);
}
