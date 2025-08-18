import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente StatsOverview
 * 
 * Muestra un resumen visual detallado de las estadísticas de citas
 * con los 5 estados principales y sus respectivos colores.
 * Permite filtrar por estado específico al hacer tap.
 * 
 * Props:
 * @param {Object} stats - Objeto con las estadísticas de citas
 * @param {Function} onStateFilter - Función para filtrar por estado específico
 * @param {string} selectedState - Estado actualmente seleccionado (opcional)
 */
const StatsOverview = ({ stats, onStateFilter, selectedState }) => {
    /**
     * Configuración de los estados con sus colores e iconos
     */
    const estadosConfig = [
        {
            key: 'agendada',
            label: 'Agendadas',
            count: stats.agendadas || 0,
            color: '#A4D5DD',
            icon: 'bookmark',
            description: 'Citas programadas'
        },
        {
            key: 'pendiente',
            label: 'Pendientes',
            count: stats.pendientes || 0,
            color: '#E74C3C',
            icon: 'hourglass',
            description: 'Esperando confirmación'
        },
        {
            key: 'confirmada',
            label: 'Confirmadas',
            count: stats.confirmadas || 0,
            color: '#F39C12',
            icon: 'checkmark',
            description: 'Confirmadas por paciente'
        },
        {
            key: 'completada',
            label: 'Completadas',
            count: stats.completadas || 0,
            color: '#49AA4C',
            icon: 'checkmark-circle',
            description: 'Citas finalizadas'
        },
        {
            key: 'cancelada',
            label: 'Canceladas',
            count: stats.canceladas || 0,
            color: '#8E44AD',
            icon: 'close-circle',
            description: 'Citas canceladas'
        }
    ];

    /**
     * Calcular el porcentaje de cada estado
     */
    const calculatePercentage = (count) => {
        if (stats.total === 0) return 0;
        return Math.round((count / stats.total) * 100);
    };

    /**
     * Renderizar tarjeta de estado individual
     */
    const renderStatCard = (estado) => {
        const percentage = calculatePercentage(estado.count);
        const isSelected = selectedState === estado.key;

        return (
            <TouchableOpacity
                key={estado.key}
                style={[
                    styles.statCard,
                    isSelected && styles.statCardSelected,
                    { borderLeftColor: estado.color }
                ]}
                onPress={() => onStateFilter && onStateFilter(estado.key)}
                activeOpacity={0.7}
            >
                <View style={styles.statCardHeader}>
                    <View style={[styles.statIcon, { backgroundColor: `${estado.color}20` }]}>
                        <Ionicons name={estado.icon} size={20} color={estado.color} />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statCount}>{estado.count}</Text>
                        <Text style={styles.statPercentage}>{percentage}%</Text>
                    </View>
                </View>
                <Text style={styles.statLabel}>{estado.label}</Text>
                <Text style={styles.statDescription}>{estado.description}</Text>
                
                {/* Barra de progreso */}
                <View style={styles.progressBar}>
                    <View 
                        style={[
                            styles.progressFill,
                            { 
                                width: `${percentage}%`,
                                backgroundColor: estado.color 
                            }
                        ]} 
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header de estadísticas */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Resumen de Estados</Text>
                <Text style={styles.headerSubtitle}>
                    {stats.total} cita{stats.total !== 1 ? 's' : ''} en total
                </Text>
            </View>

            {/* Grid de estadísticas */}
            <View style={styles.statsGrid}>
                {estadosConfig.map(renderStatCard)}
            </View>

            {/* Nota informativa */}
            {selectedState && (
                <View style={styles.filterNote}>
                    <Ionicons name="filter" size={16} color="#009BBF" />
                    <Text style={styles.filterNoteText}>
                        Filtrando por: {estadosConfig.find(e => e.key === selectedState)?.label}
                    </Text>
                    <TouchableOpacity onPress={() => onStateFilter && onStateFilter(null)}>
                        <Text style={styles.clearFilterText}>Limpiar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    
    // Header del componente
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    
    // Título del header
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    
    // Subtítulo del header
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    
    // Grid de estadísticas
    statsGrid: {
        gap: 12,
    },
    
    // Tarjeta de estadística individual
    statCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#E5E5E5',
    },
    
    // Tarjeta seleccionada
    statCardSelected: {
        backgroundColor: '#F0F9FF',
        borderColor: '#009BBF',
        borderWidth: 1,
    },
    
    // Header de la tarjeta
    statCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    
    // Ícono del estado
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    
    // Información numérica
    statInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    
    // Contador del estado
    statCount: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    
    // Porcentaje del estado
    statPercentage: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    
    // Etiqueta del estado
    statLabel: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    
    // Descripción del estado
    statDescription: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginBottom: 12,
    },
    
    // Barra de progreso
    progressBar: {
        height: 4,
        backgroundColor: '#E5E5E5',
        borderRadius: 2,
        overflow: 'hidden',
    },
    
    // Relleno de la barra de progreso
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    
    // Nota de filtro activo
    filterNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        gap: 8,
    },
    
    // Texto de la nota de filtro
    filterNoteText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#009BBF',
    },
    
    // Texto para limpiar filtro
    clearFilterText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
        textDecorationLine: 'underline',
    },
});

export default StatsOverview;