using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using POS.Application.Features.Auth.Commands;
using POS.Domain.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BC = BCrypt.Net.BCrypt;

namespace POS.Application.Features.Auth.Handlers;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse?>
{
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _config;

    public LoginCommandHandler(IUnitOfWork uow, IConfiguration config)
    {
        _uow = uow;
        _config = config;
    }

    public async Task<LoginResponse?> Handle(LoginCommand request, CancellationToken ct)
    {
        var usuario = await _uow.Usuarios.GetByUsernameAsync(request.Username);

        if (usuario == null) return null;

        if (usuario.Bloqueado)
        {
            throw new InvalidOperationException("Tu cuenta está bloqueada por demasiados intentos fallidos. Contacta al administrador.");
        }

        if (!BC.Verify(request.Password, usuario.PasswordHash))
        {
            usuario.IntentosFallidos++;
            if (usuario.IntentosFallidos >= 3)
            {
                usuario.Bloqueado = true;
            }
            _uow.Usuarios.Update(usuario);
            await _uow.CommitAsync(ct);
            return null;
        }

        // Generar tokens
        var token = GenerateJwtToken(usuario);
        var refreshToken = GenerateRefreshToken();

        // Login exitoso: Reiniciar intentos y guardar Refresh Token
        usuario.IntentosFallidos = 0;
        usuario.RefreshToken = refreshToken;
        usuario.RefreshTokenExpiryTime = DateTime.UtcNow.AddHours(4); // Expiración en 4 horas (media jornada)

        _uow.Usuarios.Update(usuario);
        await _uow.CommitAsync(ct);

        return new LoginResponse(
            token, 
            refreshToken, 
            usuario.Id,
            usuario.Username, 
            usuario.Nombre, 
            usuario.Apellido ?? string.Empty,
            usuario.Role?.Nombre ?? "Vendedor"
        );
    }

    private string GenerateJwtToken(POS.Domain.Entities.Usuario usuario)
    {
        var secret = _config["Jwt:Secret"] ?? "SuperSecretKeyQueDebeSerMasLargaParaProduccion123!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Role, usuario.Role?.Nombre ?? "Vendedor"),
            new Claim("NombreCompleto", usuario.Nombre)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15), // Expiración estándar a 15 minutos en UTC
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, LoginResponse?>
{
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _config;

    public RefreshTokenCommandHandler(IUnitOfWork uow, IConfiguration config)
    {
        _uow = uow;
        _config = config;
    }

    public async Task<LoginResponse?> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var principal = GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null) return null;

        var username = principal.Identity?.Name;
        if (string.IsNullOrEmpty(username)) return null;

        var usuario = await _uow.Usuarios.GetByUsernameAsync(username);
        if (usuario == null || 
            usuario.RefreshToken != request.RefreshToken || 
            usuario.RefreshTokenExpiryTime <= DateTime.UtcNow || 
            !usuario.Activo || 
            usuario.Bloqueado)
        {
            return null;
        }

        // Rotar tokens (Generar nuevos)
        var newAccessToken = GenerateJwtToken(usuario);
        var newRefreshToken = GenerateRefreshToken();

        usuario.RefreshToken = newRefreshToken;
        usuario.RefreshTokenExpiryTime = DateTime.UtcNow.AddHours(4); // Renovación a 4 horas

        _uow.Usuarios.Update(usuario);
        await _uow.CommitAsync(ct);

        return new LoginResponse(
            newAccessToken, 
            newRefreshToken, 
            usuario.Id,
            usuario.Username, 
            usuario.Nombre, 
            usuario.Apellido ?? string.Empty,
            usuario.Role?.Nombre ?? "Vendedor"
        );
    }

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            ValidAudience = _config["Jwt:Audience"],
            ValidIssuer = _config["Jwt:Issuer"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "SuperSecretKeyQueDebeSerMasLargaParaProduccion123!")),
            ValidateLifetime = false // Deshabilitar validación de expiración del token corto
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken || 
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }
            return principal;
        }
        catch
        {
            return null;
        }
    }

    private string GenerateJwtToken(POS.Domain.Entities.Usuario usuario)
    {
        var secret = _config["Jwt:Secret"] ?? "SuperSecretKeyQueDebeSerMasLargaParaProduccion123!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Role, usuario.Role?.Nombre ?? "Vendedor"),
            new Claim("NombreCompleto", usuario.Nombre)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15), // Renovación de 15 minutos en UTC
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
