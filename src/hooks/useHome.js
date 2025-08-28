import { useState, useEffect, useRef } from 'react';
import { Animated, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar el estado y operaciones de la pantalla Home
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Carga de estadísticas del dashboard
 * - Carga de datos del perfil del usuario
 * - Animaciones de entrada
 * - Manejo de refresh
 * - Acciones rápidas del dashboard
 * 
 * @returns {Object} Objeto con estados y funciones para manejar la pantalla Home
 */
export const useHome = () => {
    const { user, getAuthHeaders } = useAuth();
    
    // Estados principales
    const [stats, setStats] = useState({
        totalClientes: 0,
        citasHoy: 0,
        ventasMes: 0,
        ingresosMes: 0,
        pacientesActivos: 0
    });
    const [profileData, setProfileData] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    
    // Animación de entrada
    const fadeAnim = useRef(new Animated.Value(0)).current;

    /**
     * Función para cargar los datos del perfil del usuario
     * Se utiliza para mostrar información actualizada en el header
     */
    const loadProfileData = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                console.log('No hay token de autenticación disponible para perfil');
                return;
            }
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${user.id}`, {
                method: 'GET',
                headers: headers,
            });
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('El servidor no devolvió JSON válido para perfil');
                return;
            }
            
            if (response.ok) {
                const data = await response.json();
                console.log('Datos del perfil cargados en Home:', data);
                setProfileData(data);
            }
        } catch (error) {
            console.error('Error al cargar perfil en Home:', error);
        }
    };

    /**
     * Función para cargar las estadísticas del dashboard
     * Obtiene métricas clave como clientes, citas, ventas, etc.
     */
    const loadStats = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                console.log('No hay token de autenticación disponible');
                return;
            }
            
            console.log('Cargando estadísticas...');
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/dashboard/all', {
                method: 'GET',
                headers: headers,
            });
            
            console.log('Response status:', response.status);
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('El servidor no devolvió JSON válido para estadísticas');
                const textResponse = await response.text();
                console.log('Response text:', textResponse);
                return;
            }
            
            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos:', data);
                setStats({
                    totalClientes: data.totalClientes || data.total_clientes || 0,
                    citasHoy: data.citasHoy || data.citas_hoy || 0,
                    ventasMes: data.ventasMes || data.ventas_mes || 0,
                    ingresosMes: data.ingresosMes || data.ingresos_mes || 0,
                    pacientesActivos: data.pacientesActivos || data.pacientes_activos || 0
                });
            } else {
                console.log('Error en la respuesta:', response.status);
                const errorData = await response.text();
                console.log('Error data:', errorData);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    /**
     * Función para manejar el refresh de la pantalla
     * Recarga tanto estadísticas como datos del perfil
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadStats(), loadProfileData()]);
        setRefreshing(false);
    };

    /**
     * Obtener la URL de la foto de perfil desde múltiples fuentes posibles
     */
    const getProfilePhotoUrl = () => {
        return profileData.photoUrl || 
               profileData.fotoPerfil || 
               user?.photoUrl || 
               user?.fotoPerfil || 
               null;
    };

    /**
     * Obtener el nombre del usuario desde múltiples fuentes posibles
     */
    const getUserName = () => {
        return profileData.nombre || 
               user?.nombre || 
               user?.email || 
               'Usuario';
    };

    /**
     * Funciones para manejar las acciones rápidas
     * Estas muestran confirmaciones antes de navegar
     */
    const handleCreateLentes = () => {
        Alert.alert(
            'Crear Lentes',
            '¿Desea crear un nuevo registro de lentes?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Crear',
                    onPress: () => {
                        console.log('Navegando a crear lentes...');
                        // Aquí se implementaría la navegación
                    }
                }
            ]
        );
    };

    const handleCreateCita = () => {
        Alert.alert(
            'Crear Cita',
            '¿Desea agendar una nueva cita?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Crear',
                    onPress: () => {
                        console.log('Navegando a crear cita...');
                        // Aquí se implementaría la navegación
                    }
                }
            ]
        );
    };

    const handleCreateReceta = () => {
        Alert.alert(
            'Crear Receta',
            '¿Desea crear una nueva receta médica?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Crear',
                    onPress: () => {
                        console.log('Navegando a crear receta...');
                        // Aquí se implementaría la navegación
                    }
                }
            ]
        );
    };

    const handleCreatePromocion = () => {
        Alert.alert(
            'Crear Promoción',
            '¿Desea crear una nueva promoción?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Crear',
                    onPress: () => {
                        console.log('Navegando a crear promoción...');
                        // Aquí se implementaría la navegación
                    }
                }
            ]
        );
    };

    /**
     * Inicializar la animación de entrada cuando se monta el componente
     */
    const initializeAnimation = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    };

    /**
     * Efecto para cargar datos iniciales y configurar animaciones
     */
    useEffect(() => {
        loadStats();
        loadProfileData();
        initializeAnimation();
    }, []);

    // Retornar todos los estados y funciones necesarias
    return {
        // Estados de datos
        stats,
        profileData,
        refreshing,
        
        // Animación
        fadeAnim,
        
        // Funciones de datos
        loadStats,
        loadProfileData,
        onRefresh,
        
        // Funciones de utilidad
        getProfilePhotoUrl,
        getUserName,
        
        // Handlers de acciones rápidas
        handleCreateLentes,
        handleCreateCita,
        handleCreateReceta,
        handleCreatePromocion
    };
};