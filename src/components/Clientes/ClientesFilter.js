import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente ClientesFilter
 * 
 * Filtros horizontales en forma de chips scrollables
 * Permite filtrar clientes por estado
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.selectedFilter - Filtro actualmente seleccionado
 * @param {Function} props.onFilterChange - Función para cambiar el filtro
 */
const ClientesFilter = ({ selectedFilter, onFilterChange }) => {
    // Opciones de filtro para clientes
    const filtroOptions = [
        { 
            id: 'todos', 
            label: 'Todos', 
            icon: 'people',
            color: '#009BBF'
        },
        { 
            id: 'activos', 
            label: 'Activos', 
            icon: 'checkmark-circle',
            color: '#49AA4C'
        },
        { 
            id: 'inactivos', 
            label: 'Inactivos', 
            icon: 'close-circle',
            color: '#D0155F'
        }
    ];

    /**
     * Renderizar chip de filtro
     */
    const renderChip = (option) => {
        const isSelected = selectedFilter === option.id;
        
        return (
            <TouchableOpacity
                key={option.id}
                style={[
                    styles.chip,
                    { borderColor: option.color },
                    isSelected && { 
                        backgroundColor: option.color,
                        borderColor: option.color 
                    }
                ]}
                onPress={() => onFilterChange(option.id)}
                activeOpacity={0.7}
            >
                <Ionicons 
                    name={option.icon} 
                    size={16} 
                    color={isSelected ? '#FFFFFF' : option.color} 
                    style={styles.chipIcon}
                />
                <Text style={[
                    styles.chipText,
                    { color: option.color },
                    isSelected && styles.chipTextSelected
                ]}>
                    {option.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {filtroOptions.map(option => renderChip(option))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    chipIcon: {
        marginRight: 6,
    },
    chipText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontFamily: 'Lato-Bold',
    },
});

export default ClientesFilter;