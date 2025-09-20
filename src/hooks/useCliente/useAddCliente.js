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
 * Hook personalizado para gestionar la creación de nuevos clientes
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Estados del formulario de agregar cliente
 * - Validación de campos con formateo automático
 * - Envío de datos al servidor
 * - Limpieza del formulario
 * - Manejo de estados de carga
 * 
 * @returns {Object} Objeto con estados y funciones para agregar clientes
 */
export const useAddCliente = () => {
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
    const [errors, setErrors] = useState({});

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
        const error = getFieldError(field, value);
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
        
        // Validar campos requeridos
        const fields = {
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            password
        };

        let isValid = true;

        Object.keys(fields).forEach(field => {
            const error = getFieldError(field, fields[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
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
        setErrors({});
    };

    // ===========================================
    // FUNCIONES DE CREACIÓN
    // ===========================================

    /**
     * Crear un nuevo cliente en el servidor
     * @param {Function} onSuccess - Callback ejecutado cuando se crea exitosamente
     */
    const createCliente = async (onSuccess) => {
        if (!validateForm()) return false;

        setLoading(true);
        
        // Preparar datos según la estructura de tu MongoDB
        const clienteData = {
            nombre: nombre.toString().trim(),
            apellido: apellido.toString().trim(),
            edad: Number(edad),
            dui: dui.toString().trim(),
            telefono: getTelefonoNumbers(telefono), // Solo los números sin +503
            correo: correo.toString().trim().toLowerCase(),
            direccion: {
                calle: direccionCompleta.toString().trim(),
                ciudad: ciudad.toString().trim(),
                departamento: departamento.toString().trim()
            },
            estado: estado,
            password: password.toString().trim()
        };

        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/clientes', {
                method: 'POST',
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
                    'Error al crear cliente', 
                    responseData.message || 'No se pudo crear el cliente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al crear cliente:', error);
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
        errors,
        
        // Funciones de formateo
        handleDUIChange,
        handleTelefonoChange,
        handleDepartamentoChange,
        
        // Funciones de validación
        validateForm,
        validateField,
        
        // Funciones de limpieza
        clearForm,
        
        // Funciones de creación
        createCliente
    };
};