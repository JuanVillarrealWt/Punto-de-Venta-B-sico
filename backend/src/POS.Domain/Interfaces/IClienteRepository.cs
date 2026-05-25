using POS.Domain.Entities;

namespace POS.Domain.Interfaces;

public interface IClienteRepository
{
    Task<IEnumerable<Cliente>> GetAllAsync(string? search = null, string? searchBy = null);
    Task<Cliente?> GetByIdAsync(int id);
    Task<Cliente?> GetByIdentificacionAsync(string identificacion);
    Task<Cliente> AddAsync(Cliente cliente);
    void Update(Cliente cliente);
    void Delete(Cliente cliente);
}
