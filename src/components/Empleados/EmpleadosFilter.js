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
 * Componente EmpleadosFilter
 * 
 * Filtros horizontales en forma de chips scrollables
 * Permite filtrar empleados por estado y sucursal
 * 
 * Props:
 * @param {string} selectedEstadoFilter - Filtro de estado seleccionado
 * @param {string} selectedSucursalFilter - Filtro de sucursal seleccionado
 * @param {Function} onEstadoFilterChange - Callback para cambio de filtro de estado
 * @param {Function} onSucursalFilterChange - Callback para cambio de filtro de sucursal
 */
const EmpleadosFilter = ({ 
    selectedEstadoFilter, 
    selectedSucursalFilter,
    onEstadoFilterChange,
    onSucursalFilterChange
}) => {
    // Opciones de filtro por estado
    const estadoOptions = [
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

    // Opciones de filtro por sucursal (corregidas)
    const sucursalOptions = [
        { 
            id: 'todas', 
            label: 'Todas', 
            icon: 'business',
            color: '#009BBF'
        },
        { 
            id: 'quezaltepeque', 
            label: 'Quezaltepeque', 
            icon: 'location',
            color: '#FF6B6B'
        },
        { 
            id: 'colonia médica', 
            label: 'Colonia Médica', 
            icon: 'location',
            color: '#4ECDC4'
        },
        { 
            id: 'santa rosa', 
            label: 'Santa Rosa', 
            icon: 'location',
            color: '#FFD93D'
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
            {/* Sección de filtros por estado */}
            <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Estado</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {estadoOptions.map(option => 
                        renderChip(
                            option, 
                            selectedEstadoFilter === option.id,
                            onEstadoFilterChange
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

export default EmpleadosFilter;