import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PromocionItem = ({ 
    promocion, 
    onViewMore, 
    onEdit, 
    onDelete, 
    onToggleEstado 
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getEstadoColor = (activo, fechaFin) => {
        if (!activo) return '#D0155F';
        const hoy = new Date();
        const fin = new Date(fechaFin);
        if (fin < hoy) return '#FF8C00';
        return '#49AA4C';
    };

    const getEstadoText = (activo, fechaFin) => {
        if (!activo) return 'Inactiva';
        const hoy = new Date();
        const fin = new Date(fechaFin);
        if (fin < hoy) return 'Expirada';
        return 'Activa';
    };

    const formatDescuento = (tipo, valor) => {
        return tipo === 'porcentaje' ? `${valor}%` : `$${valor}`;
    };

    const estadoColor = getEstadoColor(promocion.activo, promocion.fechaFin);
    const estadoText = getEstadoText(promocion.activo, promocion.fechaFin);

    return (
        <View style={styles.container}>
            <View style={styles.mainInfo}>
                <View style={styles.promocionHeader}>
                    <View style={styles.codigoContainer}>
                        <Text style={styles.codigoText}>{promocion.codigoPromo}</Text>
                    </View>
                    <View style={styles.nombreContainer}>
                        <Text style={styles.nombreText} numberOfLines={1}>
                            {promocion.nombre}
                        </Text>
                        <Text style={styles.descripcionText} numberOfLines={2}>
                            {promocion.descripcion}
                        </Text>
                    </View>
                </View>

                <View style={styles.detallesContainer}>
                    <View style={styles.detalleItem}>
                        <Text style={styles.detalleLabel}>Descuento</Text>
                        <Text style={styles.descuentoText}>
                            {formatDescuento(promocion.tipoDescuento, promocion.valorDescuento)}
                        </Text>
                    </View>
                    <View style={styles.detalleItem}>
                        <Text style={styles.detalleLabel}>Vigencia</Text>
                        <Text style={styles.fechaText}>
                            {formatDate(promocion.fechaInicio)} - {formatDate(promocion.fechaFin)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.statusContainer}>
                <View style={[styles.estadoBadge, { backgroundColor: `${estadoColor}15` }]}>
                    <Text style={[styles.estadoText, { color: estadoColor }]}>
                        {estadoText}
                    </Text>
                </View>
                {promocion.mostrarEnCarrusel && (
                    <View style={styles.carruselBadge}>
                        <Ionicons name="images" size={12} color="#009BBF" />
                        <Text style={styles.carruselText}>Carrusel</Text>
                    </View>
                )}
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(promocion)}
                >
                    <Ionicons name="trash-outline" size={16} color="#D0155F" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => onViewMore(promocion)}
                >
                    <Ionicons name="eye-outline" size={16} color="#009BBF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEdit(promocion)}
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
    promocionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    codigoContainer: {
        backgroundColor: '#009BBF15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 12,
    },
    codigoText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
    },
    nombreContainer: {
        flex: 1,
    },
    nombreText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    descripcionText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        lineHeight: 18,
    },
    detallesContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    detalleItem: {
        flex: 1,
    },
    detalleLabel: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#999999',
        marginBottom: 2,
    },
    descuentoText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#D0155F',
    },
    fechaText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    estadoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    estadoText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        textTransform: 'uppercase',
    },
    carruselBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#009BBF15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    carruselText: {
        fontSize: 10,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
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

export default PromocionItem;