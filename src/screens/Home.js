import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://aurora-production-7e57.up.railway.app/api';
const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalClientes: 0,
            citasHoy: 0,
            ventasDelMes: 0,
            totalIngresos: 0
        },
        ventasMensuales: [],
        estadoCitas: []
    });

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [clientesRes, citasRes, ventasRes] = await Promise.all([
                axios.get(`${API_URL}/clientes`),
                axios.get(`${API_URL}/citas`),
                axios.get(`${API_URL}/ventas`)
            ]);

            const clientes = clientesRes.data || [];
            const citas = citasRes.data || [];
            const ventas = ventasRes.data || [];

            // Calcular estadísticas
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const citasHoy = citas.filter(cita => {
                const citaDate = new Date(cita.fecha);
                citaDate.setHours(0, 0, 0, 0);
                return citaDate.getTime() === today.getTime();
            }).length;

            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            const ventasDelMes = ventas.filter(venta => {
                const ventaDate = new Date(venta.fecha);
                return ventaDate.getMonth() === currentMonth && 
                       ventaDate.getFullYear() === currentYear;
            }).length;

            const totalIngresos = ventas
                .filter(venta => {
                    const ventaDate = new Date(venta.fecha);
                    return ventaDate.getMonth() === currentMonth && 
                           ventaDate.getFullYear() === currentYear;
                })
                .reduce((sum, venta) => sum + (venta.total || 0), 0);

            // Calcular ventas mensuales (últimos 6 meses)
            const ventasMensuales = [];
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date(currentYear, currentMonth - i, 1);
                const mes = meses[date.getMonth()];
                const ventasMes = ventas.filter(venta => {
                    const ventaDate = new Date(venta.fecha);
                    return ventaDate.getMonth() === date.getMonth() && 
                           ventaDate.getFullYear() === date.getFullYear();
                }).length;
                
                ventasMensuales.push({ mes, ventas: ventasMes });
            }

            // Calcular estado de citas
            const estadoCitasMap = {};
            citas.forEach(cita => {
                const estado = cita.estado || 'Pendiente';
                estadoCitasMap[estado] = (estadoCitasMap[estado] || 0) + 1;
            });

            const estadoCitas = Object.entries(estadoCitasMap).map(([estado, cantidad]) => ({
                estado,
                cantidad
            }));

            setDashboardData({
                stats: {
                    totalClientes: clientes.length,
                    citasHoy,
                    ventasDelMes,
                    totalIngresos
                },
                ventasMensuales,
                estadoCitas
            });
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    // Acciones rápidas
    const handleCreateLentes = () => navigation.navigate('Lentes');
    const handleCreateCita = () => navigation.navigate('Citas');
    const handleCreateReceta = () => navigation.navigate('Recetas');
    const handleCreateHistorial = () => navigation.navigate('HistorialMedico');

    const renderQuickActionButton = (title, icon, onPress, color = '#009BBF') => (
        <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={[color, color + 'DD']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={icon} size={20} color="#FFFFFF" />
                <Text style={styles.quickActionText}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    // Configuración del gráfico de dona
    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(0, 155, 191, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
    };

    // Colores para el gráfico de dona (mismo esquema que web)
    const pieColors = ['#009BBF', '#00B8E6', '#33C7E6', '#66D6E6', '#99E0F0'];
    
    const pieData = dashboardData.estadoCitas.map((item, index) => ({
        name: item.estado,
        population: item.cantidad,
        color: pieColors[index % pieColors.length],
        legendFontColor: '#1A1A1A',
        legendFontSize: 12
    }));

    const userName = user?.nombre || 'Usuario';

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#009BBF" />
                <Text style={styles.loadingText}>Cargando dashboard...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#009BBF']}
                    tintColor="#009BBF"
                />
            }
        >
            {/* Header Superior */}
            <View style={styles.topHeader}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../src/assets/Logo-para-fondo-blanco.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText}>Hola, {userName}</Text>
                    <Text style={styles.subtitleText}>Panel de Administración</Text>
                </View>
                
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="person-circle-outline" size={40} color="#009BBF" />
                </TouchableOpacity>
            </View>

            {/* Acciones Rápidas */}
            <View style={styles.quickActionsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                    <TouchableOpacity onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color="#009BBF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.quickActionsRow}>
                    {renderQuickActionButton('Crear Lentes', 'glasses-outline', handleCreateLentes, '#009BBF')}
                    {renderQuickActionButton('Crear Cita', 'calendar-outline', handleCreateCita, '#009BBF')}
                </View>
                <View style={styles.quickActionsRow}>
                    {renderQuickActionButton('Crear Receta', 'medical-outline', handleCreateReceta, '#009BBF')}
                    {renderQuickActionButton('Historial Médico', 'document-text-outline', handleCreateHistorial, '#009BBF')}
                </View>
            </View>

            {/* Indicadores Clave de Rendimiento */}
            <View style={styles.kpiSection}>
                <Text style={styles.sectionTitle}>Indicadores Clave</Text>
                
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: '#009BBF20' }]}>
                            <Ionicons name="people" size={24} color="#009BBF" />
                        </View>
                        <Text style={styles.kpiLabel}>Total Clientes</Text>
                        <Text style={styles.kpiValue}>{dashboardData.stats.totalClientes}</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: '#009BBF20' }]}>
                            <Ionicons name="calendar" size={24} color="#009BBF" />
                        </View>
                        <Text style={styles.kpiLabel}>Citas Hoy</Text>
                        <Text style={styles.kpiValue}>{dashboardData.stats.citasHoy}</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: '#009BBF20' }]}>
                            <Ionicons name="cart" size={24} color="#009BBF" />
                        </View>
                        <Text style={styles.kpiLabel}>Ventas del Mes</Text>
                        <Text style={styles.kpiValue}>{dashboardData.stats.ventasDelMes}</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: '#009BBF20' }]}>
                            <Ionicons name="cash" size={24} color="#009BBF" />
                        </View>
                        <Text style={styles.kpiLabel}>Ingresos del Mes</Text>
                        <Text style={styles.kpiValue}>
                            ${dashboardData.stats.totalIngresos.toLocaleString('es-MX')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Gráfico de Ventas Mensuales */}
            <View style={styles.chartSection}>
                <Text style={styles.sectionTitle}>Ventas Mensuales</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.barChartContainer}>
                        {dashboardData.ventasMensuales.map((item, index) => {
                            const maxVentas = Math.max(...dashboardData.ventasMensuales.map(v => v.ventas), 1);
                            const heightPercentage = (item.ventas / maxVentas) * 100;
                            
                            return (
                                <View key={index} style={styles.barContainer}>
                                    <View style={styles.barWrapper}>
                                        <View 
                                            style={[
                                                styles.bar, 
                                                { 
                                                    height: `${heightPercentage}%`,
                                                    backgroundColor: '#009BBF'
                                                }
                                            ]}
                                        >
                                            <Text style={styles.barValue}>{item.ventas}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.barLabel}>{item.mes}</Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>

            {/* Gráfico de Estado de Citas (Dona) */}
            {pieData.length > 0 && (
                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Estado de Citas</Text>
                    <View style={styles.pieChartContainer}>
                        <PieChart
                            data={pieData}
                            width={screenWidth - 60}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            center={[10, 0]}
                            hasLegend={true}
                            absolute
                        />
                    </View>
                </View>
            )}

            {/* Información de la óptica */}
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Óptica La Inteligente</Text>
                <Text style={styles.infoText}>
                    Panel administrativo para la gestión integral de tu óptica.
                    Administra clientes, citas, ventas y más desde un solo lugar.
                </Text>

                <View style={styles.sloganContainer}>
                    <Text style={styles.sloganText}>
                        <Text style={styles.sloganGreen}>MIRA BIEN, </Text>
                        <Text style={styles.sloganPink}>LUCE BIEN</Text>
                    </Text>
                </View>
            </View>

            <View style={styles.spacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#009BBF',
        overflow: 'hidden',
    },
    logo: {
        width: 40,
        height: 40,
    },
    greetingContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    greetingText: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    subtitleText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 2,
    },
    profileButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionsSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    quickActionButton: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionGradient: {
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
    },
    quickActionText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        marginTop: 6,
        textAlign: 'center',
        lineHeight: 14,
    },
    kpiSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    kpiCard: {
        width: '48%',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    kpiIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    kpiLabel: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginBottom: 4,
    },
    kpiValue: {
        fontSize: 22,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    chartSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
    },
    barChartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 200,
        paddingTop: 20,
    },
    barContainer: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 50,
    },
    barWrapper: {
        height: 160,
        justifyContent: 'flex-end',
        width: '100%',
    },
    bar: {
        width: '100%',
        backgroundColor: '#009BBF',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        alignItems: 'center',
        paddingTop: 8,
        minHeight: 30,
    },
    barValue: {
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    barLabel: {
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginTop: 8,
    },
    pieChartContainer: {
        alignItems: 'center',
        marginTop: 12,
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        lineHeight: 22,
        marginTop: 8,
        marginBottom: 16,
    },
    sloganContainer: {
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    sloganText: {
        fontSize: 15,
        fontFamily: 'Lato-Bold',
        textAlign: 'center',
    },
    sloganGreen: {
        color: '#49AA4C',
    },
    sloganPink: {
        color: '#D0155F',
    },
    spacer: {
        height: 100,
    },
});

export default HomeScreen;