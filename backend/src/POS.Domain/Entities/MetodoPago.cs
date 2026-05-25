namespace POS.Domain.Entities;

public class MetodoPago
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
}
