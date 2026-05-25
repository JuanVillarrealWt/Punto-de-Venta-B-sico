namespace POS.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IClienteRepository Clientes { get; }
    IProductoRepository Productos { get; }
    IFacturaRepository Facturas { get; }
    Task<int> CommitAsync(CancellationToken cancellationToken = default);
}
