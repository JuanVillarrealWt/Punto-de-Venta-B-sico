namespace POS.Domain.Entities;

public class Cliente
{
    public int Id { get; set; }
    public string Identificacion { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public bool Activo { get; set; } = true;

    // Navigation
    public ICollection<FacturaMaestro> Facturas { get; set; } = new List<FacturaMaestro>();
}
