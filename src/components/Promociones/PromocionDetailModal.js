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

const PromocionDetailModal = ({ visible, promocion, index, onClose, onEdit, onDelete }) => {
    if (!promocion) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Detalle de Promoción</Text>
                        <Text style={styles.headerSubtitle}>Promoción #{index + 1}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="#666666" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.promocionHeader}>
                        <View style={styles.codigoContainer}>
                            <Text style={styles.codigoText}>{promocion.codigoPromo}</Text>
                        </View>
                        <Text style={styles.nombreText}>{promocion.nombre}</Text>
                        <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
                            <Ionicons name="pricetag" size={16} color="#FFFFFF" />
                            <Text style={styles.estadoText}>{estadoText}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField('document-text', 'Descripción', promocion.descripcion, '#009BBF')}
                            {renderDetailField('trending-down', 'Descuento', 
                                formatDescuento(promocion.tipoDescuento, promocion.valorDescuento), '#D0155F')}
                            {renderDetailField('flag', 'Prioridad', `Nivel ${promocion.prioridad}`, '#49AA4C')}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>VIGENCIA</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField('calendar', 'Fecha de inicio', formatDate(promocion.fechaInicio), '#FF8C00')}
                            {renderDetailField('calendar', 'Fecha de fin', formatDate(promocion.fechaFin), '#FF8C00')}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>CONFIGURACIÓN</Text>
                        <View style={styles.systemInfo}>
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Mostrar en carrusel:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {promocion.mostrarEnCarrusel ? 'Sí' : 'No'}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Límite de usos:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {promocion.limiteUsos || 'Ilimitado'}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Aplica a:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {promocion.aplicaA === 'todos' ? 'Todos los productos' : 
                                     promocion.aplicaA === 'categoria' ? 'Categorías específicas' : 
                                     'Lentes específicos'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.spacer} />
                </ScrollView>

                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => onEdit(promocion)}
                    >
                        <Ionicons name="create" size={20} color="#49AA4C" />
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => onDelete(promocion)}
                    >
                        <Ionicons name="trash" size={20} color="#D0155F" />
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.closeButtonAction}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonActionText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
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
    content: {
        flex: 1,
    },
    promocionHeader: {
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
    codigoContainer: {
        backgroundColor: '#009BBF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 12,
    },
    codigoText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    nombreText: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12,
    },
    estadoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    estadoText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    section: {
        marginHorizontal: 20,
        marginTop: 20,
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
        marginVertical: 4,
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
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        gap: 12,
    },
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
    editButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#49AA4C',
    },
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
    deleteButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#D0155F',
    },
    closeButtonAction: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonActionText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default PromocionDetailModal;