using Microsoft.EntityFrameworkCore;
using POS.Domain.Entities;
using POS.Domain.Interfaces;
using POS.Infrastructure.Data;

namespace POS.Infrastructure.Repositories;

public class ClienteRepository : IClienteRepository
{
    private readonly POSDbContext _db;

    public ClienteRepository(POSDbContext db) => _db = db;

    public async Task<(IEnumerable<Cliente> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? searchBy = null,
        int page = 1,
        int pageSize = 25)
    {
        var query = _db.Clientes.AsNoTracking().AsQueryable();

        // Si hay búsqueda, filtra y devuelve hasta 50 sin paginación estricta
        if (!string.IsNullOrWhiteSpace(search))
        {
            if (string.Equals(searchBy, "nombre", StringComparison.OrdinalIgnoreCase))
                query = query.Where(c => c.Nombre.Contains(search));
            else if (string.Equals(searchBy, "apellido", StringComparison.OrdinalIgnoreCase))
                query = query.Where(c => c.Apellido.Contains(search));
            else if (string.Equals(searchBy, "identificacion", StringComparison.OrdinalIgnoreCase))
                query = query.Where(c => c.Identificacion.Contains(search));
            else
                query = query.Where(c =>
                    c.Nombre.Contains(search) ||
                    c.Apellido.Contains(search) ||
                    c.Identificacion.Contains(search));

            var searchResults = await query
                .OrderBy(c => c.Apellido).ThenBy(c => c.Nombre)
                .Take(50)
                .ToListAsync();
            return (searchResults, searchResults.Count);
        }

        // Sin búsqueda: paginación del servidor
        var totalCount = await query.CountAsync();

        var clampedPage = Math.Max(1, page);
        var clampedPageSize = Math.Clamp(pageSize, 10, 100);

        var items = await query
            .OrderBy(c => c.Apellido).ThenBy(c => c.Nombre)
            .Skip((clampedPage - 1) * clampedPageSize)
            .Take(clampedPageSize)
            .ToListAsync();

        return (items, totalCount);
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

    public void Delete(Cliente cliente) => _db.Clientes.Remove(cliente);

    public async Task<bool> HasHistoryAsync(int id) =>
        await _db.FacturasMaestro.AnyAsync(f => f.ClienteId == id);
}
