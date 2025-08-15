import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente CitaCard
 * 
 * Muestra una vista resumida de la información de una cita
 * con un diseño moderno y limpio siguiendo la estética de la app.
 * 
 * Props:
 * @param {Object} cita - Objeto con la información de la cita
 * @param {number} index - Índice de la cita en la lista
 * @param {Function} onPress - Función que se ejecuta al presionar "Ver más"
 */
const CitaCard = ({ cita, index, onPress }) => {
    /**
     * Formatear fecha para mostrar en formato corto
     */
    const formatShortDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    /**
     * Formatear hora para mostrar
     */
    const formatTime = (timeString) => {
        if (!timeString) return 'Sin hora';
        return timeString;
    };

    /**
     * Obtener el estado en español - 5 estados completos
     */
    const getEstadoText = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'agendada':
                return 'Agendada';
            case 'pendiente':
                return 'Pendiente';
            case 'confirmada':
                return 'Confirmada';
            case 'cancelada':
                return 'Cancelada';
            case 'completado':
            case 'completada':
                return 'Completada';
            default:
                return 'Sin estado';
        }
    };

    /**
     * Obtener el color del estado según la paleta de colores personalizada
     * Respetando la tonalidad y estética de la paleta principal
     */
    const getEstadoColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'agendada':
                return '#009BBF'; // Celeste 
            case 'pendiente':
                return '#E74C3C'; // Rojo
            case 'confirmada':
                return '#F39C12'; // Amarillo 
            case 'cancelada':
                return '#8E44AD'; // Morado 
            case 'completado':
            case 'completada':
                return '#49AA4C'; // Verde 
            default:
                return '#3C3C3B'; // Gris oscuro
        }
    };

    /**
     * Obtener el ícono del estado apropiado
     */
    const getEstadoIcon = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'agendada':
                return 'bookmark-outline';
            case 'pendiente':
                return 'hourglass-outline';
            case 'confirmada':
                return 'checkmark-outline';
            case 'cancelada':
                return 'close-circle-outline';
            case 'completado':
            case 'completada':
                return 'checkmark-circle-outline';
            default:
                return 'help-circle-outline';
        }
    };

    return (
        <View style={styles.card}>
            {/* Header de la tarjeta */}
            <View style={styles.cardHeader}>
                <View style={styles.citaInfo}>
                    <Text style={styles.citaNumber}>Cita #{index + 1}</Text>
                    <View style={styles.dateTimeContainer}>
                        <View style={styles.dateTime}>
                            <Ionicons name="calendar-outline" size={14} color="#666666" />
                            <Text style={styles.dateText}>{formatShortDate(cita.fecha)}</Text>
                        </View>
                        <View style={styles.dateTime}>
                            <Ionicons name="time-outline" size={14} color="#666666" />
                            <Text style={styles.timeText}>{formatTime(cita.hora)}</Text>
                        </View>
                    </View>
                </View>
                
                {/* Badge de estado */}
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getEstadoColor(cita.estado) }
                ]}>
                    <Ionicons 
                        name={getEstadoIcon(cita.estado)} 
                        size={12} 
                        color="#FFFFFF" 
                        style={styles.statusIcon}
                    />
                    <Text style={styles.statusText}>
                        {getEstadoText(cita.estado)}
                    </Text>
                </View>
            </View>

            {/* Información principal */}
            <View style={styles.mainInfo}>
                {cita.motivoCita && (
                    <View style={styles.infoRow}>
                        <Ionicons name="medical-outline" size={16} color="#009BBF" />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {cita.motivoCita}
                        </Text>
                    </View>
                )}
                
                {cita.tipoLente && (
                    <View style={styles.infoRow}>
                        <Ionicons name="glasses-outline" size={16} color="#49AA4C" />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {cita.tipoLente}
                        </Text>
                    </View>
                )}
            </View>

            {/* Botón Ver más */}
            <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => onPress(cita, index)}
                activeOpacity={0.7}
            >
                <Text style={styles.viewMoreText}>Ver más</Text>
                <Ionicons name="chevron-forward" size={16} color="#009BBF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal de la tarjeta
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    
    // Header de la tarjeta
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    
    // Información de la cita
    citaInfo: {
        flex: 1,
    },
    
    // Número de cita
    citaNumber: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    
    // Contenedor de fecha y hora
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    
    // Elemento de fecha/hora
    dateTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    
    // Texto de fecha
    dateText: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    
    // Texto de hora
    timeText: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    
    // Badge de estado
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    
    // Ícono del estado
    statusIcon: {
        marginRight: 2,
    },
    
    // Texto del estado
    statusText: {
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    
    // Información principal
    mainInfo: {
        marginBottom: 12,
        gap: 8,
    },
    
    // Fila de información
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    
    // Texto de información
    infoText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        flex: 1,
    },
    
    // Botón Ver más
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 6,
    },
    
    // Texto del botón Ver más
    viewMoreText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
    },
});

export default CitaCard;