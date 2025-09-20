import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { 
    formatDUI, 
    formatTelefono, 
    getTelefonoNumbers,
    getFieldError,
    validateDUI,
    validateTelefono,
    validateEmail,
    validateRequired,
    validateEdad,
    validatePassword
} from '../../utils/validators';

/**
 * Hook personalizado para gestionar la edición de clientes existentes
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Estados del formulario de editar cliente
 * - Carga de datos del cliente existente
 * - Validación de campos con formateo automático
 * - Envío de datos actualizados al servidor
 * - Limpieza del formulario
 * - Manejo de estados de carga
 * 
 * @returns {Object} Objeto con estados y funciones para editar clientes
 */
export const useEditCliente = () => {
    const { getAuthHeaders } = useAuth();
    
    // ===========================================
    // ESTADOS DEL FORMULARIO
    // ===========================================
    // Información Personal
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [edad, setEdad] = useState('');
    const [dui, setDui] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');

    // Información de Residencia
    const [departamento, setDepartamento] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccionCompleta, setDireccionCompleta] = useState('');

    // Estado y Seguridad
    const [estado, setEstado] = useState('Activo');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [clienteId, setClienteId] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [errors, setErrors] = useState({});

    // ===========================================
    // FUNCIONES DE INICIALIZACIÓN
    // ===========================================

    /**
     * Cargar datos del cliente existente en el formulario
     * @param {Object} cliente - Objeto con los datos del cliente
     */
    const loadClienteData = (cliente) => {
        if (!cliente) return;
        
        setClienteId(cliente._id);
        setNombre(cliente.nombre || '');
        setApellido(cliente.apellido || '');
        setEdad(cliente.edad?.toString() || '');
        setDui(cliente.dui || '');
        
        // Formatear teléfono con +503 si no lo tiene
        const telefonoFormatted = cliente.telefono 
            ? (cliente.telefono.startsWith('+503') 
                ? cliente.telefono 
                : `+503 ${cliente.telefono}`)
            : '';
        setTelefono(telefonoFormatted);
        
        setCorreo(cliente.correo || '');
        
        // Cargar dirección
        if (cliente.direccion) {
            setDepartamento(cliente.direccion.departamento || '');
            setCiudad(cliente.direccion.ciudad || '');
            setDireccionCompleta(cliente.direccion.calle || '');
        } else {
            setDepartamento('');
            setCiudad('');
            setDireccionCompleta('');
        }
        
        setEstado(cliente.estado || 'Activo');
        setPassword(''); // No cargar contraseña por seguridad
        setShowPassword(false);
        setErrors({});
        
        // Guardar datos iniciales para comparación
        setInitialData(cliente);
    };

    // ===========================================
    // FUNCIONES DE FORMATEO
    // ===========================================

    /**
     * Manejar cambio en el DUI con formateo automático
     */
    const handleDUIChange = (value) => {
        const formattedDUI = formatDUI(value);
        setDui(formattedDUI);
        
        // Validar en tiempo real si ya tiene la longitud completa
        if (formattedDUI.length === 10) {
            validateField('dui', formattedDUI);
        } else if (errors.dui) {
            setErrors(prev => ({ ...prev, dui: null }));
        }
    };

    /**
     * Manejar cambio en el teléfono con formateo automático
     */
    const handleTelefonoChange = (value) => {
        const formattedTelefono = formatTelefono(value);
        setTelefono(formattedTelefono);
        
        // Validar en tiempo real
        const numbers = getTelefonoNumbers(formattedTelefono);
        if (numbers.length === 8) {
            validateField('telefono', formattedTelefono);
        } else if (errors.telefono) {
            setErrors(prev => ({ ...prev, telefono: null }));
        }
    };

    /**
     * Manejar cambio de departamento
     */
    const handleDepartamentoChange = (value) => {
        setDepartamento(value);
        setCiudad(''); // Limpiar ciudad cuando cambia departamento
        
        if (value) {
            setErrors(prev => ({ ...prev, departamento: null }));
        }
    };

    // ===========================================
    // FUNCIONES DE VALIDACIÓN
    // ===========================================

    /**
     * Validar un campo específico
     */
    const validateField = (field, value) => {
        let error = null;
        
        // Para contraseña en edición, solo validar si no está vacía
        if (field === 'password') {
            if (value && value.length < 6) {
                error = 'La contraseña debe tener al menos 6 caracteres';
            }
        } else {
            error = getFieldError(field, value);
        }
        
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
        return !error;
    };

    /**
     * Validar formulario completo antes de enviar
     */
    const validateForm = () => {
        const newErrors = {};
        
        // Validar campos requeridos (excluyendo contraseña que es opcional en edición)
        const requiredFields = {
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo
        };

        let isValid = true;

        Object.keys(requiredFields).forEach(field => {
            const error = getFieldError(field, requiredFields[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        // Validar contraseña solo si se está cambiando
        if (password && password.trim() !== '' && password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    /**
     * Verificar si hay cambios en los datos
     */
    const hasChanges = () => {
        if (!initialData) return false;
        
        const currentData = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            edad: Number(edad),
            dui: dui.trim(),
            telefono: getTelefonoNumbers(telefono),
            correo: correo.trim().toLowerCase(),
            estado: estado,
            direccion: {
                departamento: departamento.trim(),
                ciudad: ciudad.trim(),
                calle: direccionCompleta.trim()
            }
        };
        
        // Comparar datos básicos
        if (currentData.nombre !== (initialData.nombre || '') ||
            currentData.apellido !== (initialData.apellido || '') ||
            currentData.edad !== (initialData.edad || 0) ||
            currentData.dui !== (initialData.dui || '') ||
            currentData.telefono !== (initialData.telefono || '') ||
            currentData.correo !== (initialData.correo || '') ||
            currentData.estado !== (initialData.estado || 'Activo')) {
            return true;
        }
        
        // Comparar dirección
        const initialDir = initialData.direccion || {};
        if (currentData.direccion.departamento !== (initialDir.departamento || '') ||
            currentData.direccion.ciudad !== (initialDir.ciudad || '') ||
            currentData.direccion.calle !== (initialDir.calle || '')) {
            return true;
        }
        
        // Verificar si hay nueva contraseña
        if (password && password.trim() !== '') {
            return true;
        }
        
        return false;
    };

    // ===========================================
    // FUNCIONES DE LIMPIEZA
    // ===========================================

    /**
     * Limpiar todos los campos del formulario
     */
    const clearForm = () => {
        setNombre('');
        setApellido('');
        setEdad('');
        setDui('');
        setTelefono('');
        setCorreo('');
        setDepartamento('');
        setCiudad('');
        setDireccionCompleta('');
        setEstado('Activo');
        setPassword('');
        setShowPassword(false);
        setClienteId(null);
        setInitialData(null);
        setErrors({});
    };

    // ===========================================
    // FUNCIONES DE ACTUALIZACIÓN
    // ===========================================

    /**
     * Actualizar cliente en el servidor
     * @param {Function} onSuccess - Callback ejecutado cuando se actualiza exitosamente
     */
    const updateCliente = async (onSuccess) => {
        if (!clienteId) {
            Alert.alert('Error', 'No se puede actualizar el cliente');
            return false;
        }

        if (!validateForm()) return false;

        // Verificar si hay cambios
        if (!hasChanges()) {
            Alert.alert('Sin cambios', 'No se han detectado cambios en los datos del cliente');
            return false;
        }

        setLoading(true);
        
        // Preparar datos según la estructura de tu MongoDB
        const clienteData = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            edad: Number(edad),
            dui: dui.trim(),
            telefono: getTelefonoNumbers(telefono), // Solo los números sin +503
            correo: correo.trim().toLowerCase(),
            direccion: {
                calle: direccionCompleta.trim(),
                ciudad: ciudad.trim(),
                departamento: departamento.trim()
            },
            estado: estado
        };

        // Solo agregar contraseña si se está cambiando
        if (password && password.trim() !== '') {
            clienteData.password = password.trim();
        }

        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/clientes/${clienteId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clienteData),
            });

            const responseData = await response.json();

            if (response.ok) {
                // Limpiar formulario
                clearForm();
                
                // Ejecutar callback de éxito sin mostrar alert aquí
                // La notificación se manejará en el componente
                if (onSuccess) {
                    onSuccess(responseData);
                }
                
                return true;
            } else {
                Alert.alert(
                    'Error al actualizar cliente', 
                    responseData.message || 'No se pudo actualizar el cliente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ===========================================
    // RETORNO DEL HOOK
    // ===========================================
    return {
        // Estados del formulario - Información Personal
        nombre,
        setNombre,
        apellido,
        setApellido,
        edad,
        setEdad,
        dui,
        setDui,
        telefono,
        setTelefono,
        correo,
        setCorreo,
        
        // Estados del formulario - Información de Residencia
        departamento,
        setDepartamento,
        ciudad,
        setCiudad,
        direccionCompleta,
        setDireccionCompleta,
        
        // Estados del formulario - Estado y Seguridad
        estado,
        setEstado,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        
        // Estados de control
        loading,
        clienteId,
        initialData,
        errors,
        
        // Funciones de inicialización
        loadClienteData,
        
        // Funciones de formateo
        handleDUIChange,
        handleTelefonoChange,
        handleDepartamentoChange,
        
        // Funciones de validación
        validateForm,
        validateField,
        hasChanges,
        
        // Funciones de limpieza
        clearForm,
        
        // Funciones de actualización
        updateCliente
    };
};