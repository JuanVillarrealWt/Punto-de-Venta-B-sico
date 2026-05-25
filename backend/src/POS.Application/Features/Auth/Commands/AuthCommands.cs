using MediatR;

namespace POS.Application.Features.Auth.Commands;

public record LoginCommand(string Username, string Password) : IRequest<LoginResponse?>;

public record LoginResponse(string Token, string RefreshToken, string Username, string Nombre, string Role);

public record RefreshTokenCommand(string AccessToken, string RefreshToken) : IRequest<LoginResponse?>;
