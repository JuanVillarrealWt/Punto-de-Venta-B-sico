using Microsoft.EntityFrameworkCore;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using POS.Infrastructure.Data;

namespace POS.Infrastructure.Repositories;

public class ClienteRepository : IClienteRepository
{
    private readonly POSDbContext _db;

    public ClienteRepository(POSDbContext db) => _db = db;

    public async Task<IEnumerable<Cliente>> GetAllAsync(string? search = null, string? searchBy = null)
    {
        var query = _db.Clientes.AsNoTracking().Where(c => c.Activo);
        if (!string.IsNullOrWhiteSpace(search))
        {
            if (string.Equals(searchBy, "nombre", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Nombre.Contains(search) || c.Apellido.Contains(search));
            }
            else if (string.Equals(searchBy, "identificacion", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Identificacion.Contains(search));
            }
            else
            {
                query = query.Where(c =>
                    c.Nombre.Contains(search) ||
                    c.Apellido.Contains(search) ||
                    c.Identificacion.Contains(search));
            }
            // Limit search results to top 50 for performance
            return await query.OrderBy(c => c.Apellido).ThenBy(c => c.Nombre).Take(50).ToListAsync();
        }
        
        return await query.OrderBy(c => c.Apellido).ThenBy(c => c.Nombre).ToListAsync();
    }

    public async Task<Cliente?> GetByIdAsync(int id) =>
        await _db.Clientes.FindAsync(id);

    public async Task<Cliente?> GetByIdentificacionAsync(string identificacion) =>
        await _db.Clientes.FirstOrDefaultAsync(c => c.Identificacion == identificacion);

    public async Task<Cliente> AddAsync(Cliente cliente)
    {
        await _db.Clientes.AddAsync(cliente);
        return cliente;
    }

    public void Update(Cliente cliente) => _db.Clientes.Update(cliente);
    public void Delete(Cliente cliente)
    {
        cliente.Activo = false;
        _db.Clientes.Update(cliente);
    }
}
