import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { 
    formatDUI, 
    formatTelefono, 
    getTelefonoNumbers,
    getFieldError
} from '../../utils/validator';

/**
 * Hook personalizado para gestionar la creación de nuevos empleados
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Estados del formulario de agregar empleado
 * - Validación de campos con formateo automático
 * - Gestión de imágenes (cámara/galería/subida)
 * - Envío de datos al servidor
 * - Limpieza del formulario
 * - Manejo de estados de carga
 * 
 * @returns {Object} Objeto con estados y funciones para agregar empleados
 */
export const useAddEmpleado = () => {
    const { getAuthHeaders } = useAuth();
    
    // ===========================================
    // ESTADOS DEL FORMULARIO
    // ===========================================
    // Información Personal
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [dui, setDui] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);

    // Información de Residencia
    const [departamento, setDepartamento] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccionCompleta, setDireccionCompleta] = useState('');

    // Información Laboral
    const [sucursal, setSucursal] = useState('');
    const [puesto, setPuesto] = useState('');
    const [salario, setSalario] = useState('');
    const [fechaContratacion, setFechaContratacion] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [estado, setEstado] = useState('Activo');

    // Acceso y Seguridad
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);

    // ===========================================
    // OPCIONES PARA SELECTORES
    // ===========================================
    const sucursales = [
        { label: 'Seleccione sucursal', value: '' },
        { label: 'Sucursal Centro', value: 'Centro' },
        { label: 'Sucursal Escalón', value: 'Escalón' },
        { label: 'Sucursal Santa Rosa', value: 'Santa Rosa' }
    ];

    const puestos = [
        { label: 'Seleccione puesto', value: '' },
        { label: 'Gerente', value: 'Gerente' },
        { label: 'Optometrista', value: 'Optometrista' },
        { label: 'Administrador', value: 'Administrador' },
        { label: 'Vendedor', value: 'Vendedor' },
        { label: 'Técnico', value: 'Técnico' },
        { label: 'Recepcionista', value: 'Recepcionista' }
    ];

    // ===========================================
    // FUNCIONES DE FORMATEO
    // ===========================================

    /**
     * Manejar cambio en el DUI con formateo automático
     */
    const handleDUIChange = (value) => {
        const formattedDUI = formatDUI(value);
        setDui(formattedDUI);
        
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
        setCiudad('');
        
        if (value) {
            setErrors(prev => ({ ...prev, departamento: null }));
        }
    };

    /**
     * Manejar cambio de fecha
     */
    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFechaContratacion(selectedDate);
        }
    };

    // ===========================================
    // FUNCIONES DE GESTIÓN DE IMÁGENES
    // ===========================================

    /**
     * Mostrar selector de imagen
     */
    const handleImagePicker = () => {
        Alert.alert(
            'Cambiar foto de perfil',
            'Selecciona una opción',
            [
                {
                    text: 'Cámara',
                    onPress: () => pickImage('camera'),
                    style: 'default'
                },
                {
                    text: 'Galería',
                    onPress: () => pickImage('gallery'),
                    style: 'default'
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        );
    };

    /**
     * Seleccionar imagen desde cámara o galería
     */
    const pickImage = async (source) => {
        try {
            let result;

            const options = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: false,
            };

            if (source === 'camera') {
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets && result.assets[0]) {
                setFotoPerfil(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error al seleccionar imagen:', error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    /**
     * Subir imagen al servidor
     */
    const uploadImageToServer = async (imageUri) => {
        if (!imageUri) return null;

        try {
            setUploadingImage(true);
            
            const formData = new FormData();
            const filename = imageUri.split('/').pop() || 'empleado-photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/upload/empleado-photo', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                return data.photoUrl || data.url || data.secure_url;
            } else {
                throw new Error('Error al subir imagen');
            }
        } catch (error) {
            console.error('Error al subir imagen:', error);
            Alert.alert('Error', 'No se pudo subir la imagen del empleado');
            return null;
        } finally {
            setUploadingImage(false);
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

        // Validar campos específicos de empleado
        if (!sucursal) {
            newErrors.sucursal = 'La sucursal es requerida';
            isValid = false;
        }

        if (!puesto) {
            newErrors.puesto = 'El puesto es requerido';
            isValid = false;
        }

        if (!salario || isNaN(parseFloat(salario)) || parseFloat(salario) <= 0) {
            newErrors.salario = 'El salario debe ser un número válido mayor a 0';
            isValid = false;
        }

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
        setDui('');
        setTelefono('');
        setCorreo('');
        setFotoPerfil(null);
        setDepartamento('');
        setCiudad('');
        setDireccionCompleta('');
        setSucursal('');
        setPuesto('');
        setSalario('');
        setFechaContratacion(new Date());
        setEstado('Activo');
        setPassword('');
        setShowPassword(false);
        setErrors({});
    };

    // ===========================================
    // FUNCIONES DE CREACIÓN
    // ===========================================

    /**
     * Crear un nuevo empleado en el servidor
     * @param {Function} onSuccess - Callback ejecutado cuando se crea exitosamente
     */
    const createEmpleado = async (onSuccess) => {
        if (!validateForm()) return false;

        setLoading(true);
        
        try {
            // Subir imagen si existe
            let photoUrl = null;
            if (fotoPerfil) {
                photoUrl = await uploadImageToServer(fotoPerfil);
            }

            // Preparar datos según la estructura de MongoDB
            const empleadoData = {
                nombre: nombre.toString().trim(),
                apellido: apellido.toString().trim(),
                dui: dui.toString().trim(),
                telefono: getTelefonoNumbers(telefono),
                correo: correo.toString().trim().toLowerCase(),
                direccion: {
                    calle: direccionCompleta.toString().trim(),
                    ciudad: ciudad.toString().trim(),
                    departamento: departamento.toString().trim()
                },
                sucursalId: {
                    nombre: sucursal
                },
                cargo: puesto,
                salario: parseFloat(salario),
                fechaContratacion: fechaContratacion.toISOString(),
                estado: estado,
                password: password.toString().trim(),
                fotoPerfil: photoUrl,
                isVerified: false
            };

            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/empleados', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(empleadoData),
            });

            const responseData = await response.json();

            if (response.ok) {
                clearForm();
                
                if (onSuccess) {
                    onSuccess(responseData);
                }
                
                return true;
            } else {
                Alert.alert(
                    'Error al crear empleado', 
                    responseData.message || 'No se pudo crear el empleado.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al crear empleado:', error);
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
        dui,
        setDui,
        telefono,
        setTelefono,
        correo,
        setCorreo,
        fotoPerfil,
        setFotoPerfil,
        
        // Estados del formulario - Información de Residencia
        departamento,
        setDepartamento,
        ciudad,
        setCiudad, // <-- AGREGADO
        direccionCompleta,
        setDireccionCompleta,
        
        // Estados del formulario - Información Laboral
        sucursal,
        setSucursal,
        puesto,
        setPuesto,
        salario,
        setSalario,
        fechaContratacion,
        setFechaContratacion,
        showDatePicker,
        setShowDatePicker,
        estado,
        setEstado,
        
        // Estados del formulario - Acceso y Seguridad
        password,
        setPassword,
        showPassword,
        setShowPassword,
        
        // Estados de control
        loading,
        setLoading, // <-- AGREGADO
        errors,
        setErrors, // <-- AGREGADO
        uploadingImage,
        
        // Opciones para selectores
        sucursales,
        puestos,
        
        // Funciones de formateo
        handleDUIChange,
        handleTelefonoChange,
        handleDepartamentoChange,
        handleDateChange,
        
        // Funciones de gestión de imágenes
        handleImagePicker,
        pickImage,
        uploadImageToServer,
        
        // Funciones de validación
        validateForm,
        validateField,
        
        // Funciones de limpieza
        clearForm,
        
        // Funciones de creación
        createEmpleado
    };
};