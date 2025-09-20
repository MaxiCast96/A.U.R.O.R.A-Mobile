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
import { useClientes } from '../hooks/useClientes';
import ClientesStatsCard from '../components/Clientes/ClientesStatsCard';
import ClientesFilter from '../components/Clientes/ClientesFilter';
import ClienteItem from '../components/Clientes/ClienteItem';
import AddClienteModal from '../components/Clientes/AddClienteModal';
import EditClienteModal from '../components/Clientes/EditClienteModal';
import ClienteDetailModal from '../components/Clientes/ClienteDetailModal';

/**
 * Pantalla de Gestión de Clientes
 * 
 * Esta pantalla replica la funcionalidad del sitio web de escritorio
 * para gestionar clientes de la óptica, incluyendo:
 * - Estadísticas de clientes (total, activos, inactivos)
 * - Búsqueda por nombre, DUI, email o teléfono
 * - Filtros por estado (todos, activos, inactivos)
 * - Lista de clientes con información completa
 * - Acciones para ver, editar y eliminar clientes
 * - Función para añadir nuevos clientes con modales
 * - CRUD completo funcional
 * 
 * Sigue el mismo diseño y colores del sitio web de escritorio
 * adaptado para dispositivos móviles.
 */
const Clientes = () => {
    const navigation = useNavigation();
    
    // Estado para el modal de editar
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedClienteForEdit, setSelectedClienteForEdit] = useState(null);
    
    const {
        // Estados de datos
        filteredClientes,
        loading,
        refreshing,
        
        // Estados de modal de detalle
        modalVisible,
        selectedCliente,
        selectedIndex,
        
        // Estados de modal de agregar
        addModalVisible,
        
        // Estados de filtros
        searchText,
        selectedFilter,
        
        // Funciones de datos
        onRefresh,
        getClientesStats,
        
        // Funciones CRUD
        deleteCliente,
        updateClienteEstado,
        updateCliente,
        
        // Funciones de modal de detalle
        handleViewMore,
        handleCloseModal,
        
        // Funciones de modal de agregar
        handleOpenAddModal,
        handleCloseAddModal,
        
        // Funciones de filtros
        setSearchText,
        setSelectedFilter,
        
        // Función para actualizar lista de clientes
        addClienteToList,
    } = useClientes();

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
     * Manejar edición de cliente
     */
    const handleEdit = (cliente) => {
        // Cerrar modal de detalle primero si está abierto
        if (modalVisible) {
            handleCloseModal();
        }
        
        // Abrir modal de editar con los datos del cliente
        setSelectedClienteForEdit(cliente);
        setEditModalVisible(true);
    };

    /**
     * Cerrar modal de editar cliente
     */
    const handleCloseEditModal = () => {
        setEditModalVisible(false);
        setSelectedClienteForEdit(null);
    };

    /**
     * Manejar éxito al actualizar cliente
     */
    const handleEditSuccess = (updatedCliente) => {
        // Actualizar la lista local usando la función del hook
        updateCliente(updatedCliente._id, updatedCliente);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Cliente actualizado exitosamente');
    };

    /**
     * Manejar éxito al agregar cliente
     */
    const handleAddSuccess = (newCliente) => {
        // Actualizar la lista local cuando se crea un cliente
        addClienteToList(newCliente);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Cliente creado exitosamente');
    };

    /**
     * Manejar eliminación de cliente
     */
    const handleDelete = (cliente) => {
        Alert.alert(
            'Eliminar Cliente',
            `¿Estás seguro de que deseas eliminar a ${cliente.nombre} ${cliente.apellido}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        handleCloseModal(); // Cerrar modal primero
                        const success = await deleteCliente(cliente._id);
                        if (success) {
                            showSuccessMessage('Cliente eliminado exitosamente');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Manejar cambio de estado del cliente
     */
    const handleToggleEstado = async (cliente) => {
        const nuevoEstado = cliente.estado?.toLowerCase() === 'activo' ? 'inactivo' : 'activo';
        const success = await updateClienteEstado(cliente._id, nuevoEstado);
        if (success) {
            showSuccessMessage(`Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
        }
    };

    /**
     * Renderizar item de cliente
     */
    const renderClienteItem = ({ item, index }) => (
        <ClienteItem
            cliente={item}
            onViewMore={() => handleViewMore(item, index)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleEstado={handleToggleEstado}
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
            <Ionicons name="people-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay clientes</Text>
            <Text style={styles.emptySubtitle}>
                {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Añade tu primer cliente para comenzar'}
            </Text>
            {!searchText && (
                <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
                    <Text style={styles.addButtonText}>Añadir Cliente</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    /**
     * Renderizar indicador de carga
     */
    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009BBF" />
            <Text style={styles.loadingText}>Cargando clientes...</Text>
        </View>
    );

    // Obtener estadísticas
    const stats = getClientesStats();

    return (
        <View style={styles.container}>
            {/* Header con título, botón atrás y botón añadir */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Clientes</Text>
                    <TouchableOpacity 
                        style={styles.headerAddButton}
                        onPress={handleOpenAddModal}
                    >
                        <Ionicons name="person-add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.headerSubtitle}>Gestiona todos los clientes de la óptica</Text>
                
                {/* Estadísticas integradas en el header */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.activos}</Text>
                        <Text style={styles.statLabel}>Activos</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.inactivos}</Text>
                        <Text style={styles.statLabel}>Inactivos</Text>
                    </View>
                </View>
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar cliente..."
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
            <ClientesFilter
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
            />

            {/* Lista de clientes */}
            <View style={styles.listContainer}>
                {loading ? (
                    renderLoadingState()
                ) : (
                    <FlatList
                        data={filteredClientes}
                        renderItem={renderClienteItem}
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

            {/* Modal para agregar cliente */}
            <AddClienteModal
                visible={addModalVisible}
                onClose={handleCloseAddModal}
                onSuccess={handleAddSuccess}
            />

            {/* Modal para editar cliente */}
            <EditClienteModal
                visible={editModalVisible}
                cliente={selectedClienteForEdit}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
            />

            {/* Modal para ver detalles del cliente */}
            <ClienteDetailModal
                visible={modalVisible}
                cliente={selectedCliente}
                index={selectedIndex}
                onClose={handleCloseModal}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
    headerAddButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: 28,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 16,
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
        height: 1,
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
    addButton: {
        backgroundColor: '#009BBF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    addButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
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

export default Clientes;