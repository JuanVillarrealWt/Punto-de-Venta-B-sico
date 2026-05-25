namespace POS.Domain.Entities;

public class MovimientoStock
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty; // ENTRADA, SALIDA, AJUSTE
    public int Cantidad { get; set; }
    public int StockAnterior { get; set; }
    public int StockNuevo { get; set; }
    public string? Referencia { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public int UsuarioId { get; set; }

    // Navegación
    public Producto? Producto { get; set; }
    public Usuario? Usuario { get; set; }
}
