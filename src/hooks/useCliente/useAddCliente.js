import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

/**
 * Hook personalizado para gestionar la creación de nuevos clientes
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Estados del formulario de agregar cliente
 * - Validación de campos
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

    // ===========================================
    // FUNCIONES DE VALIDACIÓN
    // ===========================================

    /**
     * Validar formulario antes de enviar
     */
    const validateForm = () => {
        // Validar nombre
        if (!nombre || nombre.toString().trim() === '') {
            Alert.alert('Error', 'El nombre es obligatorio');
            return false;
        }
        
        // Validar apellido
        if (!apellido || apellido.toString().trim() === '') {
            Alert.alert('Error', 'El apellido es obligatorio');
            return false;
        }
        
        // Validar edad
        if (!edad || edad.toString().trim() === '' || isNaN(Number(edad)) || Number(edad) < 18) {
            Alert.alert('Error', 'La edad debe ser un número mayor a 18 años');
            return false;
        }
        
        // Validar DUI
        if (!dui || dui.toString().trim() === '') {
            Alert.alert('Error', 'El DUI es obligatorio');
            return false;
        }
        
        // Validar teléfono
        if (!telefono || telefono.toString().trim() === '') {
            Alert.alert('Error', 'El teléfono es obligatorio');
            return false;
        }
        
        // Validar correo
        if (!correo || correo.toString().trim() === '' || !correo.toString().includes('@')) {
            Alert.alert('Error', 'Ingresa un correo electrónico válido');
            return false;
        }
        
        // Validar contraseña
        if (!password || password.toString().trim() === '' || password.toString().length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        return true;
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
            telefono: telefono.toString().trim(),
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

            if (response.ok) {
                const newCliente = await response.json();
                
                Alert.alert(
                    'Cliente creado', 
                    'El cliente ha sido registrado exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                // Limpiar formulario
                clearForm();
                
                // Ejecutar callback de éxito
                if (onSuccess) {
                    onSuccess(newCliente);
                }
                
                return true;
            } else {
                const errorData = await response.json();
                Alert.alert(
                    'Error al crear cliente', 
                    errorData.message || 'No se pudo crear el cliente.',
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
        
        // Funciones
        validateForm,
        clearForm,
        createCliente
    };
};