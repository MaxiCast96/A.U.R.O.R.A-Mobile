import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente para mostrar un item individual de cliente
 * 
 * Replica el diseño de la tabla del sitio web mostrando:
 * - Avatar con iniciales
 * - Información del cliente (nombre, edad, DUI)
 * - Información de contacto (teléfono, email)
 * - Dirección
 * - Estado del cliente
 * - Fecha de registro
 * - Botones de acción
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.cliente - Datos del cliente
 * @param {Function} props.onViewMore - Función para ver más detalles
 * @param {Function} props.onEdit - Función para editar cliente
 * @param {Function} props.onDelete - Función para eliminar cliente
 * @param {Function} props.onToggleEstado - Función para cambiar estado
 */
const ClienteItem = ({ 
    cliente, 
    onViewMore, 
    onEdit, 
    onDelete, 
    onToggleEstado 
}) => {
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
     * Formatear dirección del cliente
     * Maneja tanto strings como objetos con estructura de dirección
     */
    const formatDireccion = (direccion) => {
        if (!direccion) return 'Dirección no registrada';
        
        // Si es un string, devolverlo tal como está
        if (typeof direccion === 'string') {
            return direccion;
        }
        
        // Si es un objeto, formatear la dirección
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
     * Formatear fecha de registro
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    /**
     * Obtener color del estado
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

    const initials = getInitials(cliente.nombre);
    const estadoColor = getEstadoColor(cliente.estado);
    const isActivo = cliente.estado?.toLowerCase() === 'activo';

    return (
        <View style={styles.container}>
            {/* Información principal del cliente */}
            <View style={styles.mainInfo}>
                {/* Avatar y nombre */}
                <View style={styles.clienteHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.clienteBasicInfo}>
                        <Text style={styles.clienteNombre} numberOfLines={1}>
                            {cliente.nombre || 'Sin nombre'}
                        </Text>
                        <Text style={styles.clienteEdad}>
                            {cliente.edad ? `${cliente.edad} años` : 'Edad no especificada'}
                        </Text>
                    </View>
                </View>

                {/* DUI */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>DUI</Text>
                    <Text style={styles.infoValue}>
                        {cliente.dui || 'No registrado'}
                    </Text>
                </View>
            </View>

            {/* Información de contacto */}
            <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={16} color="#666666" />
                    <Text style={styles.contactText} numberOfLines={1}>
                        {cliente.telefono || 'Sin teléfono'}
                    </Text>
                </View>
                <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={16} color="#666666" />
                    <Text style={styles.contactText} numberOfLines={1}>
                        {cliente.correo || 'Sin correo'}
                    </Text>
                </View>
            </View>

            {/* Dirección */}
            <View style={styles.direccionInfo}>
                <View style={styles.direccionItem}>
                    <Ionicons name="location-outline" size={16} color="#666666" />
                    <Text style={styles.direccionText} numberOfLines={2}>
                        {formatDireccion(cliente.direccion)}
                    </Text>
                </View>
            </View>

            {/* Estado y fecha */}
            <View style={styles.statusInfo}>
                <View style={styles.estadoContainer}>
                    <View style={[styles.estadoBadge, { backgroundColor: `${estadoColor}15` }]}>
                        <Text style={[styles.estadoText, { color: estadoColor }]}>
                            {cliente.estado || 'Sin estado'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.fechaRegistro}>
                    {formatDate(cliente.fechaRegistro || cliente.createdAt)}
                </Text>
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(cliente)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={16} color="#D0155F" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => onViewMore(cliente)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="eye-outline" size={16} color="#009BBF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEdit(cliente)}
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
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    mainInfo: {
        marginBottom: 12,
    },
    clienteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Lato-Bold',
    },
    clienteBasicInfo: {
        flex: 1,
    },
    clienteNombre: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    clienteEdad: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    infoSection: {
        marginTop: 4,
    },
    infoLabel: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#999999',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    contactInfo: {
        marginBottom: 12,
        gap: 6,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        flex: 1,
    },
    direccionInfo: {
        marginBottom: 12,
    },
    direccionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    direccionText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        flex: 1,
        lineHeight: 18,
    },
    statusInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    estadoContainer: {
        flex: 1,
    },
    estadoBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    estadoText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        textTransform: 'capitalize',
    },
    fechaRegistro: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#999999',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
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
});

export default ClienteItem;