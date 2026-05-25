using Microsoft.EntityFrameworkCore;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using POS.Infrastructure.Data;

namespace POS.Infrastructure.Repositories;

public class UsuarioRepository : GenericRepository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(POSDbContext context) : base(context)
    {
    }

    public async Task<Usuario?> GetByUsernameAsync(string username)
    {
        return await _context.Set<Usuario>()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<IEnumerable<Usuario>> GetAllWithRolesAsync()
    {
        return await _context.Set<Usuario>()
            .Include(u => u.Role)
            .OrderByDescending(u => u.FechaCreacion)
            .ToListAsync();
    }
}
