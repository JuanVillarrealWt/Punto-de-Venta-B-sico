using POS.Domain.Entities;

namespace POS.Domain.Interfaces;

public interface IFacturaRepository
{
    Task<IEnumerable<FacturaMaestro>> GetAllAsync(DateTime? desde = null, DateTime? hasta = null, string? searchCliente = null, string? searchBy = null, int? usuarioId = null);
    Task<FacturaMaestro?> GetByIdAsync(int id);
    Task<FacturaMaestro?> GetByNumeroAsync(string numero);
    Task<string> GetSiguienteNumeroAsync();
    Task<FacturaMaestro> AddAsync(FacturaMaestro factura);
    Task<FacturaMaestro?> AnularAsync(int id);
}
