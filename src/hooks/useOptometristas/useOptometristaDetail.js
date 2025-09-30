/**
 * Hook personalizado para manejar la lógica del modal de detalle de optometrista
 * 
 * Proporciona funciones de formateo y utilidades para mostrar información
 * detallada de un optometrista de manera consistente.
 */
export const useOptometristaDetail = () => {

    /**
     * Formatear fecha completa
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    const formatFullDate = (dateString) => {
        if (!dateString) return 'No especificada';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    /**
     * Formatear número de teléfono
     * @param {string} telefono - Número de teléfono
     * @returns {string} Teléfono formateado
     */
    const formatTelefono = (telefono) => {
        if (!telefono) return 'No especificado';
        
        // Si ya tiene formato +503, mantenerlo
        if (telefono.startsWith('+503')) {
            return telefono;
        }
        
        // Si es un número de 8 dígitos, agregar +503
        if (telefono.length === 8 && /^\d+$/.test(telefono)) {
            return `+503 ${telefono}`;
        }
        
        return telefono;
    };

    /**
     * Obtener texto de disponibilidad
     * @param {boolean} disponible - Estado de disponibilidad
     * @returns {string} Texto descriptivo
     */
    const getDisponibilidadText = (disponible) => {
        return disponible === true ? 'Disponible' : 'No Disponible';
    };

    /**
     * Obtener color de disponibilidad
     * @param {boolean} disponible - Estado de disponibilidad
     * @returns {string} Color hexadecimal
     */
    const getDisponibilidadColor = (disponible) => {
        return disponible === true ? '#49AA4C' : '#D0155F';
    };

    /**
     * Obtener ícono de disponibilidad
     * @param {boolean} disponible - Estado de disponibilidad
     * @returns {string} Nombre del ícono
     */
    const getDisponibilidadIcon = (disponible) => {
        return disponible === true ? 'checkmark-circle' : 'close-circle';
    };

    /**
     * Obtener color de especialidad
     * @param {string} especialidad - Especialidad del optometrista
     * @returns {string} Color hexadecimal
     */
    const getEspecialidadColor = (especialidad) => {
        switch (especialidad?.toLowerCase()) {
            case 'general':
                return '#009BBF';
            case 'pediatria':
                return '#F59E0B';
            case 'optometria avanzada':
                return '#8B5CF6';
            case 'terapia visual':
                return '#10B981';
            case 'lentes de contacto':
                return '#EF4444';
            case 'baja vision':
                return '#6B7280';
            default:
                return '#009BBF';
        }
    };

    /**
     * Obtener ícono de especialidad
     * @param {string} especialidad - Especialidad del optometrista
     * @returns {string} Nombre del ícono
     */
    const getEspecialidadIcon = (especialidad) => {
        switch (especialidad?.toLowerCase()) {
            case 'general':
                return 'medical';
            case 'pediatria':
                return 'happy';
            case 'optometria avanzada':
                return 'analytics';
            case 'terapia visual':
                return 'eye';
            case 'lentes de contacto':
                return 'ellipse';
            case 'baja vision':
                return 'telescope';
            default:
                return 'medical';
        }
    };

    /**
     * Obtener iniciales del optometrista
     * @param {string} nombre - Nombre del optometrista
     * @param {string} apellido - Apellido del optometrista
     * @returns {string} Iniciales
     */
    const getInitials = (nombre, apellido) => {
        const initial1 = nombre?.charAt(0)?.toUpperCase() || '';
        const initial2 = apellido?.charAt(0)?.toUpperCase() || '';
        return initial1 + initial2 || 'OP';
    };

    /**
     * Obtener nombre completo del optometrista
     * @param {Object} empleado - Objeto empleado del optometrista
     * @returns {string} Nombre completo
     */
    const getFullName = (empleado) => {
        if (!empleado) return 'Optometrista';
        const nombre = empleado.nombre || '';
        const apellido = empleado.apellido || '';
        return `${nombre} ${apellido}`.trim() || 'Optometrista';
    };

    /**
     * Formatear años de experiencia
     * @param {string|number} experiencia - Años de experiencia
     * @returns {string} Experiencia formateada
     */
    const formatExperiencia = (experiencia) => {
        if (!experiencia) return '0 años';
        
        const años = parseInt(experiencia);
        if (isNaN(años)) return 'No especificada';
        
        return años === 1 ? '1 año' : `${años} años`;
    };

    /**
     * Formatear sucursales asignadas
     * @param {Array} sucursales - Array de IDs de sucursales
     * @returns {string} Sucursales formateadas
     */
    const formatSucursalesAsignadas = (sucursales) => {
        if (!sucursales || sucursales.length === 0) {
            return 'Sin sucursales asignadas';
        }
        
        // Mapear IDs a nombres de sucursales
        const sucursalMap = {
            '1': 'Sucursal Coatepeque',
            '2': 'Sucursal Escalón',
            '3': 'Sucursal Santa Rosa',
            '4': 'Sucursal Sonsonate',
            '5': 'Sucursal La Libertad'
        };
        
        const nombres = sucursales.map(id => sucursalMap[id] || 'Sucursal Desconocida');
        
        if (nombres.length === 1) {
            return nombres[0];
        } else if (nombres.length === 2) {
            return nombres.join(' y ');
        } else if (nombres.length <= 3) {
            return nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1];
        } else {
            return `${nombres.slice(0, 2).join(', ')} y ${nombres.length - 2} más`;
        }
    };

    /**
     * Formatear horarios de disponibilidad
     * @param {Array} disponibilidad - Array de horarios
     * @returns {string} Horarios formateados
     */
    const formatHorarios = (disponibilidad) => {
        if (!disponibilidad || disponibilidad.length === 0) {
            return 'Sin horarios configurados';
        }
        
        const diasConHorarios = disponibilidad.filter(d => d.horas && d.horas.length > 0);
        
        if (diasConHorarios.length === 0) {
            return 'Sin horarios configurados';
        }
        
        // Calcular total de horas
        const totalHoras = diasConHorarios.reduce((total, dia) => {
            return total + (dia.horas ? dia.horas.length : 0);
        }, 0);
        
        return `${diasConHorarios.length} días - ${totalHoras} horas semanales`;
    };

    /**
     * Calcular antigüedad desde una fecha
     * @param {string} fechaContratacion - Fecha de contratación
     * @returns {string} Antigüedad formateada
     */
    const getAntiguedad = (fechaContratacion) => {
        if (!fechaContratacion) return 'No especificada';
        
        try {
            const fechaInicio = new Date(fechaContratacion);
            const fechaActual = new Date();
            const diferenciaMilisegundos = fechaActual - fechaInicio;
            const diasDiferencia = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
            
            if (diasDiferencia < 30) {
                return `${diasDiferencia} días`;
            } else if (diasDiferencia < 365) {
                const meses = Math.floor(diasDiferencia / 30);
                return meses === 1 ? '1 mes' : `${meses} meses`;
            } else {
                const años = Math.floor(diasDiferencia / 365);
                const mesesRestantes = Math.floor((diasDiferencia % 365) / 30);
                
                if (mesesRestantes === 0) {
                    return años === 1 ? '1 año' : `${años} años`;
                } else {
                    return años === 1 
                        ? `1 año y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`
                        : `${años} años y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
                }
            }
        } catch (error) {
            return 'No calculable';
        }
    };

    // Retornar todas las funciones del hook
    return {
        formatFullDate,
        formatTelefono,
        getDisponibilidadText,
        getDisponibilidadColor,
        getDisponibilidadIcon,
        getEspecialidadColor,
        getEspecialidadIcon,
        getInitials,
        getFullName,
        formatExperiencia,
        formatSucursalesAsignadas,
        formatHorarios,
        getAntiguedad
    };
};