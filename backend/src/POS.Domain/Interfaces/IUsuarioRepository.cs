using POS.Domain.Entities;

namespace POS.Domain.Interfaces;

public interface IUsuarioRepository : IGenericRepository<Usuario>
{
    Task<Usuario?> GetByUsernameAsync(string username);
    Task<IEnumerable<Usuario>> GetAllWithRolesAsync();
    Task<bool> ExisteEmailAsync(string email, int? excludeId = null);
    Task<bool> ExisteUsernameAsync(string username, int? excludeId = null);
}
