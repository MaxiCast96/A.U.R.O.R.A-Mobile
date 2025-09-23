import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente EmpleadoItem
 * 
 * Representa un item individual de empleado en la lista
 * Muestra información básica del empleado y acciones disponibles
 * 
 * Props:
 * @param {Object} empleado - Objeto con datos del empleado
 * @param {Function} onViewMore - Callback para ver más detalles
 * @param {Function} onEdit - Callback para editar empleado
 * @param {Function} onDelete - Callback para eliminar empleado
 * @param {Function} onToggleEstado - Callback para cambiar estado
 */
const EmpleadoItem = ({ 
    empleado, 
    onViewMore, 
    onEdit, 
    onDelete, 
    onToggleEstado 
}) => {
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
            default:
                return '#009BBF';
        }
    };

    /**
     * Formatear salario
     */
    const formatSalario = (salario) => {
        if (!salario) return '$0.00';
        return `$${parseFloat(salario).toFixed(2)}`;
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
     * Obtener nombre de sucursal
     */
    const getSucursalName = (empleado) => {
        return empleado.sucursalId?.nombre || empleado.sucursal || 'Sin sucursal';
    };

    return (
        <View style={styles.container}>
            {/* Información principal del empleado */}
            <TouchableOpacity 
                style={styles.mainContent}
                onPress={onViewMore}
                activeOpacity={0.7}
            >
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
                    </View>

                    {/* Información del empleado */}
                    <View style={styles.employeeDetails}>
                        {/* Nombre y apellido */}
                        <Text style={styles.employeeName}>
                            {empleado.nombre} {empleado.apellido}
                        </Text>

                        {/* DUI */}
                        <Text style={styles.employeeDui}>
                            {empleado.dui}
                        </Text>

                        {/* Contacto */}
                        <View style={styles.contactInfo}>
                            <Ionicons name="call-outline" size={14} color="#666666" />
                            <Text style={styles.contactText}>
                                {empleado.telefono}
                            </Text>
                        </View>

                        <View style={styles.contactInfo}>
                            <Ionicons name="mail-outline" size={14} color="#666666" />
                            <Text style={styles.contactText} numberOfLines={1}>
                                {empleado.correo}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Información adicional */}
                <View style={styles.additionalInfo}>
                    {/* Cargo */}
                    <View style={[styles.cargoBadge, { backgroundColor: getCargoColor(empleado.cargo) }]}>
                        <Text style={styles.cargoText}>
                            {empleado.cargo || 'Sin cargo'}
                        </Text>
                    </View>

                    {/* Sucursal */}
                    <View style={styles.sucursalInfo}>
                        <Ionicons name="business-outline" size={14} color="#666666" />
                        <Text style={styles.sucursalText}>
                            {getSucursalName(empleado)}
                        </Text>
                    </View>

                    {/* Salario */}
                    <View style={styles.salarioInfo}>
                        <Ionicons name="card-outline" size={14} color="#666666" />
                        <Text style={styles.salarioText}>
                            {formatSalario(empleado.salario)}
                        </Text>
                    </View>

                    {/* Estado */}
                    <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(empleado.estado) }]}>
                        <Text style={styles.estadoText}>
                            {empleado.estado || 'Sin estado'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Botones de acción */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(empleado)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={16} color="#D0155F" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => onViewMore(empleado)} 
                    activeOpacity={0.7}
                >
                    <Ionicons name="eye-outline" size={16} color="#009BBF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEdit(empleado)}
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
    employeeInfo: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatarContainer: {
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
    employeeDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    employeeName: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    employeeDui: {
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
    cargoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    cargoText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    sucursalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sucursalText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginLeft: 4,
    },
    salarioInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    salarioText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#49AA4C',
        marginLeft: 4,
    },
    estadoBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    estadoText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
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

export default EmpleadoItem;