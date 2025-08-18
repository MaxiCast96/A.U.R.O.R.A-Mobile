import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    ScrollView,
    SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente CitaDetailModal
 * 
 * Modal que muestra toda la información detallada de una cita
 * con un diseño moderno y organizado siguiendo la estética de la app.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Object} cita - Objeto con la información de la cita
 * @param {number} index - Índice de la cita en la lista
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 */
const CitaDetailModal = ({ visible, cita, index, onClose }) => {
    if (!cita) return null;

    /**
     * Formatear fecha para mostrar completa
     */
    const formatFullDate = (dateString) => {
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
                return 'bookmark';
            case 'pendiente':
                return 'hourglass';
            case 'confirmada':
                return 'checkmark';
            case 'cancelada':
                return 'close-circle';
            case 'completado':
            case 'completada':
                return 'checkmark-circle';
            default:
                return 'help-circle';
        }
    };

    /**
     * Renderizar campo de detalle
     */
    const renderDetailField = (icon, label, value, color = '#009BBF') => {
        if (!value) return null;
        
        return (
            <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                    <View style={[styles.fieldIcon, { backgroundColor: `${color}15` }]}>
                        <Ionicons name={icon} size={20} color={color} />
                    </View>
                    <Text style={styles.fieldLabel}>{label}</Text>
                </View>
                <Text style={styles.fieldValue}>{value}</Text>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header del modal */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Detalle de Cita</Text>
                        <Text style={styles.headerSubtitle}>Cita #{index + 1}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={24} color="#666666" />
                    </TouchableOpacity>
                </View>

                {/* Contenido del modal */}
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Estado de la cita */}
                    <View style={styles.statusSection}>
                        <View style={[
                            styles.statusContainer,
                            { backgroundColor: getEstadoColor(cita.estado) }
                        ]}>
                            <Ionicons 
                                name={getEstadoIcon(cita.estado)} 
                                size={24} 
                                color="#FFFFFF" 
                            />
                            <Text style={styles.statusTitle}>
                                {getEstadoText(cita.estado)}
                            </Text>
                        </View>
                    </View>

                    {/* Información básica */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN BÁSICA</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'calendar', 
                                'Fecha de la cita', 
                                formatFullDate(cita.fecha),
                                '#009BBF'
                            )}
                            {renderDetailField(
                                'time', 
                                'Hora programada', 
                                formatTime(cita.hora),
                                '#009BBF'
                            )}
                        </View>
                    </View>

                    {/* Información médica */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN MÉDICA</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'medical', 
                                'Motivo de la cita', 
                                cita.motivoCita,
                                '#D0155F'
                            )}
                            {renderDetailField(
                                'glasses', 
                                'Tipo de lente', 
                                cita.tipoLente,
                                '#49AA4C'
                            )}
                            {renderDetailField(
                                'eye', 
                                'Graduación', 
                                cita.graduacion,
                                '#D0155F'
                            )}
                        </View>
                    </View>

                    {/* Notas adicionales */}
                    {cita.notasAdicionales && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>NOTAS ADICIONALES</Text>
                            <View style={styles.notesContainer}>
                                <View style={[styles.fieldIcon, { backgroundColor: '#3C3C3B15' }]}>
                                    <Ionicons name="document-text" size={20} color="#3C3C3B" />
                                </View>
                                <Text style={styles.notesText}>{cita.notasAdicionales}</Text>
                            </View>
                        </View>
                    )}

                    {/* Información del sistema */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DEL SISTEMA</Text>
                        <View style={styles.systemInfo}>
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>ID de cita:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {cita._id ? cita._id.slice(-8) : 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Espaciador */}
                    <View style={styles.spacer} />
                </ScrollView>

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    
    // Header del modal
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    
    // Lado izquierdo del header
    headerLeft: {
        flex: 1,
    },
    
    // Título del header
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    
    // Subtítulo del header
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 2,
    },
    
    // Botón de cerrar
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Contenido del modal
    content: {
        flex: 1,
    },
    
    // Contenido del scroll
    scrollContent: {
        paddingBottom: 20,
    },
    
    // Sección de estado
    statusSection: {
        padding: 20,
        alignItems: 'center',
    },
    
    // Contenedor del estado
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
    },
    
    // Título del estado
    statusTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    
    // Sección
    section: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    
    // Título de sección
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginBottom: 12,
        letterSpacing: 1,
    },
    
    // Contenido de sección
    sectionContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    // Campo de detalle
    detailField: {
        gap: 8,
    },
    
    // Header del campo
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    
    // Ícono del campo
    fieldIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Etiqueta del campo
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        flex: 1,
    },
    
    // Valor del campo
    fieldValue: {
        fontSize: 15,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        lineHeight: 22,
        marginLeft: 48,
    },
    
    // Contenedor de notas
    notesContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    // Texto de notas
    notesText: {
        fontSize: 15,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        lineHeight: 22,
        flex: 1,
    },
    
    // Información del sistema
    systemInfo: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    // Fila de información del sistema
    systemInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    
    // Etiqueta de información del sistema
    systemInfoLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    
    // Valor de información del sistema
    systemInfoValue: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    
    // Espaciador
    spacer: {
        height: 40,
    },
    
    // Botones de acción
    actionButtons: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    
    // Botón primario
    primaryButton: {
        backgroundColor: '#009BBF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Texto del botón primario
    primaryButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default CitaDetailModal;