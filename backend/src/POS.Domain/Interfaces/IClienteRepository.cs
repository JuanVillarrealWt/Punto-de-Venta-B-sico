using POS.Domain.Entities;

namespace POS.Domain.Interfaces;

public interface IClienteRepository
{
    Task<(IEnumerable<Cliente> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? searchBy = null,
        int page = 1,
        int pageSize = 25);
    Task<Cliente?> GetByIdAsync(int id);
    Task<Cliente?> GetByIdentificacionAsync(string identificacion);
    Task<Cliente> AddAsync(Cliente cliente);
    void Update(Cliente cliente);
    void Delete(Cliente cliente);
    Task<bool> HasHistoryAsync(int id);
    Task<bool> ExisteIdentificacionAsync(string identificacion, int? excludeId = null);
    Task<bool> ExisteTelefonoAsync(string telefono, int? excludeId = null);
    Task<bool> ExisteEmailAsync(string email, int? excludeId = null);
}
