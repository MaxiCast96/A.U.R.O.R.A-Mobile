import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import {
    formatDUI,
    formatTelefono,
    getTelefonoNumbers,
    getFieldError
} from '../../utils/validator';

export const useEditOptometrista = () => {
    const { getAuthHeaders } = useAuth();

    // Estados del formulario - Información Personal del Empleado
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [dui, setDui] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);

    // Estados del formulario - Información de Residencia
    const [departamento, setDepartamento] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccionCompleta, setDireccionCompleta] = useState('');

    // Estados del formulario - Información Laboral
    const [sucursal, setSucursal] = useState('');
    const [puesto, setPuesto] = useState('');
    const [salario, setSalario] = useState('');
    const [fechaContratacion, setFechaContratacion] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [estado, setEstado] = useState('Activo');

    // Acceso y Seguridad
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estados específicos del optometrista
    const [especialidad, setEspecialidad] = useState('');
    const [numeroLicencia, setNumeroLicencia] = useState('');
    const [experiencia, setExperiencia] = useState('');
    const [estadoDisponibilidad, setEstadoDisponibilidad] = useState('Disponible');

    // Estados de horarios
    const [disponibilidad, setDisponibilidad] = useState([]);

    // Estados de sucursales
    const [sucursalesAsignadas, setSucursalesAsignadas] = useState([]);

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [empleadoId, setEmpleadoId] = useState(null);
    const [optometristaId, setOptometristaId] = useState(null);
    const [originalData, setOriginalData] = useState(null);

    // Opciones de sucursales - cargadas dinámicamente
    const [sucursales, setSucursales] = useState([
        { label: 'Cargando sucursales...', value: '' }
    ]);

    const puestos = [
        { label: 'Seleccione puesto', value: '' },
        { label: 'Gerente', value: 'Gerente' },
        { label: 'Optometrista', value: 'Optometrista' },
        { label: 'Administrador', value: 'Administrador' },
        { label: 'Vendedor', value: 'Vendedor' },
        { label: 'Técnico', value: 'Técnico' },
        { label: 'Recepcionista', value: 'Recepcionista' }
    ];

    // Opciones de especialidad
    const especialidades = [
        { label: 'Seleccione la especialidad', value: '' },
        { label: 'Optometría General', value: 'General' },
        { label: 'Optometría Pediátrica', value: 'Pediatrica' },
        { label: 'Optometría Geriátrica', value: 'Geriatrica' },
        { label: 'Contactología', value: 'Contactologia' },
        { label: 'Baja Visión', value: 'Baja Vision' },
        { label: 'Terapia Visual', value: 'Terapia Visual' },
    ];

    // Cargar sucursales del backend
    const loadSucursales = async () => {
        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/sucursales', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const sucursalesData = await response.json();
                const sucursalesOptions = [
                    { label: 'Seleccione sucursal', value: '' },
                    ...sucursalesData.map(sucursal => ({
                        label: sucursal.nombre,
                        value: sucursal._id
                    }))
                ];
                setSucursales(sucursalesOptions);
                console.log('Sucursales cargadas para editar optometrista:', sucursalesOptions);
            } else {
                console.error('Error cargando sucursales para editar optometrista');
                setSucursales([
                    { label: 'Error cargando sucursales', value: '' }
                ]);
            }
        } catch (error) {
            console.error('Error al cargar sucursales para editar optometrista:', error);
            setSucursales([
                { label: 'Seleccione sucursal', value: '' }
            ]);
        }
    };

    // Cargar sucursales al inicializar el hook
    useEffect(() => {
        loadSucursales();
    }, []);

    // Funciones de formateo
    const handleDUIChange = (value) => {
        const formattedDUI = formatDUI(value);
        setDui(formattedDUI);

        if (formattedDUI.length === 10) {
            validateField('dui', formattedDUI);
        } else if (errors.dui) {
            setErrors(prev => ({ ...prev, dui: null }));
        }
    };

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

    const handleDepartamentoChange = (value) => {
        setDepartamento(value);
        setCiudad('');

        if (value) {
            setErrors(prev => ({ ...prev, departamento: null }));
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFechaContratacion(selectedDate);
        }
    };

    // Gestión de imágenes
    const handleImagePicker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permisos necesarios',
                'Necesitamos acceso a tu galería para seleccionar una imagen',
                [{ text: 'Entendido', style: 'default' }]
            );
            return;
        }

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
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Error', 'Se necesitan permisos de cámara');
                    return;
                }
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets && result.assets[0]) {
                setFotoPerfil(result.assets[0].uri);
                console.log('Nueva imagen seleccionada para optometrista:', result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error al seleccionar imagen:', error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    // Subir imagen a Cloudinary
    const uploadImageToCloudinary = async (imageUri) => {
        if (!imageUri) return null;

        try {
            setUploadingImage(true);
            console.log('Subiendo nueva imagen a Cloudinary...');

            const formData = new FormData();

            const filename = imageUri.split('/').pop() || `optometrista_edit_${Date.now()}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            formData.append('upload_preset', 'empleados_unsigned');

            const response = await fetch(`https://api.cloudinary.com/v1_1/dv6zckgk4/image/upload`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok && responseData.secure_url) {
                console.log('Nueva imagen de optometrista subida exitosamente:', responseData.secure_url);
                return responseData.secure_url;
            } else {
                console.error('Error de Cloudinary en edición de optometrista:', responseData);
                throw new Error(responseData.error?.message || 'Error al subir imagen');
            }

        } catch (error) {
            console.error('Error subiendo imagen en edición de optometrista:', error);
            throw error;
        } finally {
            setUploadingImage(false);
        }
    };

    // Cargar datos del optometrista para edición
    const loadOptometristaData = (optometrista) => {


        const empleado = optometrista.empleadoId || {};

        // IDs
        setOptometristaId(optometrista._id);
        setEmpleadoId(empleado._id);

        // Datos del empleado
        setNombre(empleado.nombre || '');
        setApellido(empleado.apellido || '');
        setDui(empleado.dui || '');
        setTelefono(empleado.telefono ? formatTelefono(empleado.telefono) : '');
        setCorreo(empleado.correo || '');
        setFotoPerfil(empleado.fotoPerfil || null);

        // Información de residencia
        setDepartamento(empleado.direccion?.departamento || '');
        setCiudad(empleado.direccion?.municipio || empleado.direccion?.ciudad || '');
        setDireccionCompleta(empleado.direccion?.direccionDetallada || empleado.direccion?.calle || '');

        // Información laboral
        setSucursal(empleado.sucursalId?._id || empleado.sucursalId || '');
        setPuesto(empleado.cargo || 'Optometrista');
        setSalario(empleado.salario?.toString() || '');
        setFechaContratacion(empleado.fechaContratacion ? new Date(empleado.fechaContratacion) : new Date());
        setEstado(empleado.estado || 'Activo');

        // Datos específicos del optometrista
        setEspecialidad(optometrista.especialidad || '');
        setNumeroLicencia(optometrista.licencia || '');
        setExperiencia(optometrista.experiencia?.toString() || '');
        setEstadoDisponibilidad(optometrista.disponible ? 'Disponible' : 'No Disponible');

        // Horarios de disponibilidad
        setDisponibilidad(optometrista.disponibilidad || []);

        // Sucursales asignadas - procesar correctamente los IDs
const sucursalesAsignadasProcessed = (optometrista.sucursalesAsignadas || []).map(sucursal => {
    if (typeof sucursal === 'object' && sucursal._id) {
        return sucursal._id.toString();
    }
    return sucursal.toString();
});
        setSucursalesAsignadas(sucursalesAsignadasProcessed);

        // Guardar datos originales para detectar cambios
        setOriginalData({
            // Datos del empleado
            nombre: empleado.nombre || '',
            apellido: empleado.apellido || '',
            dui: empleado.dui || '',
            telefono: empleado.telefono || '',
            correo: empleado.correo || '',
            fotoPerfil: empleado.fotoPerfil || null,
            departamento: empleado.direccion?.departamento || '',
            ciudad: empleado.direccion?.municipio || empleado.direccion?.ciudad || '',
            direccionCompleta: empleado.direccion?.direccionDetallada || empleado.direccion?.calle || '',
            sucursal: empleado.sucursalId?._id || empleado.sucursalId || '',
            puesto: empleado.cargo || 'Optometrista',
            salario: empleado.salario?.toString() || '',
            fechaContratacion: empleado.fechaContratacion,
            estado: empleado.estado || 'Activo',
            // Datos del optometrista
            especialidad: optometrista.especialidad || '',
            numeroLicencia: optometrista.licencia || '',
            experiencia: optometrista.experiencia?.toString() || '',
            estadoDisponibilidad: optometrista.disponible ? 'Disponible' : 'No Disponible',
            disponibilidad: optometrista.disponibilidad || [],
            sucursalesAsignadas: sucursalesAsignadasProcessed
        });

        // Limpiar errores y contraseña
        setErrors({});
        setPassword('');
    };

    // Verificar si hay cambios
    const hasChanges = () => {
        if (!originalData) return false;

        const currentData = {
            // Datos del empleado
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dui: dui.trim(),
            telefono: getTelefonoNumbers(telefono),
            correo: correo.trim(),
            fotoPerfil: fotoPerfil,
            departamento: departamento.trim(),
            ciudad: ciudad.trim(),
            direccionCompleta: direccionCompleta.trim(),
            sucursal: sucursal,
            puesto: puesto,
            salario: salario,
            fechaContratacion: fechaContratacion.toISOString(),
            estado: estado,
            // Datos del optometrista
            especialidad: especialidad,
            numeroLicencia: numeroLicencia.trim(),
            experiencia: experiencia,
            estadoDisponibilidad: estadoDisponibilidad,
            disponibilidad: JSON.stringify(disponibilidad),
            sucursalesAsignadas: JSON.stringify(sucursalesAsignadas)
        };

        const originalFormatted = {
            ...originalData,
            telefono: getTelefonoNumbers(originalData.telefono),
            fechaContratacion: originalData.fechaContratacion ? new Date(originalData.fechaContratacion).toISOString() : new Date().toISOString(),
            disponibilidad: JSON.stringify(originalData.disponibilidad),
            sucursalesAsignadas: JSON.stringify(originalData.sucursalesAsignadas)
        };

        return JSON.stringify(currentData) !== JSON.stringify(originalFormatted) || password.trim() !== '';
    };

    // Validaciones
    const validateField = (field, value) => {
        let error = null;

        // Validaciones específicas del optometrista
        switch (field) {
            case 'especialidad':
                if (!value || value === '') {
                    error = 'La especialidad es requerida';
                }
                break;
            case 'numeroLicencia':
                if (!value.trim()) {
                    error = 'El número de licencia es requerido';
                } else if (value.trim().length < 4) {
                    error = 'El número de licencia debe tener al menos 4 caracteres';
                }
                break;
            case 'experiencia':
                if (!value.trim()) {
                    error = 'Los años de experiencia son requeridos';
                } else {
                    const exp = parseInt(value);
                    if (isNaN(exp) || exp < 0) {
                        error = 'Debe ser un número válido mayor o igual a 0';
                    } else if (exp > 50) {
                        error = 'Los años de experiencia no pueden superar los 50 años';
                    }
                }
                break;
            default:
                // Validaciones estándar para campos del empleado
                error = getFieldError(field, value);
                break;
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
        return !error;
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validar campos requeridos del empleado
        const requiredEmpleadoFields = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dui: dui.trim(),
            telefono: telefono.trim(),
            correo: correo.trim()
        };

        Object.keys(requiredEmpleadoFields).forEach(field => {
            const error = getFieldError(field, requiredEmpleadoFields[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        // Validar contraseña solo si se proporciona
        if (password.trim() !== '') {
            const passwordError = getFieldError('password', password.trim());
            if (passwordError) {
                newErrors.password = passwordError;
                isValid = false;
            }
        }

        // Validar campos laborales del empleado
        if (!sucursal || sucursal === '') {
            newErrors.sucursal = 'La sucursal es requerida';
            isValid = false;
        }

        if (!puesto || puesto === '') {
            newErrors.puesto = 'El puesto es requerido';
            isValid = false;
        }

        const salarioNum = parseFloat(salario);
        if (!salario || isNaN(salarioNum) || salarioNum <= 0) {
            newErrors.salario = 'El salario debe ser un número válido mayor a 0';
            isValid = false;
        }

        if (!departamento) {
            newErrors.departamento = 'El departamento es requerido';
            isValid = false;
        }

        if (!ciudad) {
            newErrors.ciudad = 'La ciudad es requerida';
            isValid = false;
        }

        // Validar campos específicos del optometrista
        if (!especialidad || especialidad === '') {
            newErrors.especialidad = 'La especialidad es requerida';
            isValid = false;
        }

        if (!numeroLicencia.trim()) {
            newErrors.numeroLicencia = 'El número de licencia es requerido';
            isValid = false;
        } else if (numeroLicencia.trim().length < 4) {
            newErrors.numeroLicencia = 'El número de licencia debe tener al menos 4 caracteres';
            isValid = false;
        }

        if (!experiencia.trim()) {
            newErrors.experiencia = 'Los años de experiencia son requeridos';
            isValid = false;
        } else {
            const exp = parseInt(experiencia);
            if (isNaN(exp) || exp < 0) {
                newErrors.experiencia = 'Debe ser un número válido mayor o igual a 0';
                isValid = false;
            } else if (exp > 50) {
                newErrors.experiencia = 'Los años de experiencia no pueden superar los 50 años';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // Limpiar formulario
    const clearForm = () => {
        setOptometristaId(null);
        setEmpleadoId(null);
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
        setEspecialidad('');
        setNumeroLicencia('');
        setExperiencia('');
        setEstadoDisponibilidad('Disponible');
        setDisponibilidad([]);
        setSucursalesAsignadas([]);
        setErrors({});
        setOriginalData(null);
    };

    /**
     * Función helper para obtener la siguiente hora
     */
    const getNextHour = (hora) => {
        const horasDisponibles = [
            '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
        ];

        const currentIndex = horasDisponibles.indexOf(hora);
        if (currentIndex >= 0 && currentIndex < horasDisponibles.length - 1) {
            return horasDisponibles[currentIndex + 1];
        }
        if (hora === '16:00') {
            return '17:00';
        }
        // Para la última hora, agregar 1 hora más
        const [hourPart] = hora.split(':');
        return `${parseInt(hourPart) + 1}:00`;
    };

    // Función principal para actualizar optometrista
    const updateOptometrista = async (onSuccess) => {
        console.log('Iniciando actualización de optometrista...');

        if (!empleadoId || !optometristaId) {
            Alert.alert('Error', 'No se encontraron los IDs del empleado y optometrista');
            return false;
        }

        if (!validateForm()) {
            console.log('Formulario no válido:', errors);
            return false;
        }

        setLoading(true);

        try {
            let photoUrl = originalData?.fotoPerfil || "";

            // Subir nueva imagen si se cambió
            if (fotoPerfil && fotoPerfil !== originalData?.fotoPerfil) {
                console.log('Subiendo nueva imagen...');
                try {
                    photoUrl = await uploadImageToCloudinary(fotoPerfil);
                    console.log('Nueva URL de imagen obtenida:', photoUrl);
                } catch (imageError) {
                    console.log('Error subiendo nueva imagen:', imageError.message);

                    const continuar = await new Promise((resolve) => {
                        Alert.alert(
                            'Error al subir imagen',
                            '¿Deseas actualizar el optometrista sin cambiar la foto?',
                            [
                                { text: 'Cancelar', onPress: () => resolve(false) },
                                { text: 'Continuar', onPress: () => resolve(true) }
                            ]
                        );
                    });

                    if (!continuar) {
                        setLoading(false);
                        return false;
                    }
                    // Mantener la imagen original
                    photoUrl = originalData?.fotoPerfil || "";
                }
            }

            // Preparar datos para actualización del empleado
            const updateEmpleadoData = {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                dui: dui.trim(),
                telefono: getTelefonoNumbers(telefono),
                correo: correo.trim().toLowerCase(),
                cargo: puesto,
                sucursalId: sucursal,
                fechaContratacion: fechaContratacion.toISOString(),
                salario: parseFloat(salario),
                estado: estado,
                departamento: departamento.trim(),
                municipio: ciudad.trim(),
                direccionDetallada: direccionCompleta.trim(),
                fotoPerfil: photoUrl
            };

            // Incluir contraseña solo si se proporciona
            if (password.trim() !== '') {
                updateEmpleadoData.password = password.trim();
            }

            console.log('Actualizando empleado del optometrista:', {
                ...updateEmpleadoData,
                password: password.trim() !== '' ? '***NUEVA***' : '***SIN_CAMBIO***',
                fotoPerfil: photoUrl !== originalData?.fotoPerfil ? 'IMAGEN_CAMBIADA' : 'IMAGEN_ORIGINAL'
            });

            // Actualizar empleado
            const empleadoResponse = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${empleadoId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateEmpleadoData),
            });

            const empleadoResponseData = await empleadoResponse.json();
            console.log('Respuesta del servidor para actualización de empleado:', empleadoResponseData);

            if (!empleadoResponse.ok) {
                console.error('Error actualizando empleado:', empleadoResponseData);
                Alert.alert(
                    'Error al actualizar empleado',
                    empleadoResponseData.message || 'No se pudo actualizar la información del empleado.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                setLoading(false);
                return false;
            }

            // Preparar datos para actualización del optometrista
            const updateOptometristaData = {
                especialidad: especialidad.trim(),
                licencia: numeroLicencia.trim(),
                experiencia: parseInt(experiencia),
                disponible: estadoDisponibilidad === 'Disponible',
                disponibilidad: disponibilidad.map(item => ({
                    dia: item.dia,
                    hora: item.hora,
                    horaInicio: item.horaInicio || item.hora,
                    horaFin: item.horaFin || getNextHour(item.hora)
                })),
                sucursalesAsignadas: (sucursalesAsignadas || []).map(id => id.toString())  
            };

            console.log('Actualizando optometrista:', updateOptometristaData);

            // Actualizar optometrista
            const optometristaResponse = await fetch(`https://a-u-r-o-r-a.onrender.com/api/optometrista/${optometristaId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateOptometristaData),
            });

            const optometristaResponseData = await optometristaResponse.json();
            console.log('Respuesta del servidor para actualización de optometrista:', optometristaResponseData);

            if (optometristaResponse.ok) {
                console.log('Optometrista actualizado exitosamente');
                clearForm();

                if (onSuccess) {
                    onSuccess({
                        empleado: empleadoResponseData.empleado || empleadoResponseData,
                        optometrista: optometristaResponseData.optometrista || optometristaResponseData
                    });
                }

                Alert.alert(
                    'Optometrista actualizado',
                    'El optometrista ha sido actualizado exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );

                return true;
            } 
        } catch (error) {
            console.error('Error general:', error);
            Alert.alert(
                'Error de conexión',
                'Hubo un problema al conectar con el servidor. Verifica tu conexión.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        } finally {
            setLoading(false);
        }
    };
    return {
        // Estados del formulario - Información Personal del Empleado
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
        setCiudad,
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

        // Estados específicos del optometrista
        especialidad,
        setEspecialidad,
        numeroLicencia,
        setNumeroLicencia,
        experiencia,
        setExperiencia,
        estadoDisponibilidad,
        setEstadoDisponibilidad,

        // Estados de horarios
        disponibilidad,
        setDisponibilidad,

        // Estados de sucursales
        sucursalesAsignadas,
        setSucursalesAsignadas,

        // Estados de control
        loading,
        setLoading,
        errors,
        setErrors,
        uploadingImage,
        empleadoId,
        optometristaId,

        // Opciones para selectores
        sucursales,
        puestos,
        especialidades,

        // Funciones de inicialización
        loadOptometristaData,

        // Funciones de formateo
        handleDUIChange,
        handleTelefonoChange,
        handleDepartamentoChange,
        handleDateChange,

        // Funciones de gestión de imágenes
        handleImagePicker,
        pickImage,
        uploadImageToServer: uploadImageToCloudinary,

        // Funciones de validación
        validateForm,
        validateField,
        hasChanges,

        // Funciones de limpieza
        clearForm,

        // Funciones de actualización
        updateOptometrista
    };
};