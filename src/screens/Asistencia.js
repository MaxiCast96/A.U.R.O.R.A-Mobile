import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAsistencia } from '../hooks/useAsitencia';
import SucursalSection from '../components/AsistenciaEmp/SucursalSection';

const Asistencia = () => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const {
        empleadosPorSucursal,
        loading,
        refreshing,
        selectedFilter,
        selectedSucursalFilter,
        sucursales,
        onRefresh,
        toggleDisponibilidad,
        setSelectedFilter,
        setSelectedSucursalFilter,
        getEstadisticasGenerales
    } = useAsistencia();

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const stats = getEstadisticasGenerales();
    const sucursalesList = empleadosPorSucursal ? Object.values(empleadosPorSucursal) : [];

    const renderFiltrosDisponibilidad = () => {
        const filtros = [
            { id: 'todos', label: 'Todos', icon: 'people' },
            { id: 'disponibles', label: 'Disponibles', icon: 'checkmark-circle' },
            { id: 'no-disponibles', label: 'No disponibles', icon: 'close-circle' }
        ];

        return (
            <View style={styles.filtrosContainer}>
                <Text style={styles.filtrosSectionTitle}>ESTADO</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtrosContent}
                >
                    {filtros.map((filtro) => {
                        const isSelected = selectedFilter === filtro.id;
                        return (
                            <TouchableOpacity
                                key={filtro.id}
                                style={[
                                    styles.filtroChip,
                                    isSelected && styles.filtroChipSelected
                                ]}
                                onPress={() => setSelectedFilter(filtro.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons 
                                    name={filtro.icon} 
                                    size={15} 
                                    color={isSelected ? '#FFFFFF' : '#666666'} 
                                />
                                <Text style={[
                                    styles.filtroText,
                                    isSelected && styles.filtroTextSelected
                                ]}>
                                    {filtro.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

   

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b3c0c3ff" />
            <Text style={styles.loadingText}>Cargando asistencia...</Text>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay empleados</Text>
            <Text style={styles.emptySubtitle}>
                {selectedFilter !== 'todos' || selectedSucursalFilter !== 'todas'
                    ? 'No se encontraron empleados con estos filtros' 
                    : 'No hay empleados activos registrados'}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header compacto */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerTitleContainer}>
                            <Ionicons name="clipboard" size={26} color="#FFFFFF" />
                            <Text style={styles.headerTitle}>Asistencia</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.headerSubtitle}>
                        Control de disponibilidad del personal
                    </Text>

                    {/* Estadísticas compactas */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Ionicons name="people" size={20} color="#009BBF" />
                            <View style={styles.statInfo}>
                                <Text style={styles.statNumber}>{stats.totalEmpleados}</Text>
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                        </View>

                        <View style={styles.statCard}>
                            <Ionicons name="checkmark-circle" size={20} color="#49AA4C" />
                            <View style={styles.statInfo}>
                                <Text style={[styles.statNumber, { color: '#49AA4C' }]}>
                                    {stats.totalDisponibles}
                                </Text>
                                <Text style={styles.statLabel}>Disponibles</Text>
                            </View>
                        </View>

                        <View style={styles.statCard}>
                            <Ionicons name="close-circle" size={20} color="#D0155F" />
                            <View style={styles.statInfo}>
                                <Text style={[styles.statNumber, { color: '#D0155F' }]}>
                                    {stats.totalNoDisponibles}
                                </Text>
                                <Text style={styles.statLabel}>No disponibles</Text>
                            </View>
                        </View>
                    </View>

                    {/* Barra de progreso compacta */}
                    <View style={styles.porcentajeContainer}>
                        <View style={styles.porcentajeBar}>
                            <View 
                                style={[
                                    styles.porcentajeFill,
                                    { width: `${stats.porcentajeDisponibles}%` }
                                ]} 
                            />
                        </View>
                        <Text style={styles.porcentajeText}>
                            {stats.porcentajeDisponibles}% disponibles
                        </Text>
                    </View>
                </View>
            </View>

            {/* Filtros de disponibilidad */}
            {renderFiltrosDisponibilidad()}

            {/* Lista de sucursales */}
            <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
                {loading ? (
                    renderLoadingState()
                ) : sucursalesList.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#009BBF']}
                                tintColor="#009BBF"
                            />
                        }
                    >
                        {sucursalesList.map((sucursal, index) => (
                            <SucursalSection
                                key={sucursal.nombre || index}
                                sucursal={sucursal}
                                onToggleDisponibilidad={toggleDisponibilidad}
                            />
                        ))}
                        <View style={styles.bottomSpacer} />
                    </ScrollView>
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#009BBF',
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffffff',
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statInfo: {
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#000000ff',
        marginBottom: 1,
    },
    statLabel: {
        fontSize: 10,
        fontFamily: 'Lato-Regular',
        color: 'rgba(0, 0, 0, 0.8)',
    },
    porcentajeContainer: {
        marginTop: 4,
    },
    porcentajeBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
    },
    porcentajeFill: {
        height: '100%',
        backgroundColor: '#4ADE80',
        borderRadius: 3,
    },
    porcentajeText: {
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    filtrosContainer: {
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
    },
    filtrosSectionTitle: {
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        paddingHorizontal: 16,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    filtrosContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filtroChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5E5E5',
        gap: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    filtroChipSelected: {
        backgroundColor: '#009BBF',
        borderColor: '#009BBF',
    },
    filtroText: {
        fontSize: 13,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    filtroTextSelected: {
        color: '#FFFFFF',
    },
    listContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 8,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 15,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#999999',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomSpacer: {
        height: 20,
    },
});

export default Asistencia;