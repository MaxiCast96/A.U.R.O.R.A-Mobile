import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente de Gráficas del Dashboard
 * 
 * Este componente muestra las gráficas de ventas mensuales
 * y estado de citas utilizando datos reales de la API.
 * 
 * Funcionalidades:
 * - Gráfica de líneas para ventas mensuales
 * - Gráfica de pastel para estado de citas
 * - Animaciones de entrada
 * - Conexión con la API
 */
const DashboardCharts = () => {
    const { getAuthHeaders } = useAuth();
    const [salesData, setSalesData] = useState(null);
    const [appointmentsData, setAppointmentsData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        loadChartsData();
        
        // Animación de entrada
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    /**
     * Cargar datos para las gráficas
     */
    const loadChartsData = async () => {
        try {
            setLoading(true);
            
            // Cargar datos de ventas mensuales
            const salesResponse = await fetch('https://a-u-r-o-r-a.onrender.com/api/stats/sales-monthly', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            // Cargar datos de estado de citas
            const appointmentsResponse = await fetch('https://a-u-r-o-r-a.onrender.com/api/stats/appointments-status', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (salesResponse.ok) {
                const salesResult = await salesResponse.json();
                setSalesData(processSalesData(salesResult));
            }

            if (appointmentsResponse.ok) {
                const appointmentsResult = await appointmentsResponse.json();
                setAppointmentsData(processAppointmentsData(appointmentsResult));
            }

        } catch (error) {
            console.error('Error al cargar datos de gráficas:', error);
            // Datos de ejemplo en caso de error
            setSalesData(getDefaultSalesData());
            setAppointmentsData(getDefaultAppointmentsData());
        } finally {
            setLoading(false);
        }
    };

    /**
     * Procesar datos de ventas para la gráfica
     */
    const processSalesData = (data) => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const values = new Array(12).fill(0);
        
        if (data && Array.isArray(data)) {
            data.forEach(item => {
                if (item.month && item.month >= 1 && item.month <= 12) {
                    values[item.month - 1] = item.total || 0;
                }
            });
        }

        return {
            labels: months,
            datasets: [{
                data: values,
                color: (opacity = 1) => `rgba(0, 155, 191, ${opacity})`,
                strokeWidth: 3,
            }]
        };
    };

    /**
     * Procesar datos de citas para la gráfica de pastel
     */
    const processAppointmentsData = (data) => {
        const colors = ['#009BBF', '#49AA4C', '#D0155F'];
        const defaultData = [
            { name: 'Completada', population: 0, color: colors[0] },
            { name: 'Pendiente', population: 0, color: colors[1] },
            { name: 'Agendada', population: 0, color: colors[2] },
        ];

        if (data && Array.isArray(data)) {
            data.forEach(item => {
                const index = defaultData.findIndex(d => d.name.toLowerCase() === item.status?.toLowerCase());
                if (index !== -1) {
                    defaultData[index].population = item.count || 0;
                }
            });
        }

        return defaultData;
    };

    /**
     * Datos por defecto para ventas
     */
    const getDefaultSalesData = () => ({
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(0, 155, 191, ${opacity})`,
            strokeWidth: 3,
        }]
    });

    /**
     * Datos por defecto para citas
     */
    const getDefaultAppointmentsData = () => ([
        { name: 'Completada', population: 2, color: '#009BBF' },
        { name: 'Pendiente', population: 3, color: '#49AA4C' },
        { name: 'Agendada', population: 1, color: '#D0155F' },
    ]);

    /**
     * Configuración del gráfico
     */
    const chartConfig = {
        backgroundColor: '#FFFFFF',
        backgroundGradientFrom: '#FFFFFF',
        backgroundGradientTo: '#FFFFFF',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 155, 191, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForLabels: {
            fontFamily: 'Lato-Regular',
            fontSize: 10,
        },
        propsForVerticalLabels: {
            fontFamily: 'Lato-Regular',
            fontSize: 10,
        },
        propsForHorizontalLabels: {
            fontFamily: 'Lato-Regular',
            fontSize: 10,
        },
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Cargando gráficas...</Text>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Gráfica de Ventas Mensuales */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Ventas Mensuales</Text>
                {salesData && (
                    <LineChart
                        data={salesData}
                        width={screenWidth - 60}
                        height={200}
                        chartConfig={chartConfig}
                        style={styles.chart}
                        bezier
                        withDots={true}
                        withShadow={false}
                        withInnerLines={false}
                        withOuterLines={true}
                        withVerticalLines={false}
                        withHorizontalLines={true}
                    />
                )}
            </View>

            {/* Gráfica de Estado de Citas */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Estado de Citas</Text>
                {appointmentsData && (
                    <View style={styles.pieChartContainer}>
                        <PieChart
                            data={appointmentsData}
                            width={screenWidth - 60}
                            height={200}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            style={styles.chart}
                        />
                        <View style={styles.legend}>
                            {appointmentsData.map((item, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                    <Text style={styles.legendText}>
                                        {item.name}: {item.population}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 0,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'center',
        padding: 40,
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    chartTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
        textAlign: 'center',
    },
    chart: {
        borderRadius: 8,
    },
    pieChartContainer: {
        alignItems: 'center',
    },
    legend: {
        marginTop: 16,
        alignItems: 'flex-start',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
});

export default DashboardCharts;