import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PromocionesFilter = ({ selectedFilter, onFilterChange }) => {
    const filters = [
        { key: 'todas', label: 'Todas', color: '#009BBF' },
        { key: 'activas', label: 'Activas', color: '#49AA4C' },
        { key: 'inactivas', label: 'Inactivas', color: '#D0155F' },
        { key: 'expiradas', label: 'Expiradas', color: '#FF8C00' }
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

export default PromocionesFilter;