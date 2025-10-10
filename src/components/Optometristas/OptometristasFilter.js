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
 * Componente OptometristasFilter
 * 
 * Filtros horizontales en forma de chips scrollables
 * Permite filtrar optometristas por disponibilidad y sucursal
 * 
 * Props:
 * @param {string} selectedDisponibilidadFilter - Filtro de disponibilidad seleccionado
 * @param {string} selectedSucursalFilter - Filtro de sucursal seleccionado
 * @param {Function} onDisponibilidadFilterChange - Callback para cambio de filtro de disponibilidad
 * @param {Function} onSucursalFilterChange - Callback para cambio de filtro de sucursal
 */
const OptometristasFilter = ({ 
    selectedDisponibilidadFilter, 
    selectedSucursalFilter,
    onDisponibilidadFilterChange,
    onSucursalFilterChange
}) => {
    // Opciones de filtro por disponibilidad
    const disponibilidadOptions = [
        { 
            id: 'todos', 
            label: 'Todos', 
            icon: 'eye',
            color: '#009BBF'
        },
        { 
            id: 'disponibles', 
            label: 'Disponibles', 
            icon: 'checkmark-circle',
            color: '#49AA4C'
        },
        { 
            id: 'no_disponibles', 
            label: 'No Disponibles', 
            icon: 'close-circle',
            color: '#D0155F'
        }
    ];

    // Opciones de filtro por sucursal
    const sucursalOptions = [
        { 
            id: 'todas', 
            label: 'Todas', 
            icon: 'business',
            color: '#009BBF'
        },
        { 
            id: 'coatepeque', 
            label: 'Coatepeque', 
            icon: 'location',
            color: '#FF6B6B'
        },
        { 
            id: 'escalon', 
            label: 'Escalón', 
            icon: 'location',
            color: '#4ECDC4'
        },
        { 
            id: 'santa rosa', 
            label: 'Santa Rosa', 
            icon: 'location',
            color: '#FFD93D'
        },
        { 
            id: 'sonsonate', 
            label: 'Sonsonate', 
            icon: 'location',
            color: '#95E1D3'
        },
        { 
            id: 'la libertad', 
            label: 'La Libertad', 
            icon: 'location',
            color: '#F38181'
        }
    ];

    /**
     * Renderizar chip de filtro
     */
    const renderChip = (option, isSelected, onPress) => {
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
                onPress={() => onPress(option.id)}
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
            {/* Sección de filtros por disponibilidad */}
            <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Disponibilidad</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {disponibilidadOptions.map(option => 
                        renderChip(
                            option, 
                            selectedDisponibilidadFilter === option.id,
                            onDisponibilidadFilterChange
                        )
                    )}
                </ScrollView>
            </View>

            {/* Sección de filtros por sucursal */}
            <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sucursal</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {sucursalOptions.map(option => 
                        renderChip(
                            option, 
                            selectedSucursalFilter === option.id,
                            onSucursalFilterChange
                        )
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8F9FA',
        paddingVertical: 4,
    },
    filterSection: {
        marginBottom: 8,
    },
    filterSectionTitle: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        paddingHorizontal: 20,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 4,
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

export default OptometristasFilter;