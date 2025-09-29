import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente OptometristasFilter
 * 
 * Proporciona filtros dropdown para la lista de optometristas:
 * - Filtro por disponibilidad: Todos, Disponibles, No disponibles
 * - Filtro por sucursal: Todas, Coatepeque, Escalón, etc.
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
    const [disponibilidadModalVisible, setDisponibilidadModalVisible] = useState(false);
    const [sucursalModalVisible, setSucursalModalVisible] = useState(false);

    // Opciones de filtro por disponibilidad
    const disponibilidadOptions = [
        { id: 'todos', label: 'Todos los estados' },
        { id: 'disponibles', label: 'Disponibles' },
        { id: 'no_disponibles', label: 'No Disponibles' }
    ];

    // Opciones de filtro por sucursal
    const sucursalOptions = [
        { id: 'todas', label: 'Todas las sucursales' },
        { id: 'coatepeque', label: 'Sucursal Coatepeque' },
        { id: 'escalon', label: 'Sucursal Escalón' },
        { id: 'santa rosa', label: 'Sucursal Santa Rosa' },
        { id: 'sonsonate', label: 'Sucursal Sonsonate' },
        { id: 'la libertad', label: 'Sucursal La Libertad' }
    ];

    /**
     * Obtener label del filtro seleccionado
     */
    const getSelectedDisponibilidadLabel = () => {
        const selected = disponibilidadOptions.find(option => option.id === selectedDisponibilidadFilter);
        return selected ? selected.label : 'Todos los estados';
    };

    const getSelectedSucursalLabel = () => {
        const selected = sucursalOptions.find(option => option.id === selectedSucursalFilter);
        return selected ? selected.label : 'Todas las sucursales';
    };

    /**
     * Renderizar dropdown
     */
    const renderDropdown = (
        title,
        selectedLabel,
        isVisible,
        setVisible,
        options,
        onSelect,
        selectedValue
    ) => (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.dropdownButtonText}>{selectedLabel}</Text>
                <Ionicons name="chevron-down" size={16} color="#009BBF" />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isVisible}
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        selectedValue === item.id && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        onSelect(item.id);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedValue === item.id && styles.selectedOptionText
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {selectedValue === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#009BBF" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.filtersRow}>
                {/* Dropdown Disponibilidad */}
                {renderDropdown(
                    'Filtrar por Disponibilidad',
                    getSelectedDisponibilidadLabel(),
                    disponibilidadModalVisible,
                    setDisponibilidadModalVisible,
                    disponibilidadOptions,
                    onDisponibilidadFilterChange,
                    selectedDisponibilidadFilter
                )}

                {/* Dropdown Sucursal */}
                {renderDropdown(
                    'Filtrar por Sucursal',
                    getSelectedSucursalLabel(),
                    sucursalModalVisible,
                    setSucursalModalVisible,
                    sucursalOptions,
                    onSucursalFilterChange,
                    selectedSucursalFilter
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8F9FA',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    filtersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    dropdownContainer: {
        flex: 1,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dropdownButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#009BBF',
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        width: '80%',
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
        textAlign: 'center',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
    },
    selectedOption: {
        backgroundColor: '#009BBF15',
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        flex: 1,
    },
    selectedOptionText: {
        color: '#009BBF',
        fontFamily: 'Lato-Bold',
    },
});

export default OptometristasFilter;