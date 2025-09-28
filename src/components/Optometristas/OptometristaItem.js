import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OptometristaItem = ({ 
    optometrista, 
    onViewMore, 
    onEdit, 
    onDelete, 
    onToggleDisponibilidad 
}) => {
    /**
     * Obtener el color de la disponibilidad
     */
    const getDisponibilidadColor = (disponible) => {
        return disponible === true ? '#49AA4C' : '#D0155F';
    };

    /**
     * Obtener el color de la especialidad
     */
    const getEspecialidadColor = (especialidad) => {
        switch (especialidad?.toLowerCase()) {
            case 'general':
                return '#009BBF';
            case 'pediatrica':
                return '#F59E0B';
            case 'optometria avanzada':
                return '#8B5CF6';
            case 'terapia visual':
                return '#10B981';
            case 'lentes de contacto':
                return '#EF4444';
            case 'baja vision':
                return '#6B7280';
            case 'contactologia':
                return '#EC4899';
            case 'geriatrica':
                return '#059669';
            default:
                return '#009BBF';
        }
    };

    /**
     * Formatear años de experiencia
     */
    const formatExperiencia = (experiencia) => {
        if (!experiencia) return '0 años';
        const años = parseInt(experiencia);
        return años === 1 ? '1 año' : `${años} años`;
    };

    /**
     * Obtener iniciales del optometrista
     */
    const getInitials = (empleado) => {
        if (!empleado) return 'OP';
        const initial1 = empleado.nombre?.charAt(0)?.toUpperCase() || '';
        const initial2 = empleado.apellido?.charAt(0)?.toUpperCase() || '';
        return initial1 + initial2 || 'OP';
    };

    /**
     * Obtener nombre completo
     */
    const getFullName = (empleado) => {
        if (!empleado) return 'Optometrista';
        return `${empleado.nombre || ''} ${empleado.apellido || ''}`.trim() || 'Optometrista';
    };

    /**
     * Obtener texto de disponibilidad
     */
    const getDisponibilidadText = (disponible) => {
        return disponible === true ? 'Disponible' : 'No Disponible';
    };

    /**
     * Obtener ícono de disponibilidad
     */
    const getDisponibilidadIcon = (disponible) => {
        return disponible === true ? 'checkmark-circle' : 'close-circle';
    };

    /**
     * Calcular total de horas de disponibilidad
     */
    const getTotalHorasDisponibilidad = (disponibilidad) => {
        if (!disponibilidad || disponibilidad.length === 0) {
            return '0h';
        }
        
        const totalHoras = disponibilidad.length;
        return `${totalHoras}h semanales`;
    };

    const empleado = optometrista.empleadoId || {};

    return (
        <View style={styles.container}>
            {/* Información principal del optometrista */}
            <TouchableOpacity 
                style={styles.mainContent}
                onPress={onViewMore}
                activeOpacity={0.7}
            >
                {/* Avatar y información básica */}
                <View style={styles.optometristaInfo}>
                    {/* Foto de perfil */}
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
                                    {getInitials(empleado)}
                                </Text>
                            </View>
                        )}
                        {/* Indicador de título profesional */}
                        <View style={styles.drBadge}>
                            <Text style={styles.drText}>Dr.</Text>
                        </View>
                        {/* Indicador de disponibilidad */}
                        <View style={[
                            styles.disponibilidadBadge, 
                            { backgroundColor: getDisponibilidadColor(optometrista.disponible) }
                        ]}>
                            <Ionicons 
                                name={getDisponibilidadIcon(optometrista.disponible)} 
                                size={12} 
                                color="#FFFFFF" 
                            />
                        </View>
                    </View>

                    {/* Información del optometrista */}
                    <View style={styles.optometristaDetails}>
                        {/* Nombre y apellido */}
                        <Text style={styles.optometristaNombre}>
                            Dr. {getFullName(empleado)}
                        </Text>

                        {/* Licencia */}
                        <Text style={styles.optometristaLicencia}>
                            Lic. {optometrista.licencia || 'No especificada'}
                        </Text>

                        {/* Contacto */}
                        <View style={styles.contactInfo}>
                            <Ionicons name="mail-outline" size={14} color="#666666" />
                            <Text style={styles.contactText} numberOfLines={1}>
                                {empleado.correo || 'Sin correo'}
                            </Text>
                        </View>

                        <View style={styles.contactInfo}>
                            <Ionicons name="call-outline" size={14} color="#666666" />
                            <Text style={styles.contactText}>
                                {empleado.telefono || 'Sin teléfono'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Información adicional */}
                <View style={styles.additionalInfo}>
                    {/* Especialidad */}
                    <View style={[styles.especialidadBadge, { backgroundColor: getEspecialidadColor(optometrista.especialidad) }]}>
                        <Ionicons name="medical" size={14} color="#FFFFFF" />
                        <Text style={styles.especialidadText}>
                            {optometrista.especialidad || 'Sin especialidad'}
                        </Text>
                    </View>

                    {/* Experiencia */}
                    <View style={styles.experienciaInfo}>
                        <Ionicons name="school-outline" size={14} color="#666666" />
                        <Text style={styles.experienciaText}>
                            {formatExperiencia(optometrista.experiencia)}
                        </Text>
                    </View>

                    {/* Horas de disponibilidad */}
                    <View style={styles.horasInfo}>
                        <Ionicons name="time-outline" size={14} color="#666666" />
                        <Text style={styles.horasText}>
                            {getTotalHorasDisponibilidad(optometrista.disponibilidad)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Botones de acción */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(optometrista)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={16} color="#D0155F" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => onViewMore(optometrista)} 
                    activeOpacity={0.7}
                >
                    <Ionicons name="eye-outline" size={16} color="#009BBF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEdit(optometrista)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="create-outline" size={16} color="#49AA4C" />
                </TouchableOpacity>

               
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginVertical: 6,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    mainContent: {
        marginBottom: 12,
    },
    optometristaInfo: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E5E7EB',
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    drBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    drText: {
        fontSize: 10,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    disponibilidadBadge: {
        position: 'absolute',
        bottom: -2,
        left: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    optometristaDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    optometristaNombre: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    optometristaLicencia: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginBottom: 8,
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    contactText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginLeft: 6,
        flex: 1,
    },
    additionalInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
    },
    especialidadBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    especialidadText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    experienciaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    experienciaText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    horasInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    horasText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    deleteButton: {
        backgroundColor: '#D0155F15',
        borderColor: '#D0155F30',
    },
    viewButton: {
        backgroundColor: '#009BBF15',
        borderColor: '#009BBF30',
    },
    editButton: {
        backgroundColor: '#49AA4C15',
        borderColor: '#49AA4C30',
    },
    toggleButton: {
        backgroundColor: '#F59E0B15',
        borderColor: '#F59E0B30',
    },
});

export default OptometristaItem;