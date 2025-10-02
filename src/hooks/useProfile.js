import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar el estado y operaciones del perfil de usuario
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Carga de datos del perfil del usuario
 * - Actualización de campos individuales del perfil
 * - Actualización de foto de perfil
 * - Estados de guardado y mensajes de feedback
 * - Manejo de refresh y errores
 * 
 * @returns {Object} Objeto con estados y funciones para manejar el perfil
 */
export const useProfile = () => {
    const { user, updateUser, getAuthHeaders } = useAuth();
    
    // Estados principales
    const [profileData, setProfileData] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const [saveMessage, setSaveMessage] = useState('');

    /**
     * Función para cargar los datos completos del perfil desde el servidor
     * Incluye manejo de errores y validación de respuesta JSON
     */
    const loadProfileData = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                console.log('No hay token de autenticación disponible para perfil');
                return;
            }
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${user.id}`, {
                method: 'GET',
                headers: headers,
            });
            
            console.log('Response status perfil:', response.status);
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('El servidor no devolvió JSON válido para perfil');
                const textResponse = await response.text();
                console.log('Response text perfil:', textResponse);
                return;
            }
            
            if (response.ok) {
                const data = await response.json();
                console.log('Datos del perfil recibidos:', data);
                setProfileData(data);
            } else {
                console.log('Error en la respuesta del perfil:', response.status);
                const errorData = await response.text();
                console.log('Error data perfil:', errorData);
                Alert.alert(
                    'Error de conexión', 
                    'No se pudieron cargar los datos del perfil.',
                    [{ text: 'Entendido', style: 'default' }]
                );
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Reintentar', onPress: loadProfileData, style: 'default' }]
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función para actualizar un campo específico del perfil
     * @param {string} field - Nombre del campo a actualizar
     * @param {any} value - Nuevo valor para el campo
     */
    const updateProfileField = async (field, value) => {
        try {
            setSaveStatus('saving');
            setSaveMessage(`Guardando ${field}...`);
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                throw new Error('No hay token de autenticación disponible');
            }
            
            console.log(`Actualizando campo ${field} con valor:`, value);
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${user.id}`, {
                method: 'PUT',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    [field]: value
                }),
            });
            
            console.log('Response status actualización:', response.status);
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('El servidor no devolvió JSON válido para actualización');
                const textResponse = await response.text();
                console.log('Response text actualización:', textResponse);
                throw new Error('Respuesta del servidor no válida');
            }
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('Campo actualizado correctamente:', responseData);
                
                // Extraer el empleado de la respuesta (el backend devuelve { empleado: {...}, message: "..." })
                const updatedData = responseData.empleado || responseData;
                
                // Actualizar el estado local
                setProfileData(prev => ({
                    ...prev,
                    [field]: value
                }));
                
                // Actualizar el contexto de autenticación si es necesario
                if (['nombre', 'apellido', 'correo', 'fotoPerfil'].includes(field)) {
                    // Asegurarse de mantener el ID del usuario
                    const userUpdate = {
                        ...updatedData,
                        id: user.id,
                        _id: user.id
                    };
                    updateUser && updateUser(userUpdate);
                    console.log('Contexto de Auth actualizado con:', userUpdate);
                }
                
                setSaveStatus('saved');
                setSaveMessage('Cambios guardados correctamente');
            } else {
                console.log('Error en actualización:', response.status);
                const errorData = await response.text();
                console.log('Error data actualización:', errorData);
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al actualizar campo:', error);
            setSaveStatus('error');
            setSaveMessage('Error al guardar cambios');
            throw error; // Re-lanzar para que el componente pueda manejarlo
        }
    };

    /**
     * Función específica para actualizar la foto de perfil
     * @param {string} photoUrl - Nueva URL de la foto de perfil (ya subida a Cloudinary)
     */
    const updateProfilePhoto = async (photoUrl) => {
        try {
            setSaveStatus('saving');
            setSaveMessage('Actualizando foto de perfil...');
            
            console.log('Actualizando fotoPerfil en BD con URL:', photoUrl);
            
            // Actualizar el campo 'fotoPerfil' en la base de datos
            await updateProfileField('fotoPerfil', photoUrl);
            
            setSaveStatus('saved');
            setSaveMessage('Foto actualizada correctamente');
            
            console.log('Foto de perfil actualizada exitosamente en la BD');
        } catch (error) {
            console.error('Error al actualizar foto en BD:', error);
            setSaveStatus('error');
            setSaveMessage('Error al actualizar la foto');
            Alert.alert(
                'Error',
                'No se pudo actualizar la foto de perfil en el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
        }
    };

    /**
     * Función para manejar el refresh de la pantalla
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadProfileData();
        setRefreshing(false);
    };

    /**
     * Función para obtener los datos combinados del usuario
     * Combina datos del contexto de auth con datos del perfil cargado
     */
    const getUserData = () => {
        return {
            // Valores por defecto
            nombre: '',
            apellido: '',
            correo: '',
            telefono: '',
            dui: '',
            cargo: '',
            photoUrl: '',
            fotoPerfil: '',
            fechaContratacion: '',
            sucursalId: '',
            direccion: { departamento: '', municipio: '', direccionDetallada: '' },
            // Datos del contexto de auth
            ...user,
            // Datos del perfil (tienen prioridad)
            ...profileData,
            // Manejo especial para la foto de perfil - unificar ambos campos
            photoUrl: profileData.fotoPerfil || profileData.photoUrl || user?.fotoPerfil || user?.photoUrl || '',
            // Manejo especial para la sucursal
            sucursalId: profileData.sucursalId || user?.sucursalId || '',
            // Manejo especial para la dirección
            direccion: profileData.direccion || user?.direccion || { departamento: '', municipio: '', direccionDetallada: '' },
        };
    };

    /**
     * Función para mostrar la información de sucursal de forma amigable
     * @param {string|Object} sucursalId - ID de sucursal o objeto sucursal
     */
    const getSucursalDisplay = (sucursalId) => {
        if (!sucursalId) return 'No asignada';
        if (typeof sucursalId === 'object' && sucursalId.nombre) return sucursalId.nombre;
        if (typeof sucursalId === 'string') return sucursalId;
        return 'No asignada';
    };

    /**
     * Efecto para cargar los datos del perfil al montar el componente
     * Y recargar cuando el usuario del contexto cambie
     */
    useEffect(() => {
        loadProfileData();
    }, [user.id]);
    
    /**
     * Efecto para escuchar cambios en el contexto de Auth
     * y actualizar profileData cuando se actualice la foto
     */
    useEffect(() => {
        if (user.fotoPerfil && user.fotoPerfil !== profileData.fotoPerfil) {
            console.log('Foto actualizada en contexto, sincronizando profileData');
            setProfileData(prev => ({
                ...prev,
                fotoPerfil: user.fotoPerfil,
                photoUrl: user.fotoPerfil
            }));
        }
    }, [user.fotoPerfil]);

    // Retornar todos los estados y funciones necesarias
    return {
        // Estados de datos
        profileData,
        loading,
        refreshing,
        
        // Estados de guardado
        saveStatus,
        saveMessage,
        
        // Funciones de datos
        loadProfileData,
        updateProfileField,
        updateProfilePhoto,
        onRefresh,
        
        // Funciones de utilidad
        getUserData,
        getSucursalDisplay,
        
        // Funciones para actualizar estados
        setSaveStatus,
        setSaveMessage
    };
};