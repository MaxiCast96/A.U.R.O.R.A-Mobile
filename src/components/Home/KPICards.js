import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente de Tarjetas KPI
 * 
 * Este componente muestra los indicadores clave de rendimiento
 * con animaciones sutiles y iconos representativos.
 * Conecta con la API para obtener datos reales del dashboard.
 * 
 * Props:
 * - stats: objeto con las estadísticas (opcional, se obtiene de la API si no se proporciona)
 */
const KPICards = ({ stats: propStats }) => {
    const { getAuthHeaders } = useAuth();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    
    // Estados para manejar los datos desde la API
    const [stats, setStats] = useState({
        totalClientes: 0,
        citasHoy: 0,
        ventasMes: 0,
        ingresosMes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Si se proporcionan stats como props, usarlos directamente
        if (propStats) {
            setStats(propStats);
            setLoading(false);
            startAnimations();
        } else {
            // Si no hay props, cargar datos desde la API
            loadKPIData();
        }
    }, [propStats]);

    /**
     * Función para cargar los datos KPI desde la API
     */
    const loadKPIData = async () => {
        try {
            setLoading(true);
            
            // Verificar que tenemos headers de autenticación
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                console.log('No hay token de autenticación disponible para KPIs');
                setStats({
                    totalClientes: 0,
                    citasHoy: 0,
                    ventasMes: 0,
                    ingresosMes: 0
                });
                setLoading(false);
                startAnimations();
                return;
            }

            console.log('Cargando datos KPI...');

            // Realizar la petición a la API del dashboard
            // Intentar primero la ruta completa, si falla usar stats básicos
            let response = await fetch('https://a-u-r-o-r-a.onrender.com/api/dashboard/all', {
                method: 'GET',
                headers: headers,
            });

            // Si la ruta /all no funciona, usar /stats como fallback
            if (!response.ok && response.status !== 404) {
                console.log('Intentando ruta /stats como fallback...');
                response = await fetch('https://a-u-r-o-r-a.onrender.com/api/dashboard/stats', {
                    method: 'GET',
                    headers: headers,
                });
            }

            console.log('KPI response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Datos KPI recibidos:', data);
                
                // Procesar los datos recibidos
                const processedStats = processKPIData(data);
                setStats(processedStats);
            } else {
                console.log('Error al cargar KPIs, usando datos por defecto');
                // En caso de error, usar datos por defecto
                setStats({
                    totalClientes: 0,
                    citasHoy: 0,
                    ventasMes: 0,
                    ingresosMes: 0
                });
            }
        } catch (error) {
            console.error('Error al cargar datos KPI:', error);
            // En caso de error, usar datos por defecto
            setStats({
                totalClientes: 0,
                citasHoy: 0,
                ventasMes: 0,
                ingresosMes: 0
            });
        } finally {
            setLoading(false);
            startAnimations();
        }
    };

    /**
     * Procesar los datos recibidos de la API
     * @param {Object} data - Datos recibidos de la API
     * @returns {Object} - Objeto con los stats procesados
     */
    const processKPIData = (data) => {
        console.log('Procesando datos KPI:', data);
        
        // Manejar diferentes estructuras de respuesta posibles
        const processedData = {
            totalClientes: 0,
            citasHoy: 0,
            ventasMes: 0,
            ingresosMes: 0
        };

        // Si data es un array, buscar en el primer elemento
        const sourceData = Array.isArray(data) ? data[0] : data;
        
        if (sourceData && typeof sourceData === 'object') {
            // Mapear diferentes nombres de campos posibles
            processedData.totalClientes = 
                sourceData.totalClientes || 
                sourceData.total_clientes || 
                sourceData.clientes || 
                sourceData.clientesTotal ||
                0;
                
            processedData.citasHoy = 
                sourceData.citasHoy || 
                sourceData.citas_hoy || 
                sourceData.citasDelDia ||
                sourceData.citas_del_dia ||
                0;
                
            processedData.ventasMes = 
                sourceData.ventasMes || 
                sourceData.ventas_mes || 
                sourceData.ventasDelMes ||
                sourceData.ventas_del_mes ||
                0;
                
            processedData.ingresosMes = 
                sourceData.ingresosMes || 
                sourceData.ingresos_mes || 
                sourceData.ingresosDelMes ||
                sourceData.ingresos_del_mes ||
                sourceData.totalIngresos ||
                sourceData.total_ingresos ||
                0;
        }

        console.log('Datos KPI procesados:', processedData);
        return processedData;
    };

    /**
     * Iniciar las animaciones de entrada
     */
    const startAnimations = () => {
        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    };

    /**
     * Formatear números para mostrar
     */
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    /**
     * Formatear moneda
     */
    const formatCurrency = (amount) => {
        return `$${formatNumber(amount)}`;
    };

    /**
     * Renderizar tarjeta KPI individual
     */
    const renderKPICard = (title, value, icon, color, isLast = false) => (
        <Animated.View 
            style={[
                styles.kpiCard,
                isLast && styles.lastCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.kpiHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={styles.kpiTitle}>{title}</Text>
            </View>
            <Text style={[styles.kpiValue, { color }]}>{value}</Text>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <Text style={styles.loadingText}>Cargando...</Text>
                </View>
            )}
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Indicadores Clave de Rendimiento</Text>
            <View style={styles.kpiGrid}>
                {renderKPICard(
                    'Total Clientes', 
                    formatNumber(stats.totalClientes || 0), 
                    'people-outline', 
                    '#009BBF'
                )}
                {renderKPICard(
                    'Citas Hoy', 
                    formatNumber(stats.citasHoy || 0), 
                    'calendar-outline', 
                    '#009BBF'
                )}
                {renderKPICard(
                    'Ventas del Mes', 
                    formatNumber(stats.ventasMes || 0), 
                    'bag-outline', 
                    '#009BBF'
                )}
                {renderKPICard(
                    'Ingresos del Mes', 
                    formatCurrency(stats.ingresosMes || 0), 
                    'cash-outline', 
                    '#009BBF',
                    true
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    kpiCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#009BBF',
        position: 'relative',
    },
    lastCard: {
        marginBottom: 0,
    },
    kpiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    kpiTitle: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        flex: 1,
    },
    kpiValue: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    loadingText: {
        fontSize: 10,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
});

export default KPICards;