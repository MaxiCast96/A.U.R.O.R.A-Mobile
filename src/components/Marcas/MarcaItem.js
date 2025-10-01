import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MarcaItem = ({ 
    marca, 
    onViewMore, 
    onEdit, 
    onDelete
}) => {
    const getLineaColor = (linea) => {
        switch (linea) {
            case 'Premium': return '#009BBF';
            case 'Económica': return '#49AA4C';
            default: return '#666666';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.mainInfo}>
                <View style={styles.marcaHeader}>
                    {marca.logo ? (
                        <Image source={{ uri: marca.logo }} style={styles.logo} />
                    ) : (
                        <View style={styles.logoPlaceholder}>
                            <Ionicons name="business" size={24} color="#999999" />
                        </View>
                    )}
                    <View style={styles.nombreContainer}>
                        <Text style={styles.nombreText} numberOfLines={1}>
                            {marca.nombre}
                        </Text>
                        <Text style={styles.paisText} numberOfLines={1}>
                            {marca.paisOrigen}
                        </Text>
                    </View>
                </View>

                <Text style={styles.descripcionText} numberOfLines={2}>
                    {marca.descripcion}
                </Text>

                <View style={styles.lineasContainer}>
                    {marca.lineas?.map((linea, index) => (
                        <View 
                            key={index} 
                            style={[styles.lineaBadge, { backgroundColor: `${getLineaColor(linea)}15` }]}
                        >
                            <Text style={[styles.lineaText, { color: getLineaColor(linea) }]}>
                                {linea}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(marca)}
                >
                    <Ionicons name="trash-outline" size={16} color="#D0155F" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => onViewMore(marca)}
                >
                    <Ionicons name="eye-outline" size={16} color="#009BBF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEdit(marca)}
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
    marcaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    logo: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    logoPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    nombreContainer: {
        flex: 1,
    },
    nombreText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    paisText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    descripcionText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        lineHeight: 18,
        marginBottom: 12,
    },
    lineasContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    lineaBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    lineaText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
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

export default MarcaItem;