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
    private IUsuarioRepository? _usuarios;
    private IGenericRepository<POS.Domain.Entities.Rol>? _roles;
    private IMovimientoStockRepository? _movimientosStock;
    private IGenericRepository<POS.Domain.Entities.ErrorLog>? _errorLogs;
    private IGenericRepository<POS.Domain.Entities.MetodoPago>? _metodosPago;

    public UnitOfWork(POSDbContext db) => _db = db;

    public IClienteRepository Clientes => _clientes ??= new ClienteRepository(_db);
    public IProductoRepository Productos => _productos ??= new ProductoRepository(_db);
    public IFacturaRepository Facturas => _facturas ??= new FacturaRepository(_db);
    public IUsuarioRepository Usuarios => _usuarios ??= new UsuarioRepository(_db);
    public IGenericRepository<POS.Domain.Entities.Rol> Roles => _roles ??= new GenericRepository<POS.Domain.Entities.Rol>(_db);
    public IMovimientoStockRepository MovimientosStock => _movimientosStock ??= new MovimientoStockRepository(_db);
    public IGenericRepository<POS.Domain.Entities.ErrorLog> ErrorLogs => _errorLogs ??= new GenericRepository<POS.Domain.Entities.ErrorLog>(_db);
    public IGenericRepository<POS.Domain.Entities.MetodoPago> MetodosPago => _metodosPago ??= new GenericRepository<POS.Domain.Entities.MetodoPago>(_db);

    public async Task<int> CommitAsync(CancellationToken cancellationToken = default)
        => await _db.SaveChangesAsync(cancellationToken);

    public void Dispose() => _db.Dispose();
}
