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
 * Hook personalizado para gestionar la edición de empleados existentes
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Estados del formulario de editar empleado
 * - Carga de datos del empleado existente
 * - Validación de campos con formateo automático
 * - Gestión de imágenes (cambiar/mantener/eliminar)
 * - Envío de datos actualizados al servidor
 * - Detección de cambios
 * - Limpieza del formulario
 * - Manejo de estados de carga
 * 
 * @returns {Object} Objeto con estados y funciones para editar empleados
 */
export const useEditEmpleado = () => {
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
    const [fotoPerfilOriginal, setFotoPerfilOriginal] = useState(null);

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
    const [empleadoId, setEmpleadoId] = useState(null);
    const [initialData, setInitialData] = useState(null);
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
    // FUNCIONES DE INICIALIZACIÓN
    // ===========================================

    /**
     * Cargar datos del empleado existente en el formulario
     * @param {Object} empleado - Objeto con los datos del empleado
     */
    const loadEmpleadoData = (empleado) => {
        if (!empleado) return;
        
        setEmpleadoId(empleado._id);
        setNombre(empleado.nombre || '');
        setApellido(empleado.apellido || '');
        setDui(empleado.dui || '');
        
        // Formatear teléfono con +503 si no lo tiene
        const telefonoFormatted = empleado.telefono 
            ? (empleado.telefono.startsWith('+503') 
                ? empleado.telefono 
                : `+503 ${empleado.telefono}`)
            : '';
        setTelefono(telefonoFormatted);
        
        setCorreo(empleado.correo || '');
        setFotoPerfil(empleado.fotoPerfil || null);
        setFotoPerfilOriginal(empleado.fotoPerfil || null);
        
        // Cargar dirección
        if (empleado.direccion) {
            setDepartamento(empleado.direccion.departamento || '');
            setCiudad(empleado.direccion.ciudad || '');
            setDireccionCompleta(empleado.direccion.calle || '');
        } else {
            setDepartamento('');
            setCiudad('');
            setDireccionCompleta('');
        }
        
        // Cargar información laboral
        setSucursal(empleado.sucursalId?.nombre || empleado.sucursal || '');
        setPuesto(empleado.cargo || '');
        setSalario(empleado.salario?.toString() || '');
        
        if (empleado.fechaContratacion) {
            setFechaContratacion(new Date(empleado.fechaContratacion));
        }
        
        setEstado(empleado.estado || 'Activo');
        setPassword(''); // No cargar contraseña por seguridad
        setShowPassword(false);
        setErrors({});
        
        // Guardar datos iniciales para comparación
        setInitialData(empleado);
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
     * Mostrar selector de imagen con opción de eliminar
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
                    text: 'Eliminar foto',
                    onPress: () => setFotoPerfil(null),
                    style: 'destructive'
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
            dui: dui.trim(),
            telefono: getTelefonoNumbers(telefono),
            correo: correo.trim().toLowerCase(),
            estado: estado,
            sucursal: sucursal,
            cargo: puesto,
            salario: parseFloat(salario) || 0,
            fechaContratacion: fechaContratacion.toISOString(),
            direccion: {
                departamento: departamento.trim(),
                ciudad: ciudad.trim(),
                calle: direccionCompleta.trim()
            }
        };
        
        // Comparar datos básicos
        if (currentData.nombre !== (initialData.nombre || '') ||
            currentData.apellido !== (initialData.apellido || '') ||
            currentData.dui !== (initialData.dui || '') ||
            currentData.telefono !== (initialData.telefono || '') ||
            currentData.correo !== (initialData.correo || '') ||
            currentData.estado !== (initialData.estado || 'Activo') ||
            currentData.sucursal !== (initialData.sucursalId?.nombre || initialData.sucursal || '') ||
            currentData.cargo !== (initialData.cargo || '') ||
            currentData.salario !== (initialData.salario || 0) ||
            currentData.fechaContratacion !== (initialData.fechaContratacion || '')) {
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
        
        // Verificar si cambió la foto
        if (fotoPerfil !== fotoPerfilOriginal) {
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
        setDui('');
        setTelefono('');
        setCorreo('');
        setFotoPerfil(null);
        setFotoPerfilOriginal(null);
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
        setEmpleadoId(null);
        setInitialData(null);
        setErrors({});
    };

    // ===========================================
    // FUNCIONES DE ACTUALIZACIÓN
    // ===========================================

    /**
     * Actualizar empleado en el servidor
     * @param {Function} onSuccess - Callback ejecutado cuando se actualiza exitosamente
     */
    const updateEmpleado = async (onSuccess) => {
        if (!empleadoId) {
            Alert.alert('Error', 'No se puede actualizar el empleado');
            return false;
        }

        if (!validateForm()) return false;

        // Verificar si hay cambios
        if (!hasChanges()) {
            Alert.alert('Sin cambios', 'No se han detectado cambios en los datos del empleado');
            return false;
        }

        setLoading(true);
        
        try {
            // Subir nueva imagen si cambió
            let photoUrl = fotoPerfil;
            if (fotoPerfil && fotoPerfil !== fotoPerfilOriginal && !fotoPerfil.startsWith('http')) {
                photoUrl = await uploadImageToServer(fotoPerfil);
            }

            // Preparar datos según la estructura de MongoDB
            const empleadoData = {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                dui: dui.trim(),
                telefono: getTelefonoNumbers(telefono),
                correo: correo.trim().toLowerCase(),
                direccion: {
                    calle: direccionCompleta.trim(),
                    ciudad: ciudad.trim(),
                    departamento: departamento.trim()
                },
                sucursalId: {
                    nombre: sucursal
                },
                cargo: puesto,
                salario: parseFloat(salario),
                fechaContratacion: fechaContratacion.toISOString(),
                estado: estado,
                fotoPerfil: photoUrl
            };

            // Solo agregar contraseña si se está cambiando
            if (password && password.trim() !== '') {
                empleadoData.password = password.trim();
            }

            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${empleadoId}`, {
                method: 'PUT',
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
                    'Error al actualizar empleado', 
                    responseData.message || 'No se pudo actualizar el empleado.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
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
        fotoPerfilOriginal,
        setFotoPerfilOriginal,
        
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
        empleadoId,
        initialData,
        errors,
        setErrors, // <-- AGREGADO
        uploadingImage,
        
        // Opciones para selectores
        sucursales,
        puestos,
        
        // Funciones de inicialización
        loadEmpleadoData,
        
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
        hasChanges,
        
        // Funciones de limpieza
        clearForm,
        
        // Funciones de actualización
        updateEmpleado
    };
};