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
 * Componente MarcasFilter
 * 
 * Filtros horizontales en forma de chips scrollables
 * Permite filtrar marcas por categoría
 * 
 * Props:
 * @param {string} selectedFilter - Filtro seleccionado actualmente
 * @param {Function} onFilterChange - Callback para cambio de filtro
 */
const MarcasFilter = ({ selectedFilter, onFilterChange }) => {
    // Opciones de filtro para marcas
    const filtroOptions = [
        { 
            id: 'todas', 
            label: 'Todas', 
            icon: 'business',
            color: '#009BBF'
        },
        { 
            id: 'Premium', 
            label: 'Premium', 
            icon: 'star',
            color: '#FF8C00'
        },
        { 
            id: 'Económica', 
            label: 'Económica', 
            icon: 'wallet',
            color: '#49AA4C'
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

export default MarcasFilter;