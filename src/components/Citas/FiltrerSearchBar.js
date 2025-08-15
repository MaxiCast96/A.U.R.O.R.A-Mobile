import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity,
    Modal,
    ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente FilterSearchBar
 * 
 * Proporciona funcionalidades de búsqueda por motivo de cita y filtros
 * de ordenamiento (más reciente, más próxima, más lejana).
 * Mantiene la estética y paleta de colores de la aplicación.
 * 
 * Props:
 * @param {string} searchText - Texto actual de búsqueda
 * @param {Function} onSearchChange - Función para manejar cambios en búsqueda
 * @param {string} selectedFilter - Filtro actual seleccionado
 * @param {Function} onFilterChange - Función para manejar cambios en filtros
 */
const FilterSearchBar = ({ 
    searchText, 
    onSearchChange, 
    selectedFilter, 
    onFilterChange 
}) => {
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    /**
     * Opciones de filtros disponibles
     */
    const filterOptions = [
        {
            key: 'reciente',
            label: 'Más reciente',
            description: 'Citas creadas recientemente primero',
            icon: 'time-outline'
        },
        {
            key: 'proxima',
            label: 'Más próxima',
            description: 'Citas próximas en el tiempo primero',
            icon: 'arrow-up-outline'
        },
        {
            key: 'lejana',
            label: 'Más lejana',
            description: 'Citas más lejanas en el tiempo primero',
            icon: 'arrow-down-outline'
        }
    ];

    /**
     * Obtener el label del filtro actual
     */
    const getCurrentFilterLabel = () => {
        const current = filterOptions.find(option => option.key === selectedFilter);
        return current ? current.label : 'Más reciente';
    };

    /**
     * Manejar selección de filtro
     */
    const handleFilterSelect = (filterKey) => {
        onFilterChange(filterKey);
        setFilterModalVisible(false);
    };

    /**
     * Renderizar opción de filtro
     */
    const renderFilterOption = (option) => (
        <TouchableOpacity
            key={option.key}
            style={[
                styles.filterOption,
                selectedFilter === option.key && styles.filterOptionSelected
            ]}
            onPress={() => handleFilterSelect(option.key)}
            activeOpacity={0.7}
        >
            <View style={styles.filterOptionContent}>
                <View style={[
                    styles.filterOptionIcon,
                    selectedFilter === option.key && styles.filterOptionIconSelected
                ]}>
                    <Ionicons 
                        name={option.icon} 
                        size={20} 
                        color={selectedFilter === option.key ? '#FFFFFF' : '#009BBF'} 
                    />
                </View>
                <View style={styles.filterOptionText}>
                    <Text style={[
                        styles.filterOptionLabel,
                        selectedFilter === option.key && styles.filterOptionLabelSelected
                    ]}>
                        {option.label}
                    </Text>
                    <Text style={[
                        styles.filterOptionDescription,
                        selectedFilter === option.key && styles.filterOptionDescriptionSelected
                    ]}>
                        {option.description}
                    </Text>
                </View>
                {selectedFilter === option.key && (
                    <Ionicons name="checkmark-circle" size={24} color="#009BBF" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons 
                        name="search-outline" 
                        size={20} 
                        color="#666666" 
                        style={styles.searchIcon} 
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por motivo de cita..."
                        placeholderTextColor="#999999"
                        value={searchText}
                        onChangeText={onSearchChange}
                    />
                    {searchText ? (
                        <TouchableOpacity 
                            onPress={() => onSearchChange('')}
                            style={styles.clearButton}
                        >
                            <Ionicons name="close-circle" size={20} color="#666666" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Filtros */}
            <View style={styles.filtersContainer}>
                <TouchableOpacity 
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                    activeOpacity={0.7}
                >
                    <View style={styles.filterButtonContent}>
                        <Ionicons name="funnel-outline" size={18} color="#009BBF" />
                        <Text style={styles.filterButtonText}>
                            {getCurrentFilterLabel()}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#009BBF" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Modal de filtros */}
            <Modal
                visible={filterModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {/* Header del modal */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Ordenar citas</Text>
                        <TouchableOpacity 
                            style={styles.modalCloseButton}
                            onPress={() => setFilterModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#666666" />
                        </TouchableOpacity>
                    </View>

                    {/* Opciones de filtro */}
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.sectionTitle}>OPCIONES DE ORDENAMIENTO</Text>
                        {filterOptions.map(renderFilterOption)}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    
    // Contenedor de búsqueda
    searchContainer: {
        marginBottom: 12,
    },
    
    // Caja de búsqueda
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    
    // Ícono de búsqueda
    searchIcon: {
        marginRight: 12,
    },
    
    // Input de búsqueda
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    
    // Botón de limpiar búsqueda
    clearButton: {
        padding: 4,
    },
    
    // Contenedor de filtros
    filtersContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    
    // Botón de filtro
    filterButton: {
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    
    // Contenido del botón de filtro
    filterButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    
    // Texto del botón de filtro
    filterButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
    },
    
    // Contenedor del modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    
    // Header del modal
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        paddingTop: 60,
    },
    
    // Título del modal
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    
    // Botón de cerrar modal
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Contenido del modal
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    
    // Título de sección
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginBottom: 16,
        letterSpacing: 1,
    },
    
    // Opción de filtro
    filterOption: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    
    // Opción de filtro seleccionada
    filterOptionSelected: {
        borderColor: '#009BBF',
        backgroundColor: '#F0F9FF',
    },
    
    // Contenido de la opción de filtro
    filterOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    
    // Ícono de la opción de filtro
    filterOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F0F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Ícono de opción seleccionada
    filterOptionIconSelected: {
        backgroundColor: '#009BBF',
    },
    
    // Texto de la opción de filtro
    filterOptionText: {
        flex: 1,
    },
    
    // Label de la opción de filtro
    filterOptionLabel: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    
    // Label de opción seleccionada
    filterOptionLabelSelected: {
        color: '#009BBF',
    },
    
    // Descripción de la opción de filtro
    filterOptionDescription: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    
    // Descripción de opción seleccionada
    filterOptionDescriptionSelected: {
        color: '#009BBF',
    },
});

export default FilterSearchBar;