import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    ScrollView,
    SafeAreaView,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEmpleadoDetail } from '../../hooks/useEmpleado/useEmpleadoDetail';

/**
 * Componente EmpleadoDetailModal
 * 
 * Modal que muestra toda la información detallada de un empleado
 * con un diseño moderno y organizado siguiendo la estética de la app.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Object} empleado - Objeto con la información del empleado
 * @param {number} index - Índice del empleado en la lista
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onEdit - Función que se ejecuta al editar empleado
 */
const EmpleadoDetailModal = ({ visible, empleado, index, onClose, onEdit }) => {
    const {
        formatFullDate,
        formatTelefono,
        formatSalario,
        getEstadoText,
        getEstadoColor,
        getEstadoIcon,
        getCargoColor,
        getCargoIcon,
        getInitials,
        getFullName,
        getSucursalName,
        getFullAddress,
        getAntiguedad
    } = useEmpleadoDetail();

    if (!empleado) return null;

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

    /**
     * Renderizar foto de perfil
     */
    const renderProfilePhoto = () => (
        <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
                {empleado.fotoPerfil ? (
                    <Image 
                        source={{ uri: empleado.fotoPerfil }}
                        style={styles.avatar}
                        onError={() => console.log('Error cargando imagen empleado')}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {getInitials(empleado.nombre, empleado.apellido)}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.employeeName}>
                    {getFullName(empleado)}
                </Text>
                <View style={[
                    styles.cargoBadge,
                    { backgroundColor: getCargoColor(empleado.cargo) }
                ]}>
                    <Ionicons 
                        name={getCargoIcon(empleado.cargo)} 
                        size={16} 
                        color="#FFFFFF" 
                    />
                    <Text style={styles.cargoText}>
                        {empleado.cargo || 'Sin cargo'}
                    </Text>
                </View>
            </View>
        </View>
    );

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
                        <Text style={styles.headerTitle}>Detalle de Empleado</Text>
                        <Text style={styles.headerSubtitle}>Empleado #{index + 1}</Text>
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
                    {/* Foto de perfil y nombre */}
                    {renderProfilePhoto()}

                    {/* Estado del empleado */}
                    <View style={styles.statusSection}>
                        <View style={[
                            styles.statusContainer,
                            { backgroundColor: getEstadoColor(empleado.estado) }
                        ]}>
                            <Ionicons 
                                name={getEstadoIcon(empleado.estado)} 
                                size={24} 
                                color="#FFFFFF" 
                            />
                            <Text style={styles.statusTitle}>
                                {getEstadoText(empleado.estado)}
                            </Text>
                        </View>
                    </View>

                    {/* Información Personal */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'card', 
                                'Número de DUI', 
                                empleado.dui,
                                '#009BBF'
                            )}
                            {renderDetailField(
                                'call', 
                                'Teléfono', 
                                formatTelefono(empleado.telefono),
                                '#009BBF'
                            )}
                            {renderDetailField(
                                'mail', 
                                'Correo electrónico', 
                                empleado.correo,
                                '#009BBF'
                            )}
                        </View>
                    </View>

                    {/* Información de Residencia */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DE RESIDENCIA</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'location', 
                                'Dirección completa', 
                                getFullAddress(empleado),
                                '#49AA4C'
                            )}
                        </View>
                    </View>

                    {/* Información Laboral */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN LABORAL</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'business', 
                                'Sucursal', 
                                getSucursalName(empleado),
                                '#6B46C1'
                            )}
                            {renderDetailField(
                                'briefcase', 
                                'Cargo/Puesto', 
                                empleado.cargo,
                                '#6B46C1'
                            )}
                            {renderDetailField(
                                'cash', 
                                'Salario mensual', 
                                formatSalario(empleado.salario),
                                '#49AA4C'
                            )}
                            {renderDetailField(
                                'calendar', 
                                'Fecha de contratación', 
                                formatFullDate(empleado.fechaContratacion),
                                '#6B46C1'
                            )}
                            {renderDetailField(
                                'time', 
                                'Antigüedad', 
                                getAntiguedad(empleado.fechaContratacion),
                                '#D0155F'
                            )}
                        </View>
                    </View>

                    {/* Información del Sistema */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DEL SISTEMA</Text>
                        <View style={styles.systemInfo}>
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>ID de empleado:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {empleado._id ? empleado._id.slice(-8) : 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Cuenta verificada:</Text>
                                <View style={styles.verifiedContainer}>
                                    <Ionicons 
                                        name={empleado.isVerified ? 'checkmark-circle' : 'close-circle'} 
                                        size={16} 
                                        color={empleado.isVerified ? '#49AA4C' : '#D0155F'} 
                                    />
                                    <Text style={[
                                        styles.systemInfoValue,
                                        { color: empleado.isVerified ? '#49AA4C' : '#D0155F' }
                                    ]}>
                                        {empleado.isVerified ? 'Verificada' : 'No verificada'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Espaciador */}
                    <View style={styles.spacer} />
                </ScrollView>

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={() => onEdit(empleado)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create" size={20} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Editar</Text>
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

    // Sección de perfil
    profileSection: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
    },

    // Contenedor del avatar
    avatarContainer: {
        marginBottom: 16,
    },

    // Avatar
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
    },

    // Placeholder del avatar
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Texto del avatar
    avatarText: {
        fontSize: 32,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },

    // Información del perfil
    profileInfo: {
        alignItems: 'center',
    },

    // Nombre del empleado
    employeeName: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },

    // Badge del cargo
    cargoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },

    // Texto del cargo
    cargoText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    
    // Sección de estado
    statusSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
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

    // Divisor del sistema
    systemInfoDivider: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginVertical: 8,
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

    // Contenedor verificado
    verifiedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
    
    // Botón secundario
    secondaryButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#F8F9FA',
    },
    
    // Texto del botón secundario
    secondaryButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },

    // Botón primario
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#009BBF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    
    // Texto del botón primario
    primaryButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default EmpleadoDetailModal;