import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getTelefonoNumbers } from '../../utils/validator';

export const useAddOptometrista = () => {
    const { getAuthHeaders } = useAuth();

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

    /**
     * Validar campos específicos del optometrista
     */
    const validateOptometristaForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validar especialidad
        if (!especialidad || especialidad === '') {
            newErrors.especialidad = 'La especialidad es requerida';
            isValid = false;
        }

        // Validar número de licencia
        if (!numeroLicencia.trim()) {
            newErrors.numeroLicencia = 'El número de licencia es requerido';
            isValid = false;
        } else if (numeroLicencia.trim().length < 4) {
            newErrors.numeroLicencia = 'El número de licencia debe tener al menos 4 caracteres';
            isValid = false;
        }

        // Validar años de experiencia
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
    };

    /**
     * Subir imagen a Cloudinary
     */
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

    /**
     * Crear empleado y optometrista
     */
    const createOptometrista = async (empleadoData, onSuccess) => {
        console.log('Iniciando creación de optometrista...');
        
        if (!validateOptometristaForm()) {
            console.log('Formulario de optometrista no válido:', errors);
            return false;
        }

        if (!empleadoData) {
            Alert.alert('Error', 'No se encontraron los datos del empleado');
            return false;
        }

        setLoading(true);
        
        try {
            let photoUrl = "";
            
            // Manejar imagen si existe
            if (empleadoData.fotoPerfil) {
                console.log('Subiendo imagen primero...');
                try {
                    photoUrl = await uploadImageToCloudinary(empleadoData.fotoPerfil);
                    console.log('URL de imagen obtenida:', photoUrl);
                } catch (imageError) {
                    console.log('Error subiendo imagen:', imageError.message);
                    
                    // Preguntar si continuar sin imagen cuando falla la subida
                    const continuar = await new Promise((resolve) => {
                        Alert.alert(
                            'Error al subir imagen',
                            '¿Deseas crear el optometrista sin foto de perfil?',
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
            }

            // Preparar datos del empleado
            const empleadoFinalData = {
                ...empleadoData,
                telefono: getTelefonoNumbers(empleadoData.telefono),
                correo: empleadoData.correo.toLowerCase(),
                fotoPerfil: photoUrl
            };

            // Primero crear el empleado
            console.log('Creando empleado:', {
                ...empleadoFinalData,
                password: '***OCULTA***',
                fotoPerfil: photoUrl ? 'CON_IMAGEN' : 'SIN_IMAGEN'
            });

            const empleadoResponse = await fetch('https://a-u-r-o-r-a.onrender.com/api/empleados', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(empleadoFinalData),
            });

            const empleadoResponseData = await empleadoResponse.json();
            console.log('Respuesta del servidor (empleado):', empleadoResponseData);

            if (!empleadoResponse.ok) {
                console.error('Error creando empleado:', empleadoResponseData);
                Alert.alert(
                    'Error al crear empleado', 
                    empleadoResponseData.message || 'No se pudo crear el empleado.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }

            // Obtener ID del empleado creado
            const empleadoId = empleadoResponseData.empleado?._id || empleadoResponseData._id;
            
            if (!empleadoId) {
                console.error('No se obtuvo ID del empleado creado');
                Alert.alert('Error', 'Error interno: No se pudo obtener el ID del empleado');
                return false;
            }

            // Preparar datos del optometrista
            const optometristaData = {
                empleadoId: empleadoId,
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
                sucursalesAsignadas: sucursalesAsignadas || []
            };

            console.log('Creando optometrista:', optometristaData);

            // Crear el optometrista - CORREGIDA LA RUTA
            const optometristaResponse = await fetch('https://a-u-r-o-r-a.onrender.com/api/empleados/optometrista', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(optometristaData),
            });

            const optometristaResponseData = await optometristaResponse.json();
            console.log('Respuesta del servidor (optometrista):', optometristaResponseData);

            if (optometristaResponse.ok) {
                console.log('Optometrista creado exitosamente');
                
                // Limpiar formulario
                clearOptometristaForm();
                
                Alert.alert(
                    'Optometrista creado exitosamente',
                    `${optometristaResponseData.message || 'El optometrista ha sido registrado correctamente.'} ${photoUrl ? 'Con imagen!' : ''}`,
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                // Llamar callback de éxito
                if (onSuccess) {
                    onSuccess({
                        empleado: empleadoResponseData.empleado || empleadoResponseData,
                        optometrista: optometristaResponseData.optometrista || optometristaResponseData
                    });
                }
                
                return true;
            } else {
                console.error('Error creando optometrista:', optometristaResponseData);
                Alert.alert(
                    'Error al crear optometrista', 
                    optometristaResponseData.message || 'No se pudo crear el optometrista.',
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

    /**
     * Limpiar formulario de optometrista
     */
    const clearOptometristaForm = () => {
        setEspecialidad('');
        setNumeroLicencia('');
        setExperiencia('');
        setEstadoDisponibilidad('Disponible');
        setDisponibilidad([]);
        setSucursalesAsignadas([]);
        setErrors({});
    };

    /**
     * Validar campo individual
     */
    const validateField = (field, value) => {
        let error = null;
        
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
        }

        setErrors(prev => ({ ...prev, [field]: error }));
        return !error;
    };

    return {
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

        // Opciones
        especialidades,

        // Funciones principales
        createOptometrista,
        clearOptometristaForm,
        validateOptometristaForm,
        validateField,
        uploadImageToCloudinary
    };