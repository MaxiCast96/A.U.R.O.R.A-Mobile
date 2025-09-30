import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CategoriaItem = ({ 
    categoria, 
    onViewMore, 
    onEdit, 
    onDelete 
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.mainInfo}>
                <View style={styles.categoriaHeader}>
                    <View style={styles.iconContainer}>
                        {categoria.icono && categoria.icono.includes('http') ? (
                            <Ionicons name="image" size={24} color="#009BBF" />
                        ) : (
                            <Ionicons name={categoria.icono || 'cube-outline'} size={24} color="#009BBF" />
                        )}
                    </View>
                    <View style={styles.nombreContainer}>
                        <Text style={styles.nombreText} numberOfLines={1}>
                            {categoria.nombre}
                        </Text>
                        <Text style={styles.descripcionText} numberOfLines={2}>
                            {categoria.descripcion}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(categoria)}
                >
                    <Ionicons name="trash-outline" size={16} color="#D0155F" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => onViewMore(categoria)}
                >
                    <Ionicons name="eye-outline" size={16} color="#009BBF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEdit(categoria)}
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
    categoriaHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#009BBF15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
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

export default CategoriaItem;