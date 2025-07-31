import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Pantalla de Citas
 * 
 * Esta pantalla muestra las citas programadas en la óptica
 * con datos reales obtenidos desde el backend.
 * 
 * Funcionalidades:
 * - Lista de citas reales
 * - Pull to refresh
 * - Información detallada de cada cita
 * - Estados de carga y error
 */
const Citas = () => {
    const { getAuthHeaders } = useAuth();
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    /**
     * Cargar citas desde el backend
     */
    const loadCitas = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/citas', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setCitas(data);
            } else {
                Alert.alert('Error', 'No se pudieron cargar las citas');
            }
        } catch (error) {
            console.error('Error al cargar citas:', error);
            Alert.alert('Error', 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función para refrescar la lista
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadCitas();
        setRefreshing(false);
    };

    /**
     * Cargar citas al montar el componente
     */
    useEffect(() => {
        loadCitas();
    }, []);

    /**
     * Formatear fecha para mostrar
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Formatear hora para mostrar
     */
    const formatTime = (timeString) => {
        if (!timeString) return 'Hora no disponible';
        return timeString; // Ya viene en formato "HH:MM"
    };

    /**
     * Obtener el estado en español
     */
    const getEstadoText = (estado) => {
        switch (estado) {
            case 'completada':
                return 'Completada';
            case 'pendiente':
                return 'Pendiente';
            case 'cancelada':
                return 'Cancelada';
            default:
                return 'Sin estado';
        }
    };

    /**
     * Obtener el color del estado
     */
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'completada':
                return '#4CAF50';
            case 'pendiente':
                return '#FF9800';
            case 'cancelada':
                return '#F44336';
            default:
                return '#9E9E9E';
        }
    };

    /**
     * Renderizar cada item de cita
     */
    const renderCitaItem = ({ item, index }) => (
        <View style={styles.citaItem}>
            <View style={styles.citaHeader}>
                <Text style={styles.citaTitle}>
                    Cita #{index + 1}
                </Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getEstadoColor(item.estado) }
                ]}>
                    <Text style={styles.statusText}>
                        {getEstadoText(item.estado)}
                    </Text>
                </View>
            </View>
            
            <View style={styles.citaDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.fecha)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Hora:</Text>
                    <Text style={styles.detailValue}>{formatTime(item.hora)}</Text>
                </View>
                
                {item.motivoCita && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Motivo:</Text>
                        <Text style={styles.detailValue}>{item.motivoCita}</Text>
                    </View>
                )}
                
                {item.tipoLente && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tipo de Lente:</Text>
                        <Text style={styles.detailValue}>{item.tipoLente}</Text>
                    </View>
                )}
                
                {item.graduacion && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Graduación:</Text>
                        <Text style={styles.detailValue}>{item.graduacion}</Text>
                    </View>
                )}
                
                {item.notasAdicionales && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Notas:</Text>
                        <Text style={styles.detailValue}>{item.notasAdicionales}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    /**
     * Renderizar mensaje cuando no hay citas
     */
    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No hay citas programadas</Text>
            <Text style={styles.emptySubtitle}>
                Las citas aparecerán aquí cuando sean programadas
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Citas Programadas</Text>
                <Text style={styles.subtitle}>
                    {citas.length} cita{citas.length !== 1 ? 's' : ''} programada{citas.length !== 1 ? 's' : ''}
                </Text>
            </View>
            
            <FlatList
                data={citas}
                keyExtractor={(item, index) => (item._id ? item._id.toString() : `cita-${index}`)}
                renderItem={renderCitaItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#009BBF']}
                        tintColor="#009BBF"
                    />
                }
                ListEmptyComponent={renderEmptyList}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // Header de la pantalla
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#009BBF',
    },
    
    // Título principal
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    
    // Subtítulo
    subtitle: {
        fontSize: 14,
        color: '#E0F7FF',
    },
    
    // Contenedor de la lista
    listContainer: {
        padding: 16,
        flexGrow: 1,
    },
    
    // Item de cita
    citaItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    
    // Header del item de cita
    citaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    
    // Título de la cita
    citaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
    },
    
    // Badge de estado
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    
    // Texto del estado
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    
    // Detalles de la cita
    citaDetails: {
        gap: 8,
    },
    
    // Fila de detalle
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    
    // Etiqueta del detalle
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        width: 100,
    },
    
    // Valor del detalle
    detailValue: {
        fontSize: 14,
        color: '#1A1A1A',
        flex: 1,
    },
    
    // Contenedor vacío
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    
    // Título del estado vacío
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666666',
        marginBottom: 8,
        textAlign: 'center',
    },
    
    // Subtítulo del estado vacío
    emptySubtitle: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default Citas;