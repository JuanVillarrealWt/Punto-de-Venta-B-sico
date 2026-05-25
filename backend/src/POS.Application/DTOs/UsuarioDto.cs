namespace POS.Application.DTOs;

public class UsuarioDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? Cedula { get; set; }
    public string Email { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public string RoleNombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public bool Bloqueado { get; set; }
    public int IntentosFallidos { get; set; }
    public DateTime FechaCreacion { get; set; }
}

public class RolDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}
