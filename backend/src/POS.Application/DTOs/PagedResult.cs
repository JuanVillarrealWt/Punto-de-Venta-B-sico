namespace POS.Application.DTOs;

/// <summary>
/// Wrapper genérico para respuestas paginadas del servidor.
/// Permite al frontend saber el total de registros y la página actual.
/// </summary>
public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}
