using POS.Domain.Interfaces;
using POS.Infrastructure.Data;
using POS.Infrastructure.Repositories;

namespace POS.Infrastructure;

public class UnitOfWork : IUnitOfWork
{
    private readonly POSDbContext _db;
    private IClienteRepository? _clientes;
    private IProductoRepository? _productos;
    private IFacturaRepository? _facturas;

    public UnitOfWork(POSDbContext db) => _db = db;

    public IClienteRepository Clientes => _clientes ??= new ClienteRepository(_db);
    public IProductoRepository Productos => _productos ??= new ProductoRepository(_db);
    public IFacturaRepository Facturas => _facturas ??= new FacturaRepository(_db);

    public async Task<int> CommitAsync(CancellationToken cancellationToken = default)
        => await _db.SaveChangesAsync(cancellationToken);

    public void Dispose() => _db.Dispose();
}
