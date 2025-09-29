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

export const useAddEmpleado = () => {
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

    // Opciones de sucursales - cargadas dinámicamente
    const [sucursales, setSucursales] = useState([
        { label: 'Cargando sucursales...', value: '' }
    ]);

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
                        value: sucursal._id // Usar ObjectId real
                    }))
                ];
                setSucursales(sucursalesOptions);
                console.log('Sucursales cargadas:', sucursalesOptions);
            } else {
                console.error('Error cargando sucursales');
                setSucursales([
                    { label: 'Error cargando sucursales', value: '' }
                ]);
            }
        } catch (error) {
            console.error('Error al cargar sucursales:', error);
            setSucursales([
                { label: 'Seleccione sucursal', value: '' }
            ]);
        }
    };

    // Cargar sucursales al inicializar el hook
    useEffect(() => {
        loadSucursales();
    }, []);

    const puestos = [
        { label: 'Seleccione puesto', value: '' },
        { label: 'Gerente', value: 'Gerente' },
        { label: 'Optometrista', value: 'Optometrista' },
        { label: 'Administrador', value: 'Administrador' },
        { label: 'Vendedor', value: 'Vendedor' },
        { label: 'Técnico', value: 'Técnico' },
        { label: 'Recepcionista', value: 'Recepcionista' }
    ];

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
                console.log('Imagen seleccionada:', result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error al seleccionar imagen:', error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    // Función limpia de subida a Cloudinary
    const uploadImageToCloudinary = async (imageUri) => {
        if (!imageUri) return null;

        try {
            setUploadingImage(true);
            console.log('Subiendo imagen a Cloudinary...');
            
            const formData = new FormData();
            
            const filename = imageUri.split('/').pop() || `empleado_${Date.now()}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            // Usar el preset configurado en Cloudinary
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
            console.log('Respuesta de Cloudinary:', responseData);

            if (response.ok && responseData.secure_url) {
                console.log('Imagen subida exitosamente:', responseData.secure_url);
                return responseData.secure_url;
            } else {
                console.error('Error de Cloudinary:', responseData);
                throw new Error(responseData.error?.message || 'Error al subir imagen');
            }

        } catch (error) {
            console.error('Error subiendo imagen:', error);
            throw error;
        } finally {
            setUploadingImage(false);
        }
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

    /**
     * Validar datos básicos del empleado (para flujo de optometristas)
     */
    const validateBasicData = async () => {
        const newErrors = {};
        let isValid = true;

        // Validar campos requeridos básicos
        const requiredFields = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dui: dui.trim(),
            telefono: telefono.trim(),
            correo: correo.trim(),
            password: password.trim()
        };

        Object.keys(requiredFields).forEach(field => {
            const error = getFieldError(field, requiredFields[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

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

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validar campos requeridos básicos
        const requiredFields = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dui: dui.trim(),
            telefono: telefono.trim(),
            correo: correo.trim(),
            password: password.trim()
        };

        Object.keys(requiredFields).forEach(field => {
            const error = getFieldError(field, requiredFields[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

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

    // Función principal simplificada
    const createEmpleado = async (onSuccess) => {
        console.log('Iniciando creación de empleado...');
        
        if (!validateForm()) {
            console.log('Formulario no válido:', errors);
            return false;
        }

        setLoading(true);
        
        try {
            let photoUrl = "";
            
            // Manejar imagen si existe, preguntar si no existe
            if (fotoPerfil) {
                console.log('Subiendo imagen primero...');
                try {
                    photoUrl = await uploadImageToCloudinary(fotoPerfil);
                    console.log('URL de imagen obtenida:', photoUrl);
                } catch (imageError) {
                    console.log('Error subiendo imagen:', imageError.message);
                    
                    // Preguntar si continuar sin imagen cuando falla la subida
                    const continuar = await new Promise((resolve) => {
                        Alert.alert(
                            'Error al subir imagen',
                            '¿Deseas crear el empleado sin foto de perfil?',
                            [
                                { text: 'Cancelar', onPress: () => resolve(false) },
                                { text: 'Continuar sin foto', onPress: () => resolve(true) }
                            ]
                        );
                    });
                    
                    if (!continuar) {
                        setLoading(false);
                        return false;
                    }
                    photoUrl = "";
                }
            } else {
                // Preguntar si quiere agregar imagen cuando no hay ninguna
                const agregarImagen = await new Promise((resolve) => {
                    Alert.alert(
                        'Sin foto de perfil',
                        '¿Deseas crear el empleado sin foto de perfil? Podrás agregar una después.',
                        [
                            { text: 'Agregar foto', onPress: () => resolve(false) },
                            { text: 'Continuar sin foto', onPress: () => resolve(true) }
                        ]
                    );
                });
                
                if (!agregarImagen) {
                    setLoading(false);
                    // Abrir selector de imagen
                    handleImagePicker();
                    return false;
                }
            }

            // Crear empleado con o sin imagen
            const empleadoData = {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                dui: dui.trim(),
                telefono: getTelefonoNumbers(telefono),
                correo: correo.trim().toLowerCase(),
                cargo: puesto,
                sucursalId: sucursal,
                fechaContratacion: fechaContratacion.toISOString(),
                password: password.trim(),
                salario: parseFloat(salario),
                estado: estado,
                departamento: departamento.trim(),
                municipio: ciudad.trim(),
                direccionDetallada: direccionCompleta.trim(),
                fotoPerfil: photoUrl
            };

            console.log('Creando empleado:', {
                ...empleadoData,
                password: '***OCULTA***',
                fotoPerfil: photoUrl ? 'CON_IMAGEN' : 'SIN_IMAGEN'
            });

            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/empleados', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(empleadoData),
            });

            const responseData = await response.json();
            console.log('Respuesta del servidor:', responseData);

            if (response.ok) {
                console.log('Empleado creado exitosamente');
                clearForm();
                
                if (onSuccess) {
                    onSuccess(responseData.empleado || responseData);
                }
                
                Alert.alert(
                    'Empleado creado',
                    `${responseData.message || 'El empleado ha sido registrado exitosamente.'} ${photoUrl ? 'Con imagen!' : ''}`,
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                console.error('Error del servidor:', responseData);
                Alert.alert(
                    'Error al crear empleado', 
                    responseData.message || 'No se pudo crear el empleado.',
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
        uploadImageToServer: uploadImageToCloudinary,
        
        // Funciones de validación
        validateForm,
        validateField,
        validateBasicData, // Nueva función agregada
        
        // Funciones de limpieza
        clearForm,
        
        // Funciones de creación
        createEmpleado
    };
};