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
 * Componente ClienteDetailModal
 * 
 * Modal que muestra toda la información detallada de un cliente
 * con un diseño moderno y organizado siguiendo la estética de la app.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Object} cliente - Objeto con la información del cliente
 * @param {number} index - Índice del cliente en la lista
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onEdit - Función para editar el cliente
 * @param {Function} onDelete - Función para eliminar el cliente
 */
const ClienteDetailModal = ({ visible, cliente, index, onClose, onEdit, onDelete }) => {
    if (!cliente) return null;

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
     * Formatear dirección del cliente
     */
    const formatDireccion = (direccion) => {
        if (!direccion) return 'Dirección no registrada';
        
        if (typeof direccion === 'string') {
            return direccion;
        }
        
        if (typeof direccion === 'object') {
            const { calle, ciudad, departamento } = direccion;
            const partes = [];
            
            if (calle) partes.push(calle);
            if (ciudad) partes.push(ciudad);
            if (departamento) partes.push(departamento);
            
            return partes.length > 0 ? partes.join(', ') : 'Dirección no registrada';
        }
        
        return 'Dirección no registrada';
    };

    /**
     * Obtener el estado en español
     */
    const getEstadoText = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activo':
                return 'Activo';
            case 'inactivo':
                return 'Inactivo';
            default:
                return 'Sin estado';
        }
    };

    /**
     * Obtener el color del estado
     */
    const getEstadoColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activo':
                return '#49AA4C';
            case 'inactivo':
                return '#D0155F';
            default:
                return '#666666';
        }
    };

    /**
     * Obtener el ícono del estado
     */
    const getEstadoIcon = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activo':
                return 'checkmark-circle';
            case 'inactivo':
                return 'close-circle';
            default:
                return 'help-circle';
        }
    };

    /**
     * Generar iniciales del nombre del cliente
     */
    const getInitials = (nombre) => {
        if (!nombre) return 'N/A';
        const words = nombre.trim().split(' ');
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
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

    const initials = getInitials(cliente.nombre);

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
                        <Text style={styles.headerTitle}>Detalle de Cliente</Text>
                        <Text style={styles.headerSubtitle}>Cliente #{index + 1}</Text>
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
                    {/* Avatar y estado del cliente */}
                    <View style={styles.clienteHeader}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                            <Text style={styles.clienteNombre}>
                                {cliente.nombre} {cliente.apellido}
                            </Text>
                            <View style={[
                                styles.estadoBadge,
                                { backgroundColor: getEstadoColor(cliente.estado) }
                            ]}>
                                <Ionicons 
                                    name={getEstadoIcon(cliente.estado)} 
                                    size={16} 
                                    color="#FFFFFF" 
                                />
                                <Text style={styles.estadoText}>
                                    {getEstadoText(cliente.estado)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Información personal */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'person', 
                                'Nombre completo', 
                                `${cliente.nombre} ${cliente.apellido}`,
                                '#009BBF'
                            )}
                            {renderDetailField(
                                'calendar', 
                                'Edad', 
                                `${cliente.edad} años`,
                                '#009BBF'
                            )}
                            {renderDetailField(
                                'card', 
                                'Número de DUI', 
                                cliente.dui,
                                '#009BBF'
                            )}
                        </View>
                    </View>

                    {/* Información de contacto */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DE CONTACTO</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'call', 
                                'Teléfono', 
                                cliente.telefono,
                                '#49AA4C'
                            )}
                            {renderDetailField(
                                'mail', 
                                'Correo electrónico', 
                                cliente.email,
                                '#49AA4C'
                            )}
                        </View>
                    </View>

                    {/* Información de residencia */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DE RESIDENCIA</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'location', 
                                'Dirección completa', 
                                formatDireccion(cliente.direccion),
                                '#D0155F'
                            )}
                        </View>
                    </View>

                    {/* Información del sistema */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DEL SISTEMA</Text>
                        <View style={styles.systemInfo}>
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>ID de cliente:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {cliente._id ? cliente._id.slice(-8) : 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Fecha de registro:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {formatFullDate(cliente.createdAt || cliente.fechaRegistro)}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Última actualización:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {formatFullDate(cliente.updatedAt)}
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
                        style={styles.editButton}
                        onPress={() => onEdit(cliente)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create" size={20} color="#49AA4C" />
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => onDelete(cliente)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash" size={20} color="#D0155F" />
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.closeButtonAction}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.closeButtonActionText}>Cerrar</Text>
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
    
    // Header del cliente
    clienteHeader: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    // Contenedor del avatar
    avatarContainer: {
        alignItems: 'center',
    },
    
    // Avatar
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    
    // Texto del avatar
    avatarText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontFamily: 'Lato-Bold',
    },
    
    // Nombre del cliente
    clienteNombre: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },
    
    // Badge del estado
    estadoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    
    // Texto del estado
    estadoText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    
    // Sección
    section: {
        marginHorizontal: 20,
        marginTop: 20,
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
        paddingVertical: 8,
    },
    
    // Divisor de información del sistema
    systemInfoDivider: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginVertical: 4,
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
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    
    // Espaciador
    spacer: {
        height: 40,
    },
    
    // Botones de acción
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        gap: 12,
    },
    
    // Botón de editar
    editButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#49AA4C15',
        borderWidth: 1,
        borderColor: '#49AA4C30',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    
    // Texto del botón de editar
    editButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#49AA4C',
    },
    
    // Botón de eliminar
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#D0155F15',
        borderWidth: 1,
        borderColor: '#D0155F30',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    
    // Texto del botón de eliminar
    deleteButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#D0155F',
    },
    
    // Botón de cerrar en acciones
    closeButtonAction: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Texto del botón de cerrar en acciones
    closeButtonActionText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default ClienteDetailModal;