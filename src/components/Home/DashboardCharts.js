import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useDashboard } from '../../hooks/useDashboard';

/**
 * Componente de Gráficas del Dashboard
 * 
 * Muestra las gráficas de ventas mensuales y estado de citas
 * usando datos reales del hook useDashboard.
 */
const DashboardCharts = () => {
    const { data, loading } = useDashboard();
    const [salesData, setSalesData] = useState(null);
    const [appointmentsData, setAppointmentsData] = useState(null);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        if (data) {
            // Procesar datos de ventas mensuales
            if (data.ventasMensuales && Array.isArray(data.ventasMensuales)) {
                setSalesData(processSalesData(data.ventasMensuales));
            } else {
                setSalesData(getDefaultSalesData());
            }

            // Procesar datos de estado de citas
            if (data.estadoCitas && Array.isArray(data.estadoCitas)) {
                setAppointmentsData(processAppointmentsData(data.estadoCitas));
            } else {
                setAppointmentsData(getDefaultAppointmentsData());
            }
        } else {
            // Datos por defecto si no hay data
            setSalesData(getDefaultSalesData());
            setAppointmentsData(getDefaultAppointmentsData());
        }

        // Animación de entrada
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [data]);

    /**
     * Procesar datos de ventas mensuales para la gráfica de líneas
     */
    const processSalesData = (ventasMensuales) => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const values = new Array(12).fill(0);
        
        ventasMensuales.forEach(item => {
            // Detectar el formato del mes (puede ser número o nombre)
            let monthIndex = -1;
            
            if (typeof item.mes === 'number') {
                monthIndex = item.mes - 1;
            } else if (typeof item.mes === 'string') {
                // Buscar el mes por nombre
                const mesLower = item.mes.toLowerCase();
                monthIndex = months.findIndex(m => m.toLowerCase().startsWith(mesLower.substring(0, 3)));
            }
            
            if (monthIndex >= 0 && monthIndex < 12) {
                values[monthIndex] = Number(item.ventas || item.total || item.cantidad || 0);
            }
        });

        return {
            labels: months,
            datasets: [{
                data: values,
                color: (opacity = 1) => `rgba(0, 155, 191, ${opacity})`,
                strokeWidth: 3,
            }],
            legend: ['Ventas']
        };
    };

    /**
     * Procesar datos de estado de citas para la gráfica de pastel
     * Usa la paleta de colores de la aplicación
     */
    const processAppointmentsData = (estadoCitas) => {
        // Paleta de colores de la aplicación
        const colorPalette = [
            '#49AA4C',  // Verde (del slogan)
            '#D0155F',  // Rosa/Fucsia (del slogan)
            '#009BBF',  // Azul principal
            '#007A9A',  // Azul oscuro
            '#F39C12',  // Naranja
            '#8E44AD',  // Morado
            '#2ECC71',  // Verde claro
            '#E74C3C',  // Rojo
            '#3498DB',  // Azul cielo
            '#1ABC9C',  // Turquesa
        ];

        // Mapeo específico de estados a colores de la paleta
        const stateColors = {
            'completada': '#49AA4C',    // Verde
            'completado': '#49AA4C',    
            'pendiente': '#D0155F',     // Rosa/Fucsia
            'confirmada': '#F39C12',    // Naranja
            'agendada': '#009BBF',      // Azul principal
            'cancelada': '#8E44AD',     // Morado
            'en proceso': '#3498DB',    // Azul cielo
            'reagendada': '#E74C3C',    // Rojo
            'atendida': '#2ECC71',      // Verde claro
            'no asistió': '#95A5A6'     // Gris
        };

        const pieData = estadoCitas
            .filter(item => item.cantidad > 0)
            .map((item, index) => {
                const estadoLower = (item.estado || '').toLowerCase().trim();
                const color = stateColors[estadoLower] || colorPalette[index % colorPalette.length];
                
                return {
                    name: item.estado || 'Sin estado',
                    population: Number(item.cantidad || 0),
                    color: color,
                    legendFontColor: '#1A1A1A',
                    legendFontSize: 12
                };
            });

        return pieData.length > 0 ? pieData : getDefaultAppointmentsData();
    };

    /**
     * Datos por defecto para ventas (cuando no hay datos)
     */
    const getDefaultSalesData = () => {
        return {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                data: [2, 3, 1, 4, 3, 5, 4, 6, 5, 3, 2, 4],
                color: (opacity = 1) => `rgba(0, 155, 191, ${opacity})`,
                strokeWidth: 3,
            }],
            legend: ['Ventas']
        };
    };

    /**
     * Datos por defecto para citas (cuando no hay datos)
     */
    const getDefaultAppointmentsData = () => {
        return [
            { 
                name: 'Confirmada', 
                population: 4, 
                color: '#F39C12', 
                legendFontColor: '#1A1A1A', 
                legendFontSize: 12 
            },
            { 
                name: 'Pendiente', 
                population: 12, 
                color: '#D0155F', 
                legendFontColor: '#1A1A1A', 
                legendFontSize: 12 
            },
        ];
    };

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

    if (loading || !salesData || !appointmentsData) {
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
            </View>

            {/* Gráfica de Estado de Citas */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Estado de Citas</Text>
                <View style={styles.pieChartContainer}>
                    <PieChart
                        data={appointmentsData}
                        width={screenWidth - 60}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        center={[10, 0]}
                        style={styles.chart}
                        hasLegend={true}
                        absolute={false}
                    />
                </View>
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
});

export default DashboardCharts;