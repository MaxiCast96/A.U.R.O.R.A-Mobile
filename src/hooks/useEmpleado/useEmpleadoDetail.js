import { useState } from 'react';

/**
 * Hook personalizado para gestionar la vista de detalles del empleado
 * 
 * Este hook encapsula la lógica relacionada con:
 * - Estados de control del modal de detalle
 * - Funciones de formateo de datos del empleado
 * - Funciones de utilidad para mostrar información
 * 
 * @returns {Object} Objeto con estados y funciones para el modal de detalle
 */
export const useEmpleadoDetail = () => {
    
    /**
     * Formatear fecha para mostrar completa
     */
    const formatFullDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Formatear teléfono para mostrar
     */
    const formatTelefono = (telefono) => {
        if (!telefono) return 'No disponible';
        // Si ya tiene formato +503, mantenerlo
        if (telefono.startsWith('+503')) {
            return telefono;
        }
        // Si es solo números, agregar +503
        return `+503 ${telefono}`;
    };

    /**
     * Formatear salario
     */
    const formatSalario = (salario) => {
        if (!salario) return '$0.00';
        return `$${parseFloat(salario).toFixed(2)} USD`;
    };

    /**
     * Obtener el estado en español
     */
    const getEstadoText = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activo':
                return 'Activo';
            case 'inactivo':
                return 'Inactivo';
            default:
                return 'Sin estado';
        }
    };

    /**
     * Obtener el color del estado
     */
    const getEstadoColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activo':
                return '#49AA4C';
            case 'inactivo':
                return '#D0155F';
            default:
                return '#666666';
        }
    };

    /**
     * Obtener el ícono del estado
     */
    const getEstadoIcon = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activo':
                return 'checkmark-circle';
            case 'inactivo':
                return 'pause-circle';
            default:
                return 'help-circle';
        }
    };

    /**
     * Obtener el color del cargo
     */
    const getCargoColor = (cargo) => {
        switch (cargo?.toLowerCase()) {
            case 'gerente':
                return '#D0155F';
            case 'optometrista':
                return '#009BBF';
            case 'administrador':
                return '#8B5CF6';
            case 'vendedor':
                return '#F59E0B';
            case 'técnico':
                return '#49AA4C';
            case 'recepcionista':
                return '#6B7280';
            default:
                return '#009BBF';
        }
    };

    /**
     * Obtener el ícono del cargo
     */
    const getCargoIcon = (cargo) => {
        switch (cargo?.toLowerCase()) {
            case 'gerente':
                return 'business';
            case 'optometrista':
                return 'eye';
            case 'administrador':
                return 'settings';
            case 'vendedor':
                return 'storefront';
            case 'técnico':
                return 'construct';
            case 'recepcionista':
                return 'people';
            default:
                return 'person';
        }
    };

    /**
     * Obtener iniciales del empleado
     */
    const getInitials = (nombre, apellido) => {
        const initial1 = nombre?.charAt(0)?.toUpperCase() || '';
        const initial2 = apellido?.charAt(0)?.toUpperCase() || '';
        return initial1 + initial2 || 'EM';
    };

    /**
     * Obtener nombre completo del empleado
     */
    const getFullName = (empleado) => {
        return `${empleado.nombre || ''} ${empleado.apellido || ''}`.trim();
    };

    /**
     * Obtener nombre de sucursal
     */
    const getSucursalName = (empleado) => {
        return empleado.sucursalId?.nombre || empleado.sucursal || 'Sin sucursal';
    };

    /**
     * Obtener dirección completa formateada
     */
    const getFullAddress = (empleado) => {
        if (!empleado.direccion) return 'Dirección no disponible';
        
        const { calle, ciudad, departamento } = empleado.direccion;
        const parts = [];
        
        if (calle) parts.push(calle);
        if (ciudad) parts.push(ciudad);
        if (departamento) parts.push(departamento);
        
        return parts.length > 0 ? parts.join(', ') : 'Dirección no disponible';
    };

    /**
     * Calcular antigüedad del empleado
     */
    const getAntiguedad = (fechaContratacion) => {
        if (!fechaContratacion) return 'No disponible';
        
        const fecha = new Date(fechaContratacion);
        const hoy = new Date();
        const diffTime = Math.abs(hoy - fecha);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            return `${diffDays} días`;
        } else if (diffDays < 365) {
            const meses = Math.floor(diffDays / 30);
            return `${meses} mes${meses !== 1 ? 'es' : ''}`;
        } else {
            const años = Math.floor(diffDays / 365);
            const mesesRestantes = Math.floor((diffDays % 365) / 30);
            if (mesesRestantes > 0) {
                return `${años} año${años !== 1 ? 's' : ''} y ${mesesRestantes} mes${mesesRestantes !== 1 ? 'es' : ''}`;
            }
            return `${años} año${años !== 1 ? 's' : ''}`;
        }
    };

    return {
        // Funciones de formateo
        formatFullDate,
        formatTelefono,
        formatSalario,
        
        // Funciones de estado
        getEstadoText,
        getEstadoColor,
        getEstadoIcon,
        
        // Funciones de cargo
        getCargoColor,
        getCargoIcon,
        
        // Funciones de utilidad
        getInitials,
        getFullName,
        getSucursalName,
        getFullAddress,
        getAntiguedad
    };
};