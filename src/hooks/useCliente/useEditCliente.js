import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

/**
 * Hook personalizado para gestionar la edición de clientes existentes
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Estados del formulario de editar cliente
 * - Carga de datos del cliente existente
 * - Validación de campos
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
        setTelefono(cliente.telefono || '');
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
        
        // Guardar datos iniciales para comparación
        setInitialData(cliente);
    };

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
        
        // Validar contraseña solo si se está cambiando
        if (password && password.toString().trim() !== '' && password.toString().length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        return true;
    };

    /**
     * Verificar si hay cambios en los datos
     */
    const hasChanges = () => {
        if (!initialData) return false;
        
        const currentData = {
            nombre: nombre.toString().trim(),
            apellido: apellido.toString().trim(),
            edad: Number(edad),
            dui: dui.toString().trim(),
            telefono: telefono.toString().trim(),
            correo: correo.toString().trim().toLowerCase(),
            estado: estado,
            direccion: {
                departamento: departamento.toString().trim(),
                ciudad: ciudad.toString().trim(),
                calle: direccionCompleta.toString().trim()
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
        if (password && password.toString().trim() !== '') {
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
            estado: estado
        };

        // Solo agregar contraseña si se está cambiando
        if (password && password.toString().trim() !== '') {
            clienteData.password = password.toString().trim();
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

            if (response.ok) {
                const updatedCliente = await response.json();
                
                Alert.alert(
                    'Cliente actualizado', 
                    'Los datos del cliente han sido actualizados exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                // Limpiar formulario
                clearForm();
                
                // Ejecutar callback de éxito
                if (onSuccess) {
                    onSuccess(updatedCliente);
                }
                
                return true;
            } else {
                const errorData = await response.json();
                Alert.alert(
                    'Error al actualizar cliente', 
                    errorData.message || 'No se pudo actualizar el cliente.',
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
        
        // Funciones
        loadClienteData,
        validateForm,
        hasChanges,
        clearForm,
        updateCliente
    };
};