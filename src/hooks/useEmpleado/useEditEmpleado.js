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

export const useEditEmpleado = () => {
    const { getAuthHeaders } = useAuth();
    
    // Estados del formulario - Información Personal
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

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [empleadoId, setEmpleadoId] = useState(null);
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
                console.log('Sucursales cargadas para edición:', sucursalesOptions);
            } else {
                console.error('Error cargando sucursales para edición');
                setSucursales([
                    { label: 'Error cargando sucursales', value: '' }
                ]);
            }
        } catch (error) {
            console.error('Error al cargar sucursales para edición:', error);
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
                console.log('Nueva imagen seleccionada:', result.assets[0].uri);
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
            
            const filename = imageUri.split('/').pop() || `empleado_edit_${Date.now()}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            formData.append('upload_preset', 'empleados_unsigned');

            console.log('Usando preset: empleados_unsigned');

            const response = await fetch(`https://api.cloudinary.com/v1_1/dv6zckgk4/image/upload`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const responseData = await response.json();
            console.log('Respuesta de Cloudinary para edición:', responseData);

            if (response.ok && responseData.secure_url) {
                console.log('Nueva imagen subida exitosamente:', responseData.secure_url);
                return responseData.secure_url;
            } else {
                console.error('Error de Cloudinary en edición:', responseData);
                throw new Error(responseData.error?.message || 'Error al subir imagen');
            }

        } catch (error) {
            console.error('Error subiendo imagen en edición:', error);
            throw error;
        } finally {
            setUploadingImage(false);
        }
    };

    // Cargar datos del empleado para edición
    const loadEmpleadoData = (empleado) => {
        console.log('Cargando datos del empleado para editar:', empleado);
        
        setEmpleadoId(empleado._id);
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
        setPuesto(empleado.cargo || '');
        setSalario(empleado.salario?.toString() || '');
        setFechaContratacion(empleado.fechaContratacion ? new Date(empleado.fechaContratacion) : new Date());
        setEstado(empleado.estado || 'Activo');
        
        // Guardar datos originales para detectar cambios
        setOriginalData({
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
            puesto: empleado.cargo || '',
            salario: empleado.salario?.toString() || '',
            fechaContratacion: empleado.fechaContratacion,
            estado: empleado.estado || 'Activo'
        });
        
        // Limpiar errores y contraseña
        setErrors({});
        setPassword('');
    };

    // Verificar si hay cambios
    const hasChanges = () => {
        if (!originalData) return false;
        
        const currentData = {
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
            estado: estado
        };
        
        const originalFormatted = {
            ...originalData,
            telefono: getTelefonoNumbers(originalData.telefono),
            fechaContratacion: originalData.fechaContratacion ? new Date(originalData.fechaContratacion).toISOString() : new Date().toISOString()
        };
        
        return JSON.stringify(currentData) !== JSON.stringify(originalFormatted) || password.trim() !== '';
    };

    // Validaciones
    const validateField = (field, value) => {
        const error = getFieldError(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
        return !error;
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validar campos requeridos básicos
        const requiredFields = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dui: dui.trim(),
            telefono: telefono.trim(),
            correo: correo.trim()
        };

        Object.keys(requiredFields).forEach(field => {
            const error = getFieldError(field, requiredFields[field]);
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

        // Validar sucursal
        if (!sucursal || sucursal === '') {
            newErrors.sucursal = 'La sucursal es requerida';
            isValid = false;
        }

        // Validar puesto
        if (!puesto || puesto === '') {
            newErrors.puesto = 'El puesto es requerido';
            isValid = false;
        }

        // Validar salario
        const salarioNum = parseFloat(salario);
        if (!salario || isNaN(salarioNum) || salarioNum <= 0) {
            newErrors.salario = 'El salario debe ser un número válido mayor a 0';
            isValid = false;
        }

        // Validar departamento
        if (!departamento) {
            newErrors.departamento = 'El departamento es requerido';
            isValid = false;
        }

        // Validar ciudad
        if (!ciudad) {
            newErrors.ciudad = 'La ciudad es requerida';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Limpiar formulario
    const clearForm = () => {
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
        setErrors({});
        setOriginalData(null);
    };

    // Función principal para actualizar empleado
    const updateEmpleado = async (onSuccess) => {
        console.log('Iniciando actualización de empleado...');
        
        if (!empleadoId) {
            Alert.alert('Error', 'No se encontró el ID del empleado');
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
                            '¿Deseas actualizar el empleado sin cambiar la foto?',
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

            // Preparar datos para actualización
            const updateData = {
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
                updateData.password = password.trim();
            }

            console.log('Actualizando empleado:', {
                ...updateData,
                password: password.trim() !== '' ? '***NUEVA***' : '***SIN_CAMBIO***',
                fotoPerfil: photoUrl !== originalData?.fotoPerfil ? 'IMAGEN_CAMBIADA' : 'IMAGEN_ORIGINAL'
            });

            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${empleadoId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const responseData = await response.json();
            console.log('Respuesta del servidor para actualización:', responseData);

            if (response.ok) {
                console.log('Empleado actualizado exitosamente');
                clearForm();
                
                if (onSuccess) {
                    onSuccess(responseData.empleado || responseData);
                }
                
                Alert.alert(
                    'Empleado actualizado',
                    responseData.message || 'El empleado ha sido actualizado exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                console.error('Error del servidor:', responseData);
                Alert.alert(
                    'Error al actualizar empleado', 
                    responseData.message || 'No se pudo actualizar el empleado.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
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
        
        // Estados de control
        loading,
        setLoading,
        errors,
        setErrors,
        uploadingImage,
        empleadoId,
        
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
        uploadImageToServer: uploadImageToCloudinary,
        
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