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
            .ForMember(d => d.ClienteNombre, o => o.MapFrom(s => s.Cliente != null ? $"{s.Cliente.Nombre} {s.Cliente.Apellido}" : "CONSUMIDOR FINAL"))
            .ForMember(d => d.ClienteIdentificacion, o => o.MapFrom(s => s.Cliente != null ? s.Cliente.Identificacion : ""))
            .ForMember(d => d.VendedorNombre, o => o.MapFrom(s => s.Usuario != null ? s.Usuario.Nombre : "SISTEMA"))
            .ForMember(d => d.MetodoPagoNombre, o => o.MapFrom(s => s.MetodoPago != null ? s.MetodoPago.Nombre : "EFECTIVO"));

        CreateMap<FacturaDetalle, FacturaDetalleDto>();

        // Usuarios y Roles
        CreateMap<Usuario, UsuarioDto>()
            .ForMember(d => d.RoleNombre, o => o.MapFrom(s => s.Role != null ? s.Role.Nombre : ""));
        
        CreateMap<Rol, RolDto>();
    }
}
