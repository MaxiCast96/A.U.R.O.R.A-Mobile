import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    ScrollView,
    SafeAreaView,
    Image,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOptometristaDetail } from '../../hooks/useOptometristas/useOptometristaDetail';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente OptometristaDetailModal - CORREGIDO para ObjectIds reales
 * 
 * Modal que muestra toda la información detallada de un optometrista
 * con un diseño moderno y organizado siguiendo la estética de la app.
 */
const OptometristaDetailModal = ({ visible, optometrista, index, onClose, onEdit }) => {
    const { getAuthHeaders } = useAuth();
    const [sucursales, setSucursales] = useState([]);
    const [loadingSucursales, setLoadingSucursales] = useState(false);
    
    const {
        formatFullDate,
        formatTelefono,
        getDisponibilidadText,
        getDisponibilidadColor,
        getDisponibilidadIcon,
        getEspecialidadColor,
        getEspecialidadIcon,
        getInitials,
        getFullName,
        formatExperiencia
    } = useOptometristaDetail();

    // Cargar información de sucursales cuando se abre el modal
    useEffect(() => {
        if (visible && optometrista?.sucursalesAsignadas?.length > 0) {
            fetchSucursales();
        }
    }, [visible, optometrista]);

    /**
     * Obtener información completa de las sucursales desde la API
     */
    const fetchSucursales = async () => {
        setLoadingSucursales(true);
        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/sucursales', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setSucursales(data.sucursales || data || []);
            } else {
                console.error('Error al cargar sucursales:', response.status);
                setSucursales([]);
            }
        } catch (error) {
            console.error('Error fetching sucursales:', error);
            setSucursales([]);
        } finally {
            setLoadingSucursales(false);
        }
    };

    /**
     * Obtener nombre de sucursal por ObjectId
     */
    const getSucursalNombre = (sucursalId) => {
        if (!sucursalId) return 'Sucursal desconocida';
        
        // Convertir ObjectId a string si es necesario
        const id = typeof sucursalId === 'object' ? sucursalId.toString() : sucursalId;
        
        // Buscar en las sucursales cargadas
        const sucursal = sucursales.find(s => 
            s._id === id || s._id.toString() === id
        );
        
        return sucursal ? sucursal.nombre : `Sucursal (${id.slice(-8)})`;
    };

    if (!optometrista) return null;

    const empleado = optometrista.empleadoId || {};

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
                        onError={() => console.log('Error cargando imagen optometrista')}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {getInitials(empleado.nombre, empleado.apellido)}
                        </Text>
                    </View>
                )}
                {/* Badge de doctor */}
                <View style={styles.drBadge}>
                    <Text style={styles.drText}>Dr.</Text>
                </View>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.optometristaNombre}>
                    Dr. {getFullName(empleado)}
                </Text>
                <View style={[
                    styles.especialidadBadge,
                    { backgroundColor: getEspecialidadColor(optometrista.especialidad) }
                ]}>
                    <Ionicons 
                        name={getEspecialidadIcon(optometrista.especialidad)} 
                        size={16} 
                        color="#FFFFFF" 
                    />
                    <Text style={styles.especialidadText}>
                        {optometrista.especialidad || 'Sin especialidad'}
                    </Text>
                </View>
            </View>
        </View>
    );

    /**
     * Renderizar sección de horarios
     */
    const renderHorariosSection = () => {
        const horarios = optometrista.disponibilidad || [];
        
        if (horarios.length === 0) {
            return (
                <View style={styles.noHorariosContainer}>
                    <Ionicons name="time-outline" size={48} color="#CCCCCC" />
                    <Text style={styles.noHorariosText}>Sin horarios configurados</Text>
                </View>
            );
        }

        // Agrupar horarios por día
        const horariosPorDia = {};
        horarios.forEach(horario => {
            const dia = horario.dia;
            if (!horariosPorDia[dia]) {
                horariosPorDia[dia] = [];
            }
            horariosPorDia[dia].push(horario.hora || horario.horaInicio);
        });

        // Ordenar días de la semana
        const diasOrdenados = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        const diasConHorarios = diasOrdenados.filter(dia => horariosPorDia[dia]);

        if (diasConHorarios.length === 0) {
            return (
                <View style={styles.noHorariosContainer}>
                    <Ionicons name="time-outline" size={48} color="#CCCCCC" />
                    <Text style={styles.noHorariosText}>Sin horarios configurados</Text>
                </View>
            );
        }

        return (
            <View style={styles.horariosContainer}>
                {diasConHorarios.map((dia, index) => {
                    const horas = horariosPorDia[dia].sort();
                    const nombreDia = dia.charAt(0).toUpperCase() + dia.slice(1);
                    
                    return (
                        <View key={index} style={styles.horarioItem}>
                            <Text style={styles.horarioDia}>{nombreDia}</Text>
                            <View style={styles.horarioHoras}>
                                {horas.map((hora, horaIndex) => (
                                    <View key={horaIndex} style={styles.horaTag}>
                                        <Text style={styles.horaText}>{hora}</Text>
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.totalHorasDia}>
                                {horas.length} {horas.length === 1 ? 'hora' : 'horas'}
                            </Text>
                        </View>
                    );
                })}
                
                {/* Resumen total */}
                <View style={styles.resumenHorarios}>
                    <View style={styles.resumenItem}>
                        <Ionicons name="calendar-outline" size={16} color="#009BBF" />
                        <Text style={styles.resumenText}>
                            {diasConHorarios.length} {diasConHorarios.length === 1 ? 'día' : 'días'} laborales
                        </Text>
                    </View>
                    <View style={styles.resumenItem}>
                        <Ionicons name="time-outline" size={16} color="#009BBF" />
                        <Text style={styles.resumenText}>
                            {horarios.length} {horarios.length === 1 ? 'hora' : 'horas'} semanales
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    /**
     * Renderizar sucursales asignadas - CORREGIDA con datos reales de la API
     */
    const renderSucursalesAsignadas = () => {
        const sucursalesAsignadas = optometrista.sucursalesAsignadas || [];
        
        if (sucursalesAsignadas.length === 0) {
            return (
                <Text style={styles.fieldValue}>Sin sucursales asignadas</Text>
            );
        }

        if (loadingSucursales) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#009BBF" />
                    <Text style={styles.loadingText}>Cargando sucursales...</Text>
                </View>
            );
        }

        return (
            <View style={styles.sucursalesContainer}>
                {sucursalesAsignadas.map((sucursalId, index) => {
                    const nombreSucursal = getSucursalNombre(sucursalId);
                    
                    return (
                        <View key={index} style={styles.sucursalTag}>
                            <Ionicons name="business" size={14} color="#F59E0B" />
                            <Text style={styles.sucursalTagText}>{nombreSucursal}</Text>
                        </View>
                    );
                })}
                
                {/* Resumen */}
                <Text style={styles.sucursalesResumen}>
                    Total: {sucursalesAsignadas.length} {sucursalesAsignadas.length === 1 ? 'sucursal' : 'sucursales'}
                </Text>
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
                        <Text style={styles.headerTitle}>Detalle de Optometrista</Text>
                        <Text style={styles.headerSubtitle}>Optometrista #{index + 1}</Text>
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

                    {/* Estado de disponibilidad */}
                    <View style={styles.statusSection}>
                        <View style={[
                            styles.statusContainer,
                            { backgroundColor: getDisponibilidadColor(optometrista.disponible) }
                        ]}>
                            <Ionicons 
                                name={getDisponibilidadIcon(optometrista.disponible)} 
                                size={24} 
                                color="#FFFFFF" 
                            />
                            <Text style={styles.statusTitle}>
                                {getDisponibilidadText(optometrista.disponible)}
                            </Text>
                        </View>
                    </View>

                    {/* Información Personal del Empleado */}
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

                    {/* Información Profesional */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN PROFESIONAL</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'medical', 
                                'Especialidad', 
                                optometrista.especialidad,
                                '#8B5CF6'
                            )}
                            {renderDetailField(
                                'document-text', 
                                'Número de Licencia', 
                                optometrista.licencia,
                                '#8B5CF6'
                            )}
                            {renderDetailField(
                                'school', 
                                'Años de Experiencia', 
                                formatExperiencia(optometrista.experiencia),
                                '#10B981'
                            )}
                        </View>
                    </View>

                    {/* Asignación de Sucursales */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>SUCURSALES ASIGNADAS</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.detailField}>
                                <View style={styles.fieldHeader}>
                                    <View style={[styles.fieldIcon, { backgroundColor: '#F59E0B15' }]}>
                                        <Ionicons name="business" size={20} color="#F59E0B" />
                                    </View>
                                    <Text style={styles.fieldLabel}>Sucursales de trabajo</Text>
                                </View>
                                {renderSucursalesAsignadas()}
                            </View>
                        </View>
                    </View>

                    {/* Horarios de Disponibilidad */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>HORARIOS DE DISPONIBILIDAD</Text>
                        <View style={styles.sectionContent}>
                            {renderHorariosSection()}
                        </View>
                    </View>

                    {/* Información del Sistema */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DEL SISTEMA</Text>
                        <View style={styles.systemInfo}>
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>ID de optometrista:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {optometrista._id ? optometrista._id.slice(-8) : 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Fecha de registro:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {formatFullDate(optometrista.createdAt)}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Última actualización:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {formatFullDate(optometrista.updatedAt)}
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
                        style={styles.secondaryButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={() => onEdit(optometrista)}
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
    // Estilos del contenedor principal
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
    
    headerLeft: {
        flex: 1,
    },
    
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 2,
    },
    
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

    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },

    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
    },

    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        fontSize: 32,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },

    drBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },

    drText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },

    profileInfo: {
        alignItems: 'center',
    },

    optometristaNombre: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },

    especialidadBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },

    especialidadText: {
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
    
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
    },
    
    statusTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    
    // Secciones
    section: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginBottom: 12,
        letterSpacing: 1,
    },
    
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
    
    detailField: {
        gap: 8,
    },
    
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    
    fieldIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        flex: 1,
    },
    
    fieldValue: {
        fontSize: 15,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        lineHeight: 22,
        marginLeft: 48,
    },

    // Contenedor de sucursales
    sucursalesContainer: {
        marginLeft: 48,
        gap: 8,
    },

    sucursalTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F59E0B15',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },

    sucursalTagText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#F59E0B',
    },

    sucursalesResumen: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginTop: 8,
        textAlign: 'center',
    },

    // Loading de sucursales
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 48,
        paddingVertical: 8,
    },

    loadingText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },

    // Contenedor de horarios
    horariosContainer: {
        gap: 12,
    },

    horarioItem: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#009BBF',
    },

    horarioDia: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },

    horarioHoras: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },

    horaTag: {
        backgroundColor: '#009BBF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },

    horaText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },

    totalHorasDia: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'right',
    },

    resumenHorarios: {
        backgroundColor: '#E8F8FB',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    resumenItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    resumenText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
    },

    // Sin horarios
    noHorariosContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 12,
    },

    noHorariosText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'center',
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
    
    systemInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },

    systemInfoDivider: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginVertical: 8,
    },
    
    systemInfoLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    
    systemInfoValue: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    
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
    
    secondaryButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },

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
    
    primaryButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default OptometristaDetailModal;