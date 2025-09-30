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
import { X, Edit3, Trash2, Cube, FileText, Calendar, Image as ImageIcon } from 'lucide-react-native';

const CategoriaDetailModal = ({ visible, categoria, index, onClose, onEdit, onDelete }) => {
    if (!categoria) return null;

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

    const renderDetailField = (icon, label, value, color = '#009BBF') => {
        if (!value) return null;
        
        return (
            <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                    <View style={[styles.fieldIcon, { backgroundColor: `${color}15` }]}>
                        {icon}
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
                        <Text style={styles.headerTitle}>Detalle de Categoría</Text>
                        <Text style={styles.headerSubtitle}>Categoría #{index + 1}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <X size={24} color="#666666" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.categoriaHeader}>
                        <View style={styles.iconContainer}>
                            {categoria.icono && categoria.icono.includes('http') ? (
                                <Image source={{ uri: categoria.icono }} style={styles.iconImage} />
                            ) : (
                                <Cube size={40} color="#009BBF" />
                            )}
                        </View>
                        <Text style={styles.nombreText}>{categoria.nombre}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                <FileText size={20} color="#009BBF" />, 
                                'Descripción', 
                                categoria.descripcion, 
                                '#009BBF'
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DEL SISTEMA</Text>
                        <View style={styles.systemInfo}>
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Creado:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {formatDate(categoria.createdAt)}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Última actualización:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {formatDate(categoria.updatedAt)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.spacer} />
                </ScrollView>

                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => onEdit(categoria)}
                    >
                        <Edit3 size={20} color="#49AA4C" />
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => onDelete(categoria)}
                    >
                        <Trash2 size={20} color="#D0155F" />
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
        fontSize: 18,
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
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    categoriaHeader: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#009BBF15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    nombreText: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    section: {
        marginTop: 16,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionContent: {
        padding: 16,
    },
    detailField: {
        marginBottom: 20,
    },
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    fieldIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldValue: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        lineHeight: 22,
        marginLeft: 40,
    },
    systemInfo: {
        padding: 16,
    },
    systemInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    systemInfoDivider: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginVertical: 12,
    },
    spacer: {
        height: 20,
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
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#49AA4C15',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#49AA4C30',
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
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D0155F15',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D0155F30',
        gap: 6,
    },
    deleteButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#D0155F',
    },
    closeButtonAction: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    closeButtonActionText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
});

export default CategoriaDetailModal;