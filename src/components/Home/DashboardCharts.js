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
            
            // Verificar que tenemos headers de autenticación
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                console.log('No hay token de autenticación disponible para gráficas');
                setSalesData(getDefaultSalesData());
                setAppointmentsData(getDefaultAppointmentsData());
                setLoading(false);
                return;
            }

            console.log('Cargando datos de gráficas...');

            // Cargar datos de ventas mensuales
            try {
                console.log('Cargando datos de ventas...');
                const salesResponse = await fetch('https://a-u-r-o-r-a.onrender.com/api/dashboard/ventas-mensuales', {
                    method: 'GET',
                    headers: headers,
                });

                console.log('Sales response status:', salesResponse.status);

                if (salesResponse.ok) {
                    const salesResult = await salesResponse.json();
                    console.log('Datos de ventas recibidos:', salesResult);
                    setSalesData(processSalesData(salesResult));
                } else {
                    console.log('Error al cargar ventas, usando datos por defecto');
                    setSalesData(getDefaultSalesData());
                }
            } catch (salesError) {
                console.error('Error en ventas:', salesError);
                setSalesData(getDefaultSalesData());
            }

            // Cargar datos de estado de citas
            try {
                console.log('Cargando datos de estado de citas...');
                const appointmentsResponse = await fetch('https://a-u-r-o-r-a.onrender.com/api/dashboard/estado-citas', {
                    method: 'GET',
                    headers: headers,
                });

                console.log('Appointments response status:', appointmentsResponse.status);

                if (appointmentsResponse.ok) {
                    const appointmentsResult = await appointmentsResponse.json();
                    console.log('Datos de citas recibidos:', appointmentsResult);
                    setAppointmentsData(processAppointmentsData(appointmentsResult));
                } else {
                    console.log('Error al cargar estado de citas, usando datos por defecto');
                    setAppointmentsData(getDefaultAppointmentsData());
                }
            } catch (appointmentsError) {
                console.error('Error en citas:', appointmentsError);
                setAppointmentsData(getDefaultAppointmentsData());
            }

        } catch (error) {
            console.error('Error general al cargar datos de gráficas:', error);
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
        console.log('Procesando datos de ventas:', data);
        
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const values = new Array(12).fill(0);
        
        // Procesar diferentes estructuras de datos posibles
        let salesArray = data;
        
        // Si data es un objeto, buscar la propiedad que contiene el array
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            salesArray = data.ventas || data.ventasMensuales || data.data || data.results || [];
        }
        
        if (Array.isArray(salesArray)) {
            salesArray.forEach(item => {
                // Manejar diferentes formatos de mes
                let monthIndex = -1;
                
                if (item.mes) {
                    monthIndex = parseInt(item.mes) - 1;
                } else if (item.month) {
                    monthIndex = parseInt(item.month) - 1;
                } else if (item.fecha) {
                    // Si viene una fecha, extraer el mes
                    const date = new Date(item.fecha);
                    monthIndex = date.getMonth();
                }
                
                if (monthIndex >= 0 && monthIndex < 12) {
                    values[monthIndex] = item.total || item.ventas || item.cantidad || 0;
                }
            });
        }

        console.log('Valores procesados para ventas:', values);

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
        console.log('Procesando datos de citas:', data);
        
        const colors = ['#49AA4C', '#D0155F', '#009BBF'];
        const defaultData = [
            { 
                name: 'Completada', 
                population: 0, 
                color: colors[0], 
                legendFontColor: '#1A1A1A', 
                legendFontSize: 12 
            },
            { 
                name: 'Pendiente', 
                population: 0, 
                color: colors[1], 
                legendFontColor: '#1A1A1A', 
                legendFontSize: 12 
            },
            { 
                name: 'Agendada', 
                population: 0, 
                color: colors[2], 
                legendFontColor: '#1A1A1A', 
                legendFontSize: 12 
            },
        ];

        // Procesar diferentes estructuras de datos posibles
        let appointmentsArray = data;
        
        // Si data es un objeto, buscar la propiedad que contiene el array
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            appointmentsArray = data.citas || data.estadoCitas || data.data || data.results || [];
        }

        if (Array.isArray(appointmentsArray)) {
            appointmentsArray.forEach(item => {
                // Buscar coincidencias por diferentes nombres de estado
                const estado = (item.estado || item.status || item.tipo || '').toLowerCase();
                
                let targetItem = null;
                
                if (estado.includes('complet') || estado.includes('finaliz') || estado.includes('termin')) {
                    targetItem = defaultData.find(d => d.name === 'Completada');
                } else if (estado.includes('pendiente') || estado.includes('progreso') || estado.includes('proceso')) {
                    targetItem = defaultData.find(d => d.name === 'Pendiente');
                } else if (estado.includes('agenda') || estado.includes('program') || estado.includes('cita')) {
                    targetItem = defaultData.find(d => d.name === 'Agendada');
                }
                
                if (targetItem) {
                    targetItem.population = item.cantidad || item.count || item.total || 0;
                }
            });
        }

        console.log('Datos procesados para citas:', defaultData);
        return defaultData;
    };

    /**
     * Datos por defecto para ventas
     */
    const getDefaultSalesData = () => {
        console.log('Usando datos por defecto para ventas');
        return {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                data: [0, 1, 0, 2, 1, 0, 1, 0, 0, 0, 0, 0], // Algunos valores de ejemplo
                color: (opacity = 1) => `rgba(0, 155, 191, ${opacity})`,
                strokeWidth: 3,
            }]
        };
    };

    /**
     * Datos por defecto para citas
     */
    const getDefaultAppointmentsData = () => {
        console.log('Usando datos por defecto para citas');
        return [
            { 
                name: 'Completada', 
                population: 2, 
                color: '#009BBF', 
                legendFontColor: '#1A1A1A', 
                legendFontSize: 12 
            },
            { 
                name: 'Pendiente', 
                population: 3, 
                color: '#49AA4C', 
                legendFontColor: '#1A1A1A', 
                legendFontSize: 12 
            },
            { 
                name: 'Agendada', 
                population: 1, 
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
                {salesData ? (
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
                ) : (
                    <Text style={styles.noDataText}>No hay datos de ventas disponibles</Text>
                )}
            </View>

            {/* Gráfica de Estado de Citas */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Estado de Citas</Text>
                {appointmentsData && appointmentsData.some(item => item.population > 0) ? (
                    <View style={styles.pieChartContainer}>
                        <PieChart
                            data={appointmentsData}
                            width={screenWidth - 60}
                            height={220} // Aumentado para dar espacio a la leyenda con porcentajes
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            style={styles.chart}
                            hasLegend={true} // Activamos la leyenda para mostrar porcentajes
                            absolute // Muestra valores absolutos y porcentajes
                        />
                        {/* Leyenda personalizada adicional si es necesaria */}
                        <View style={styles.legend}>
                            {appointmentsData.map((item, index) => {
                                const total = appointmentsData.reduce((sum, data) => sum + data.population, 0);
                                const percentage = total > 0 ? Math.round((item.population / total) * 100) : 0;
                                
                                return (
                                    <View key={index} style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                        <Text style={styles.legendText}>
                                            {item.name}: {item.population} ({percentage}%)
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ) : (
                    <Text style={styles.noDataText}>No hay datos de citas disponibles</Text>
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
    noDataText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#999999',
        textAlign: 'center',
        padding: 20,
        fontStyle: 'italic',
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