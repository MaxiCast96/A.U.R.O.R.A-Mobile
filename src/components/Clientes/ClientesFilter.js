import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Componente para filtros de clientes
 * 
 * Permite filtrar por:
 * - Todos los clientes
 * - Solo clientes activos
 * - Solo clientes inactivos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.selectedFilter - Filtro actualmente seleccionado
 * @param {Function} props.onFilterChange - Función para cambiar el filtro
 */
const ClientesFilter = ({ selectedFilter, onFilterChange }) => {
    const filters = [
        { key: 'todos', label: 'Todos', color: '#009BBF' },
        { key: 'activos', label: 'Activos', color: '#49AA4C' },
        { key: 'inactivos', label: 'Inactivos', color: '#D0155F' }
    ];

    const renderFilterButton = (filter) => {
        const isSelected = selectedFilter === filter.key;
        
        return (
            <TouchableOpacity
                key={filter.key}
                style={[
                    styles.filterButton,
                    isSelected && { 
                        backgroundColor: filter.color,
                        borderColor: filter.color 
                    }
                ]}
                onPress={() => onFilterChange(filter.key)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.filterText,
                    isSelected && { color: '#FFFFFF' }
                ]}>
                    {filter.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {filters.map(filter => renderFilterButton(filter))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    filterText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
});

export default ClientesFilter;