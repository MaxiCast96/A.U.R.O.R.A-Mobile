// hooks/promociones/useEditPromocion.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export const useEditPromocion = () => {
    const { getAuthHeaders } = useAuth();
    
    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipoDescuento, setTipoDescuento] = useState('porcentaje');
    const [valorDescuento, setValorDescuento] = useState('');
    const [aplicaA, setAplicaA] = useState('todos');
    const [categoriasAplicables, setCategoriasAplicables] = useState([]);
    const [lentesAplicables, setLentesAplicables] = useState([]);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [codigoPromo, setCodigoPromo] = useState('');
    const [activo, setActivo] = useState(true);
    const [prioridad, setPrioridad] = useState('0');
    const [mostrarEnCarrusel, setMostrarEnCarrusel] = useState(true);
    const [limiteUsos, setLimiteUsos] = useState('');
    
    // Estados de control
    const [loading, setLoading] = useState(false);
    const [promocionId, setPromocionId] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [errors, setErrors] = useState({});

    /**
     * Cargar datos de la promoción en el formulario
     */
    const loadPromocionData = (promocion) => {
        if (!promocion) return;
        
        setPromocionId(promocion._id);
        setNombre(promocion.nombre || '');
        setDescripcion(promocion.descripcion || '');
        setTipoDescuento(promocion.tipoDescuento || 'porcentaje');
        setValorDescuento(promocion.valorDescuento?.toString() || '');
        setAplicaA(promocion.aplicaA || 'todos');
        setCategoriasAplicables(promocion.categoriasAplicables || []);
        setLentesAplicables(promocion.lentesAplicables || []);
        setFechaInicio(promocion.fechaInicio ? new Date(promocion.fechaInicio).toISOString().split('T')[0] : '');
        setFechaFin(promocion.fechaFin ? new Date(promocion.fechaFin).toISOString().split('T')[0] : '');
        setCodigoPromo(promocion.codigoPromo || '');
        setActivo(promocion.activo !== undefined ? promocion.activo : true);
        setPrioridad(promocion.prioridad?.toString() || '0');
        setMostrarEnCarrusel(promocion.mostrarEnCarrusel !== undefined ? promocion.mostrarEnCarrusel : true);
        setLimiteUsos(promocion.limiteUsos?.toString() || '');
        setErrors({});
        
        setInitialData(promocion);
    };

    /**
     * Limpiar formulario
     */
    const clearForm = () => {
        setNombre('');
        setDescripcion('');
        setTipoDescuento('porcentaje');
        setValorDescuento('');
        setAplicaA('todos');
        setCategoriasAplicables([]);
        setLentesAplicables([]);
        setFechaInicio('');
        setFechaFin('');
        setCodigoPromo('');
        setActivo(true);
        setPrioridad('0');
        setMostrarEnCarrusel(true);
        setLimiteUsos('');
        setPromocionId(null);
        setInitialData(null);
        setErrors({});
    };

    /**
     * Validar campo individual
     */
    const validateField = (field, value) => {
        let error = null;
        
        switch (field) {
            case 'nombre':
                if (!value?.trim()) error = 'El nombre es obligatorio';
                break;
            case 'descripcion':
                if (!value?.trim()) error = 'La descripción es obligatoria';
                break;
            case 'valorDescuento':
                if (!value || Number(value) <= 0) error = 'El valor del descuento debe ser mayor a 0';
                if (tipoDescuento === 'porcentaje' && Number(value) > 100) error = 'El descuento por porcentaje no puede ser mayor a 100%';
                break;
            case 'fechaInicio':
                if (!value) error = 'La fecha de inicio es obligatoria';
                break;
            case 'fechaFin':
                if (!value) error = 'La fecha de fin es obligatoria';
                if (fechaInicio && value && new Date(value) <= new Date(fechaInicio)) {
                    error = 'La fecha de fin debe ser posterior a la fecha de inicio';
                }
                break;
            case 'codigoPromo':
                if (!value?.trim()) error = 'El código de promoción es obligatorio';
                break;
        }
        
        setErrors(prev => ({ ...prev, [field]: error }));
        return !error;
    };

    /**
     * Validar formulario completo
     */
    const validateForm = () => {
        const fieldsToValidate = {
            nombre,
            descripcion,
            valorDescuento,
            fechaInicio,
            fechaFin,
            codigoPromo,
        };

        let isValid = true;

        Object.keys(fieldsToValidate).forEach(field => {
            if (!validateField(field, fieldsToValidate[field])) {
                isValid = false;
            }
        });

        return isValid;
    };

    /**
     * Verificar si hay cambios
     */
    const hasChanges = () => {
        if (!initialData) return false;
        
        const currentData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            tipoDescuento,
            valorDescuento: Number(valorDescuento),
            aplicaA,
            categoriasAplicables,
            lentesAplicables,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            codigoPromo: codigoPromo.trim().toUpperCase(),
            activo,
            prioridad: Number(prioridad),
            mostrarEnCarrusel,
            limiteUsos: limiteUsos ? Number(limiteUsos) : null
        };
        
        // Comparar datos
        return JSON.stringify(currentData) !== JSON.stringify({
            ...initialData,
            fechaInicio: new Date(initialData.fechaInicio),
            fechaFin: new Date(initialData.fechaFin)
        });
    };

    /**
     * Actualizar promoción
     */
    const updatePromocion = async () => {
        if (!promocionId) {
            Alert.alert('Error', 'No se puede actualizar la promoción');
            return null;
        }

        if (!validateForm()) return null;

        if (!hasChanges()) {
            Alert.alert('Sin cambios', 'No se han detectado cambios en los datos de la promoción');
            return null;
        }

        setLoading(true);
        
        const promocionData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            tipoDescuento,
            valorDescuento: Number(valorDescuento),
            aplicaA,
            categoriasAplicables: aplicaA === 'categoria' ? categoriasAplicables : [],
            lentesAplicables: aplicaA === 'lente' ? lentesAplicables : [],
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            codigoPromo: codigoPromo.trim().toUpperCase(),
            activo,
            prioridad: Number(prioridad),
            mostrarEnCarrusel,
            limiteUsos: limiteUsos ? Number(limiteUsos) : null
        };

        try {
            const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/promociones/${promocionId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(promocionData),
            });

            const responseData = await response.json();

            if (response.ok) {
                clearForm();
                return responseData.promocion;
            } else {
                throw new Error(responseData.message || 'Error al actualizar promoción');
            }
        } catch (error) {
            console.error('Error updating promocion:', error);
            Alert.alert('Error', error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        // Estados del formulario
        nombre,
        setNombre,
        descripcion,
        setDescripcion,
        tipoDescuento,
        setTipoDescuento,
        valorDescuento,
        setValorDescuento,
        aplicaA,
        setAplicaA,
        categoriasAplicables,
        setCategoriasAplicables,
        lentesAplicables,
        setLentesAplicables,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        codigoPromo,
        setCodigoPromo,
        activo,
        setActivo,
        prioridad,
        setPrioridad,
        mostrarEnCarrusel,
        setMostrarEnCarrusel,
        limiteUsos,
        setLimiteUsos,
        
        // Estados de control
        loading,
        promocionId,
        initialData,
        errors,
        
        // Funciones
        loadPromocionData,
        clearForm,
        validateField,
        validateForm,
        hasChanges,
        updatePromocion,
    };
};