import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente AsistenciaEmpleadoItem
 * 
 * Representa un item individual de empleado en la lista de asistencia
 * Muestra información básica y estado de disponibilidad
 * 
 * Props:
 * @param {Object} empleado - Objeto con datos del empleado
 * @param {Function} onToggleDisponibilidad - Callback para cambiar disponibilidad
 * @param {string} sucursalNombre - Nombre de la sucursal
 */
const AsistenciaEmpleadoItem = ({ 
    empleado, 
    onToggleDisponibilidad,
    sucursalNombre
}) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    /**
     * Obtener el color del cargo
     */
    const getCargoColor = (cargo) => {
        switch (cargo?.toLowerCase()) {
            case 'gerente':
                return '#D0155F';
            case 'optometrista':
                return '#009BBF';
            case 'administrador':
                return '#8B5CF6';
            case 'vendedor':
                return '#F59E0B';
            case 'técnico':
                return '#49AA4C';
            case 'recepcionista':
                return '#6B7280';
            default:
                return '#009BBF';
        }
    };

    /**
     * Obtener iniciales del empleado
     */
    const getInitials = (nombre, apellido) => {
        const initial1 = nombre?.charAt(0)?.toUpperCase() || '';
        const initial2 = apellido?.charAt(0)?.toUpperCase() || '';
        return initial1 + initial2 || 'EM';
    };

    /**
     * Manejar cambio de disponibilidad con animación
     */
    const handleToggle = () => {
        // Animación de presión
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        onToggleDisponibilidad(empleado._id, sucursalNombre);
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.mainContent}>
                {/* Avatar y información básica */}
                <View style={styles.employeeInfo}>
                    {/* Foto de perfil */}
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
                        
                        {/* Indicador de disponibilidad sobre el avatar */}
                        <View style={[
                            styles.statusIndicator,
                            { backgroundColor: empleado.disponible ? '#49AA4C' : '#D0155F' }
                        ]} />
                    </View>

                    {/* Información del empleado */}
                    <View style={styles.employeeDetails}>
                        {/* Nombre completo */}
                        <Text style={styles.employeeName} numberOfLines={1}>
                            {empleado.nombre} {empleado.apellido}
                        </Text>

                        {/* Cargo */}
                        <View style={[
                            styles.cargoBadge, 
                            { backgroundColor: getCargoColor(empleado.cargo) }
                        ]}>
                            <Text style={styles.cargoText}>
                                {empleado.cargo || 'Sin cargo'}
                            </Text>
                        </View>

                        {/* Estado de disponibilidad */}
                        <View style={styles.disponibilidadContainer}>
                            <Ionicons 
                                name={empleado.disponible ? 'checkmark-circle' : 'close-circle'} 
                                size={16} 
                                color={empleado.disponible ? '#49AA4C' : '#D0155F'} 
                            />
                            <Text style={[
                                styles.disponibilidadText,
                                { color: empleado.disponible ? '#49AA4C' : '#D0155F' }
                            ]}>
                                {empleado.disponible ? 'Disponible' : 'No disponible'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Botón de toggle */}
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        empleado.disponible ? styles.toggleButtonDisponible : styles.toggleButtonNoDisponible
                    ]}
                    onPress={handleToggle}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name={empleado.disponible ? 'checkmark' : 'close'} 
                        size={20} 
                        color="#FFFFFF" 
                    />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    employeeInfo: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E5E7EB',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    employeeDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    employeeName: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    cargoBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginBottom: 4,
    },
    cargoText: {
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    disponibilidadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    disponibilidadText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
    },
    toggleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    toggleButtonDisponible: {
        backgroundColor: '#49AA4C',
    },
    toggleButtonNoDisponible: {
        backgroundColor: '#D0155F',
    },
});

export default AsistenciaEmpleadoItem;