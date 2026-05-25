namespace POS.Domain.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? Cedula { get; set; }
    public string Email { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public bool Activo { get; set; } = true;
    public bool Bloqueado { get; set; } = false;
    public int IntentosFallidos { get; set; } = 0;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Refresh Tokens
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Navegación
    public Rol? Role { get; set; }
}
