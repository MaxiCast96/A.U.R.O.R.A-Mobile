import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from './useDashboard';

export const useHome = () => {
    const { user, getAuthHeaders } = useAuth();
    const { data, loading: dashboardLoading, reload } = useDashboard();
    
    // Estados principales
    const [stats, setStats] = useState({
        totalClientes: 0,
        citasHoy: 0,
        ventasMes: 0,
        ingresosMes: 0
    });
    const [profileData, setProfileData] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    
    // Animación de entrada
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Procesar datos del dashboard cuando cambien
    useEffect(() => {
        if (data?.stats) {
            const statsData = data.stats;
            setStats({
                totalClientes: Number(statsData.totalClientes || statsData.total_clientes || 0),
                citasHoy: Number(statsData.citasHoy || statsData.citas_hoy || 0),
                ventasMes: Number(statsData.ventasDelMes || statsData.ventas_mes || 0),
                ingresosMes: Number(statsData.totalIngresos || statsData.ingresos_mes || 0)
            });
        }
    }, [data]);

    const loadProfileData = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) return;
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${user.id}`, {
                method: 'GET',
                headers: headers,
            });
            
            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([reload(), loadProfileData()]);
        setRefreshing(false);
    };

    const getProfilePhotoUrl = () => {
        return profileData.photoUrl || 
               profileData.fotoPerfil || 
               user?.photoUrl || 
               user?.fotoPerfil || 
               null;
    };

    const getUserName = () => {
        return profileData.nombre || 
               user?.nombre || 
               user?.email || 
               'Usuario';
    };

    // Navegación a pantallas disponibles
    const handleCreateLentes = (navigation) => {
        if (navigation) {
            navigation.navigate('Lentes');
        }
    };

    const handleCreateCita = (navigation) => {
        if (navigation) {
            navigation.navigate('Citas');
        }
    };

    const handleCreateReceta = (navigation) => {
        if (navigation) {
            navigation.navigate('Recetas');
        }
    };

    const handleCreatePromocion = (navigation) => {
        if (navigation) {
            navigation.navigate('Promociones');
        }
    };

    useEffect(() => {
        loadProfileData();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    return {
        stats,
        profileData,
        refreshing,
        loading: dashboardLoading,
        fadeAnim,
        onRefresh,
        getProfilePhotoUrl,
        getUserName,
        handleCreateLentes,
        handleCreateCita,
        handleCreateReceta,
        handleCreatePromocion
    };
};