import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList,
    ToastAndroid,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useOptometristas } from '../hooks/useOptometrista';
import OptometristasFilter from '../components/Optometristas/OptometristasFilter';
import OptometristaItem from '../components/Optometristas/OptometristaItem';
import OptometristaDetailModal from '../components/Optometristas/OptometristaDetailModal';
import EditOptometristaModal from '../components/Optometristas/EditOptometristaModal';

/**
 * Pantalla de Gestión de Optometristas
 * 
 * Esta pantalla replica la funcionalidad del sitio web de escritorio
 * para gestionar optometristas de la óptica, incluyendo:
 * - Estadísticas de optometristas (total, disponibles, no disponibles, experiencia promedio)
 * - Búsqueda por nombre, email, especialidad, licencia
 * - Filtros por disponibilidad (todos, disponibles, no disponibles)
 * - Filtros por sucursal (todas, específicas)
 * - Lista de optometristas con información completa
 * - Acciones para ver, editar y eliminar optometristas
 * - CRUD completo funcional
 * 
 * Sigue el mismo diseño y colores del sitio web de escritorio
 * adaptado para dispositivos móviles.
 */
const Optometristas = () => {
    const navigation = useNavigation();
    
    // Estado para el modal de editar
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedOptometristaForEdit, setSelectedOptometristaForEdit] = useState(null);
    
    const {
        // Estados de datos
        filteredOptometristas,
        loading,
        refreshing,
        
        // Estados de modal de detalle
        modalVisible,
        selectedOptometrista,
        selectedIndex,
        
        // Estados de filtros
        searchText,
        selectedDisponibilidadFilter,
        selectedSucursalFilter,
        
        // Funciones de datos
        onRefresh,
        getOptometristasStats,
        
        // Funciones CRUD
        deleteOptometrista,
        updateOptometristaDisponibilidad,
        updateOptometrista,
        
        // Funciones de modal de detalle
        handleViewMore,
        handleCloseModal,
        
        // Funciones de filtros
        setSearchText,
        setSelectedDisponibilidadFilter,
        setSelectedSucursalFilter,
        
        // Función para actualizar lista de optometristas
        addOptometristaToList,
    } = useOptometristas();

    /**
     * Mostrar notificación de éxito multiplataforma
     */
    const showSuccessMessage = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
            Alert.alert('Éxito', message, [{ text: 'Entendido', style: 'default' }]);
        }
    };

    /**
     * Manejar edición de optometrista
     */
    const handleEdit = (optometrista) => {
        // Cerrar modal de detalle primero si está abierto
        if (modalVisible) {
            handleCloseModal();
        }
        
        // Abrir modal de editar con los datos del optometrista
        setSelectedOptometristaForEdit(optometrista);
        setEditModalVisible(true);
    };

    /**
     * Cerrar modal de editar optometrista
     */
    const handleCloseEditModal = () => {
        setEditModalVisible(false);
        setSelectedOptometristaForEdit(null);
    };

    /**
     * Manejar éxito al actualizar optometrista
     */
    const handleEditSuccess = (updatedOptometrista) => {
        // Actualizar la lista local usando la función del hook
        updateOptometrista(updatedOptometrista._id, updatedOptometrista);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Optometrista actualizado exitosamente');
    };

    /**
     * Manejar eliminación de optometrista
     */
    const handleDelete = (optometrista) => {
        Alert.alert(
            'Eliminar Optometrista',
            `¿Estás seguro de que deseas eliminar al Dr. ${optometrista.empleadoId?.nombre || 'N/A'} ${optometrista.empleadoId?.apellido || 'N/A'}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        handleCloseModal(); // Cerrar modal primero
                        const success = await deleteOptometrista(optometrista._id);
                        if (success) {
                            showSuccessMessage('Optometrista eliminado exitosamente');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Manejar cambio de disponibilidad del optometrista
     */
    const handleToggleDisponibilidad = async (optometrista) => {
        const nuevaDisponibilidad = optometrista.disponible === true ? false : true;
        const success = await updateOptometristaDisponibilidad(optometrista._id, nuevaDisponibilidad);
        if (success) {
            showSuccessMessage(`Optometrista ${nuevaDisponibilidad ? 'activado' : 'desactivado'} exitosamente`);
        }
    };

    /**
     * Renderizar item de optometrista
     */
    const renderOptometristaItem = ({ item, index }) => (
        <OptometristaItem
            optometrista={item}
            onViewMore={() => handleViewMore(item, index)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleDisponibilidad={handleToggleDisponibilidad}
        />
    );

    /**
     * Renderizar separador entre items
     */
    const renderSeparator = () => <View style={styles.separator} />;

    /**
     * Renderizar estado vacío
     */
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="eye-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay optometristas</Text>
            <Text style={styles.emptySubtitle}>
                {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Los optometristas aparecerán aquí cuando se registren empleados con ese puesto'}
            </Text>
        </View>
    );

    /**
     * Renderizar indicador de carga
     */
    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009BBF" />
            <Text style={styles.loadingText}>Cargando optometristas...</Text>
        </View>
    );

    // Obtener estadísticas
    const stats = getOptometristasStats();

    return (
        <View style={styles.container}>
            {/* Header con título, botón atrás */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Optometristas</Text>
                    <View style={styles.headerPlaceholder} />
                </View>
                
                <Text style={styles.headerSubtitle}>Gestiona todos los optometristas de la óptica</Text>
                
                {/* Estadísticas integradas en el header */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.disponibles}</Text>
                        <Text style={styles.statLabel}>Disponibles</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.noDisponibles}</Text>
                        <Text style={styles.statLabel}>No Disponibles</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.experienciaPromedio}</Text>
                        <Text style={styles.statLabel}>Experiencia Promedio</Text>
                    </View>
                </View>
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nombre, email, especialidad o licencia..."
                        placeholderTextColor="#999999"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#666666" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Filtros */}
            <OptometristasFilter
                selectedDisponibilidadFilter={selectedDisponibilidadFilter}
                selectedSucursalFilter={selectedSucursalFilter}
                onDisponibilidadFilterChange={setSelectedDisponibilidadFilter}
                onSucursalFilterChange={setSelectedSucursalFilter}
            />

            {/* Lista de optometristas */}
            <View style={styles.listContainer}>
                {loading ? (
                    renderLoadingState()
                ) : (
                    <FlatList
                        data={filteredOptometristas}
                        renderItem={renderOptometristaItem}
                        keyExtractor={(item) => item._id || item.id}
                        ItemSeparatorComponent={renderSeparator}
                        ListEmptyComponent={renderEmptyState}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#009BBF']}
                                tintColor="#009BBF"
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>

           {/* Modal de editar optometrista */}
            <EditOptometristaModal
                visible={editModalVisible}
                optometrista={selectedOptometristaForEdit}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
            />

              

            {/* Modal de detalle optometrista */}
            <OptometristaDetailModal
                visible={modalVisible}
                optometrista={selectedOptometrista}
                index={selectedIndex}
                onClose={handleCloseModal}
                onEdit={handleEdit}
            />
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#009BBF',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerPlaceholder: {
        width: 40, // Mismo ancho que el botón de atrás para centrar el título
    },
    headerSubtitle: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: 'Lato-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 14,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 4,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F8F9FA',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    separator: {
        height: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#999999',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 12,
    },
});

export default Optometristas;