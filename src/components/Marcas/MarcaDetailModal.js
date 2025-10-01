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

const MarcaDetailModal = ({ visible, marca, index, onClose, onEdit, onDelete }) => {
    if (!marca) return null;

    const getLineaColor = (linea) => {
        switch (linea) {
            case 'Premium': return '#FF8C00';
            case 'Económica': return '#49AA4C';
            default: return '#666666';
        }
    };

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
                        <Text style={styles.headerTitle}>Detalle de Marca</Text>
                        <Text style={styles.headerSubtitle}>Marca #{index + 1}</Text>
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
                    <View style={styles.marcaHeader}>
                        {marca.logo ? (
                            <Image source={{ uri: marca.logo }} style={styles.logo} />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <Ionicons name="business" size={40} color="#999999" />
                            </View>
                        )}
                        <Text style={styles.nombreText}>{marca.nombre}</Text>
                        <Text style={styles.paisText}>{marca.paisOrigen}</Text>
                        
                        <View style={styles.lineasContainer}>
                            {marca.lineas?.map((linea, index) => (
                                <View 
                                    key={index} 
                                    style={[styles.lineaBadge, { backgroundColor: getLineaColor(linea) }]}
                                >
                                    <Ionicons name="pricetag" size={16} color="#FFFFFF" />
                                    <Text style={styles.lineaText}>{linea}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField('document-text', 'Descripción', marca.descripcion, '#009BBF')}
                            {renderDetailField('flag', 'País de Origen', marca.paisOrigen, '#D0155F')}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>LÍNEAS DE PRODUCTOS</Text>
                        <View style={styles.lineasDetail}>
                            {marca.lineas?.map((linea, index) => (
                                <View key={index} style={styles.lineaDetailItem}>
                                    <View style={[styles.lineaDot, { backgroundColor: getLineaColor(linea) }]} />
                                    <Text style={styles.lineaDetailText}>{linea}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.spacer} />
                </ScrollView>

                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => onEdit(marca)}
                    >
                        <Ionicons name="create" size={20} color="#49AA4C" />
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => onDelete(marca)}
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
    marcaHeader: {
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
    logo: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginBottom: 12,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    nombreText: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 4,
    },
    paisText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'center',
        marginBottom: 12,
    },
    lineasContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    lineaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    lineaText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
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
    lineasDetail: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    lineaDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    lineaDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    lineaDetailText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
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
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    fieldValue: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        lineHeight: 22,
        marginLeft: 52,
    },
    spacer: {
        height: 20,
    },
    actionButtons: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        gap: 12,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#49AA4C15',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#49AA4C30',
        gap: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#49AA4C',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D0155F15',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D0155F30',
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#D0155F',
    },
    closeButtonAction: {
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
    },
    closeButtonActionText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
});

export default MarcaDetailModal;