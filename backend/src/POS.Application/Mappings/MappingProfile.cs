using AutoMapper;
using POS.Domain.Entities;
using POS.Application.DTOs;

namespace POS.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Cliente
        CreateMap<Cliente, ClienteDto>();

        // Producto
        CreateMap<Producto, ProductoDto>();

        // Factura
        CreateMap<FacturaMaestro, FacturaDto>()
            .ForMember(d => d.ClienteNombre, o => o.MapFrom(s => $"{s.Cliente.Nombre} {s.Cliente.Apellido}"))
            .ForMember(d => d.ClienteIdentificacion, o => o.MapFrom(s => s.Cliente.Identificacion));

        CreateMap<FacturaDetalle, FacturaDetalleDto>();
    }
}
