import { useState, useEffect } from 'react';
import { usuariosApi, type Usuario, type Rol } from '../api';
import { 
  UserPlusIcon, 
  LockClosedIcon, 
  LockOpenIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuthStore } from '../store/authStore';

// ─── Helpers de validación (frontend) ───────────────────────────────────────
const SOLO_LETRAS   = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$/;
const EMAIL_REGEX   = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const CEDULA_EC     = /^(0[1-9]|1[0-9]|2[0-4])\d{8}$/;
const USERNAME_RX   = /^[a-zA-Z0-9_]+$/;
const capitalizeFirst = (s: string) =>
  s.length === 0 ? '' : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

interface UsuarioFormData {
  username: string;
  cedula: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellido: string;
  email: string;
  roleId: number;
  activo: boolean;
  bloqueado: boolean;
}

function validarCamposUsuario(data: UsuarioFormData, isEditing: boolean): Record<string, string> {
  const err: Record<string, string> = {};

  if (!data.username)
    err.username = 'El username es requerido.';
  else if (!USERNAME_RX.test(data.username))
    err.username = 'Solo letras, números y guión bajo, sin espacios.';

  if (!data.cedula)
    err.cedula = 'La cédula es requerida.';
  else if (!CEDULA_EC.test(data.cedula))
    err.cedula = 'Debe ser cédula ecuatoriana válida de 10 dígitos.';

  if (!data.nombre)
    err.nombre = 'El nombre es requerido.';
  else if (!SOLO_LETRAS.test(data.nombre))
    err.nombre = 'Solo letras, sin espacios ni números.';

  if (!data.apellido)
    err.apellido = 'El apellido es requerido.';
  else if (!SOLO_LETRAS.test(data.apellido))
    err.apellido = 'Solo letras, sin espacios ni números.';

  if (!data.email)
    err.email = 'El correo es requerido.';
  else if (!EMAIL_REGEX.test(data.email))
    err.email = 'Correo inválido: necesita @, punto y dominio.';

  // Contraseña requerida solo al crear
  if (!isEditing && !data.password)
    err.password = 'La contraseña es requerida.';

  return err;
}

// Componente de error inline
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{msg}</p>;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  
  const [formData, setFormData] = useState<UsuarioFormData>({
    username: '',
    cedula: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    email: '',
    roleId: 0,
    activo: true,
    bloqueado: false
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const currentUser = useAuthStore(state => state.user);

  // Validación de complejidad de contraseña
  const passwordRules = [
    { label: 'Mínimo 8, máximo 10 caracteres', ok: formData.password.length >= 8 && formData.password.length <= 10 },
    { label: 'Al menos una mayúscula (A-Z)', ok: /[A-Z]/.test(formData.password) },
    { label: 'Al menos una minúscula (a-z)', ok: /[a-z]/.test(formData.password) },
    { label: 'Al menos un número (0-9)', ok: /[0-9]/.test(formData.password) },
    { label: 'Al menos un carácter especial (!@#$...)', ok: /[^a-zA-Z0-9]/.test(formData.password) },
  ];
  const passwordValid = passwordRules.every(r => r.ok);
  const passwordsMatch = formData.password === formData.confirmPassword;
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      const uRes = await usuariosApi.getAll().catch(() => ({ data: [] }));
      const rRes = await usuariosApi.getRoles().catch(() => ({ data: [] }));
      
      const userList = Array.isArray(uRes.data) ? uRes.data : [];
      const roleList = Array.isArray(rRes.data) ? rRes.data : [];

      setUsuarios(userList);
      setRoles(roleList);
      
      if (!selectedUser && roleList.length > 0) {
        setFormData(prev => ({ ...prev, roleId: roleList[0].id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Error crítico al cargar personal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openCreate = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      cedula: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      apellido: '',
      email: '',
      roleId: roles.length > 0 ? roles[0].id : 0,
      activo: true,
      bloqueado: false
    });
    setFieldErrors({});
    setTouched({});
    setIsModalOpen(true);
  };

  const requestCloseModal = () => {
    setConfirmCloseOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setConfirmCloseOpen(false);
  };

  const requestDelete = (u: Usuario) => {
    setUserToDelete(u);
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await usuariosApi.delete(userToDelete.id);
      toast.success('Usuario eliminado');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'No se pudo eliminar');
    } finally {
      closeDeleteConfirm();
    }
  };

  const openEdit = (u: Usuario) => {
    if (!u) return;
    setSelectedUser(u);
    setFormData({
      username: u.username || '',
      cedula: u.cedula || '',
      password: '',
      confirmPassword: '',
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      email: u.email || '',
      roleId: u.roleId || (roles.length > 0 ? roles[0].id : 0),
      activo: u.activo ?? true,
      bloqueado: u.bloqueado ?? false
    });
    setFieldErrors({});
    setTouched({});
    setIsModalOpen(true);
  };

  // Manejo de cambios con filtrado de teclas
  const handleChange = (field: keyof UsuarioFormData, value: string | number | boolean) => {
    let sanitized = value;

    if (typeof value === 'string') {
      if (field === 'cedula') {
        sanitized = value.replace(/\D/g, '');
      }
      // Solo letras puras + primera en mayúscula en nombre y apellido
      if (field === 'nombre' || field === 'apellido') {
        sanitized = capitalizeFirst(value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, ''));
      }
      // Username: sin espacios, solo alfanumérico + guión bajo
      if (field === 'username') {
        sanitized = value.replace(/[^a-zA-Z0-9_]/g, '');
      }
    }

    const next = { ...formData, [field]: sanitized };
    setFormData(next);
    setTouched(prev => ({ ...prev, [field]: true }));
    setFieldErrors(validarCamposUsuario(next, !!selectedUser));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFieldErrors(validarCamposUsuario(formData, !!selectedUser));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (formData.roleId === 0 && roles.length > 0) {
      return toast.error('Debe seleccionar un rol');
    }

    // Marcar todos los campos como tocados
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const errors = validarCamposUsuario(formData, !!selectedUser);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Corrige los errores antes de guardar.');
      return;
    }

    const isChangingPassword = !selectedUser || formData.password.length > 0;
    if (isChangingPassword) {
      if (!passwordValid) {
        return toast.error('La contraseña no cumple los requisitos de seguridad.');
      }
      if (!passwordsMatch) {
        return toast.error('Las contraseñas no coinciden.');
      }
    }

    setSaving(true);
    try {
      const { confirmPassword, ...payload } = formData;
      if (selectedUser) {
        await usuariosApi.update(selectedUser.id, { ...payload, id: selectedUser.id });
        toast.success('Cambios guardados');
      } else {
        await usuariosApi.create(payload);
        toast.success('Personal registrado');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.isWarning) {
        toast(data.error, { icon: '⚠️', style: { background: '#fef9c3', color: '#a16207', fontWeight: 'bold' } });
      } else {
        toast.error(data?.error || 'No se pudo completar la acción');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBloqueo = async (id: number) => {
    try {
      await usuariosApi.toggleBloqueo(id);
      toast.success('Estado actualizado');
      loadData();
    } catch { toast.error('No se pudo cambiar el estado'); }
  };

  // Clases de input con estado de error
  const inputClass = (field: string, extra = '') =>
    `w-full bg-zinc-50 border px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none transition-all ${extra} ${
      touched[field] && fieldErrors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-zinc-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
    }`;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
      <div className="w-14 h-14 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-lg shadow-emerald-500/5" />
      <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando Personal...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
             <ShieldCheckIcon className="w-7 h-7 text-white" />
           </div>
           <div>
            <h1 className="text-2xl font-black text-zinc-800 tracking-tighter">Panel de <span className="text-emerald-600">Personal</span></h1>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-0.5">Control de Accesos y Seguridad</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={openCreate} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95">
            <UserPlusIcon className="w-4 h-4" /> NUEVO
          </button>
          
          <div className="hidden sm:flex items-center gap-3 bg-emerald-50 px-6 py-3.5 rounded-2xl border border-emerald-100">
            <ClockIcon className="w-6 h-6 text-emerald-600 animate-pulse" />
            <div className="text-right">
              <div className="text-xl font-black text-zinc-800 font-mono leading-none tracking-tighter">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">
                {currentTime.toLocaleDateString([], { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.isArray(usuarios) && usuarios.map(u => (
          <div key={u?.id || Math.random()} className={`bg-white border p-6 rounded-2xl transition-all group relative overflow-hidden shadow-sm ${u?.bloqueado ? 'border-red-200 bg-red-50/30' : 'border-zinc-200 hover:border-emerald-200 hover:shadow-md'}`}>
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${u?.bloqueado ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                <UserIcon className="w-7 h-7" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(u)} className="p-3 text-zinc-400 hover:text-emerald-600 bg-zinc-50 rounded-xl border border-zinc-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all"><PencilSquareIcon className="w-4.5 h-4.5" /></button>
                <button onClick={() => u?.id && handleToggleBloqueo(u.id)} className={`p-3 transition-all rounded-xl border ${u?.bloqueado ? 'bg-red-50 text-red-600 border-red-200' : 'bg-zinc-50 text-zinc-400 hover:text-red-600 border-zinc-200 hover:border-red-200 hover:bg-red-50'}`}>
                  {u?.bloqueado ? <LockClosedIcon className="w-4.5 h-4.5" /> : <LockOpenIcon className="w-4.5 h-4.5" />}
                </button>
                {u?.roleNombre !== 'Administrador' && currentUser?.id !== u?.id && (
                  <button onClick={() => requestDelete(u)} className="p-3 text-zinc-400 hover:text-red-600 bg-zinc-50 rounded-xl border border-zinc-200 hover:border-red-200 hover:bg-red-50 transition-all">
                    <TrashIcon className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-black text-zinc-800 tracking-tighter leading-tight truncate">{u?.nombre || 'S/N'} {u?.apellido || ''}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${u?.roleNombre === 'Administrador' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>
                    {u?.roleNombre || 'Personal'}
                  </span>
                  {u?.activo ? <span className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5" /> ACTIVO</span> : <span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1.5"><XCircleIcon className="w-3.5 h-3.5" /> INACTIVO</span>}
                </div>
              </div>
              <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-100 space-y-3">
                <div className="flex items-center gap-3">
                   <IdentificationIcon className="w-4 h-4 text-zinc-400" />
                   <span className="text-[11px] font-black text-zinc-600">@{u?.username || 'unknown'}</span>
                </div>
                <div className="flex items-center gap-3">
                   <EnvelopeIcon className="w-4 h-4 text-zinc-400" />
                   <span className="text-[11px] font-bold text-zinc-500 truncate">{u?.email || 'no-email@store.com'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario de Registro */}
      <Modal isOpen={isModalOpen} onClose={requestCloseModal} title={selectedUser ? 'ACTUALIZAR ACCESOS' : 'CREAR NUEVO PERFIL'}>
        <div className="bg-white rounded-2xl p-8 shadow-xl text-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="flex justify-between items-center pb-6 border-b-2 border-emerald-500/20 mb-6">
            <div>
              <h2 className="text-2xl font-black text-emerald-700 tracking-tighter">ABARROTES VILLARREAL</h2>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{selectedUser ? 'Actualizar Personal' : 'Registrar Personal'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Username */}
              <div className="md:col-span-2 bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Identificador (Username)</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    value={formData.username}
                    onChange={e => handleChange('username', e.target.value)}
                    onBlur={() => handleBlur('username')}
                    className={`w-full bg-white border pl-12 pr-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none transition-all ${
                      touched.username && fieldErrors.username
                        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-zinc-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                    }`}
                    placeholder="ej: admin_villarreal"
                  />
                </div>
                <FieldError msg={touched.username ? fieldErrors.username : undefined} />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Cédula</label>
                <input
                  value={formData.cedula}
                  onChange={e => handleChange('cedula', e.target.value)}
                  onBlur={() => handleBlur('cedula')}
                  maxLength={10}
                  inputMode="numeric"
                  className={inputClass('cedula')}
                  placeholder="Ej: 1802288996"
                />
                <FieldError msg={touched.cedula ? fieldErrors.cedula : undefined} />
              </div>

              {/* Nombre */}
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Nombre</label>
                <input
                  value={formData.nombre}
                  onChange={e => handleChange('nombre', e.target.value)}
                  onBlur={() => handleBlur('nombre')}
                  className={inputClass('nombre')}
                  placeholder="Ej: Juan"
                />
                <FieldError msg={touched.nombre ? fieldErrors.nombre : undefined} />
              </div>

              {/* Apellido */}
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Apellido</label>
                <input
                  value={formData.apellido}
                  onChange={e => handleChange('apellido', e.target.value)}
                  onBlur={() => handleBlur('apellido')}
                  className={inputClass('apellido')}
                  placeholder="Ej: Pérez"
                />
                <FieldError msg={touched.apellido ? fieldErrors.apellido : undefined} />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Correo Electrónico</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full bg-zinc-50 border pl-12 pr-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none transition-all ${
                      touched.email && fieldErrors.email
                        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-zinc-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                    }`}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <FieldError msg={touched.email ? fieldErrors.email : undefined} />
              </div>

              {/* Rol */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Rol de Usuario</label>
                <div className="relative">
                  <select
                    value={formData.roleId}
                    onChange={e => handleChange('roleId', Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer appearance-none"
                  >
                    {roles.length === 0 ? (
                      <option value={0}>Cargando roles disponibles...</option>
                    ) : (
                      roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)
                    )}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 font-black">▾</div>
                </div>
              </div>

              {/* Contraseña */}
              <div className="md:col-span-2 bg-zinc-50 p-5 rounded-xl border border-zinc-200 space-y-4">
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block ml-1">Contraseña de Seguridad</label>
                <div className="relative">
                  <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!selectedUser}
                    value={formData.password}
                    onChange={e => handleChange('password', e.target.value)}
                    className="w-full bg-white border border-zinc-200 pl-12 pr-12 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder={selectedUser ? '•••••••• (dejar vacío para no cambiar)' : 'Min 8 · Max 10 · Mayús · Núm · Especial'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon className="w-4.5 h-4.5" /> : <EyeIcon className="w-4.5 h-4.5" />}
                  </button>
                </div>

                {/* Indicadores de requisitos */}
                {(formData.password.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {passwordRules.map((rule, i) => (
                      <div key={i} className={`flex items-center gap-2 text-[10px] font-bold rounded-lg px-3 py-1.5 transition-all ${
                        rule.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                      }`}>
                        <span className={`text-xs ${rule.ok ? 'text-emerald-600' : 'text-zinc-300'}`}>{rule.ok ? '✓' : '○'}</span>
                        {rule.label}
                      </div>
                    ))}
                  </div>
                )}

                {/* Confirmar contraseña */}
                {(formData.password.length > 0) && (
                  <div className="relative">
                    <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)}
                      className={`w-full bg-white border pl-12 pr-12 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none transition-all ${
                        formData.confirmPassword.length > 0
                          ? (passwordsMatch ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-red-300 ring-2 ring-red-100')
                          : 'border-zinc-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                      }`}
                      placeholder="Confirmar contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="w-4.5 h-4.5" /> : <EyeIcon className="w-4.5 h-4.5" />}
                    </button>
                    {formData.confirmPassword.length > 0 && (
                      <span className={`absolute right-10 top-1/2 -translate-y-1/2 text-xs font-black ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                        {passwordsMatch ? '✓ Coincide' : '✗ No coincide'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t-2 border-emerald-500/10">
              <button type="button" onClick={requestCloseModal} disabled={saving} className="flex-1 py-3.5 border-2 border-zinc-200 text-zinc-500 hover:bg-zinc-50 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50">DESCARTAR</button>
              <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-600/20 transition-all">
                {saving ? 'GUARDANDO...' : (selectedUser ? 'GUARDAR CAMBIOS' : 'CONFIRMAR REGISTRO')}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        onConfirm={closeModal}
        title="SALIR"
        message="¿Estás seguro? Perderás los datos ingresados."
        confirmText="SÍ, SALIR"
        type="warning"
      />

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title="ELIMINAR USUARIO"
        message="¿Estás seguro? Perderás los datos ingresados."
        confirmText="ELIMINAR"
        type="danger"
      />
    </div>
  );
}
