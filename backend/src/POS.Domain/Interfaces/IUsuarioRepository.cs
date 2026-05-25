using POS.Domain.Entities;

namespace POS.Domain.Interfaces;

public interface IUsuarioRepository : IGenericRepository<Usuario>
{
    Task<Usuario?> GetByUsernameAsync(string username);
    Task<IEnumerable<Usuario>> GetAllWithRolesAsync();
}
