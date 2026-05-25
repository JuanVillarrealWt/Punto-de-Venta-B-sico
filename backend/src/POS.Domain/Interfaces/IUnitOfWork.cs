using POS.Domain.Entities;

namespace POS.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IClienteRepository Clientes { get; }
    IProductoRepository Productos { get; }
    IFacturaRepository Facturas { get; }
    IUsuarioRepository Usuarios { get; }
    IGenericRepository<Rol> Roles { get; }
    IMovimientoStockRepository MovimientosStock { get; }
    IGenericRepository<ErrorLog> ErrorLogs { get; }
    IGenericRepository<MetodoPago> MetodosPago { get; }
    Task<int> CommitAsync(CancellationToken cancellationToken = default);
}
