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

    public async Task<bool> ExisteEmailAsync(string email, int? excludeId = null)
    {
        var q = _context.Set<Usuario>()
            .Where(u => u.Email == email);
        if (excludeId.HasValue)
            q = q.Where(u => u.Id != excludeId.Value);
        return await q.AnyAsync();
    }

    public async Task<bool> ExisteCedulaAsync(string cedula, int? excludeId = null)
    {
        var q = _context.Set<Usuario>()
            .Where(u => u.Cedula == cedula);
        if (excludeId.HasValue)
            q = q.Where(u => u.Id != excludeId.Value);
        return await q.AnyAsync();
    }

    public async Task<bool> ExisteUsernameAsync(string username, int? excludeId = null)
    {
        var q = _context.Set<Usuario>()
            .Where(u => u.Username == username);
        if (excludeId.HasValue)
            q = q.Where(u => u.Id != excludeId.Value);
        return await q.AnyAsync();
    }
}
