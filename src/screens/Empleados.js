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
import { useEmpleados } from '../hooks/useEmpleados';
import EmpleadosFilter from '../components/Empleados/EmpleadosFilter';
import EmpleadoItem from '../components/Empleados/EmpleadoItem';
import AddEmpleadoModal from '../components/Empleados/AddEmpleadoModal';
import EditEmpleadoModal from '../components/Empleados/EditEmpleadoModal';
import EmpleadoDetailModal from '../components/Empleados/EmpleadoDetailModal';


/**
 * Pantalla de Gestión de Empleados
 * 
 * Esta pantalla replica la funcionalidad del sitio web de escritorio
 * para gestionar empleados de la óptica, incluyendo:
 * - Estadísticas de empleados (total, activos, inactivos, nómina)
 * - Búsqueda por nombre, DUI, email, teléfono o cargo
 * - Filtros por estado (todos, activos, inactivos)
 * - Filtros por sucursal (todas, centro, escalón, etc.)
 * - Lista de empleados con información completa
 * - Acciones para ver, editar y eliminar empleados
 * - Función para añadir nuevos empleados con modales
 * - CRUD completo funcional
 * 
 * Sigue el mismo diseño y colores del sitio web de escritorio
 * adaptado para dispositivos móviles.
 */
const Empleados = () => {
    const navigation = useNavigation();
    
    // Estado para el modal de editar
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedEmpleadoForEdit, setSelectedEmpleadoForEdit] = useState(null);
    
    const {
        // Estados de datos
        filteredEmpleados,
        loading,
        refreshing,
        
        // Estados de modal de detalle
        modalVisible,
        selectedEmpleado,
        selectedIndex,
        
        // Estados de modal de agregar
        addModalVisible,
        
        // Estados de filtros
        searchText,
        selectedEstadoFilter,
        selectedSucursalFilter,
        
        // Funciones de datos
        onRefresh,
        getEmpleadosStats,
        
        // Funciones CRUD
        deleteEmpleado,
        updateEmpleadoEstado,
        updateEmpleado,
        
        // Funciones de modal de detalle
        handleViewMore,
        handleCloseModal,
        
        // Funciones de modal de agregar
        handleOpenAddModal,
        handleCloseAddModal,
        
        // Funciones de filtros
        setSearchText,
        setSelectedEstadoFilter,
        setSelectedSucursalFilter,
        
        // Función para actualizar lista de empleados
        addEmpleadoToList,
    } = useEmpleados();

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
     * Manejar edición de empleado
     */
    const handleEdit = (empleado) => {
        // Cerrar modal de detalle primero si está abierto
        if (modalVisible) {
            handleCloseModal();
        }
        
        // Abrir modal de editar con los datos del empleado
        setSelectedEmpleadoForEdit(empleado);
        setEditModalVisible(true);
    };

    /**
     * Cerrar modal de editar empleado
     */
    const handleCloseEditModal = () => {
        setEditModalVisible(false);
        setSelectedEmpleadoForEdit(null);
    };

    /**
     * Manejar éxito al actualizar empleado
     */
    const handleEditSuccess = (updatedEmpleado) => {
        // Actualizar la lista local usando la función del hook
        updateEmpleado(updatedEmpleado._id, updatedEmpleado);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Empleado actualizado exitosamente');
    };

    /**
     * Manejar éxito al agregar empleado
     */
    const handleAddSuccess = (newEmpleado) => {
        // Actualizar la lista local cuando se crea un empleado
        addEmpleadoToList(newEmpleado);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Empleado creado exitosamente');
    };

    /**
     * Manejar eliminación de empleado
     */
    const handleDelete = (empleado) => {
        Alert.alert(
            'Eliminar Empleado',
            `¿Estás seguro de que deseas eliminar a ${empleado.nombre} ${empleado.apellido}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        handleCloseModal(); // Cerrar modal primero
                        const success = await deleteEmpleado(empleado._id);
                        if (success) {
                            showSuccessMessage('Empleado eliminado exitosamente');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Manejar cambio de estado del empleado
     */
    const handleToggleEstado = async (empleado) => {
        const nuevoEstado = empleado.estado?.toLowerCase() === 'activo' ? 'Inactivo' : 'Activo';
        const success = await updateEmpleadoEstado(empleado._id, nuevoEstado);
        if (success) {
            showSuccessMessage(`Empleado ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} exitosamente`);
        }
    };

    /**
     * Renderizar item de empleado
     */
    const renderEmpleadoItem = ({ item, index }) => (
        <EmpleadoItem
            empleado={item}
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
            <Text style={styles.emptyTitle}>No hay empleados</Text>
            <Text style={styles.emptySubtitle}>
                {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Añade tu primer empleado para comenzar'}
            </Text>
            {!searchText && (
                <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
                    <Text style={styles.addButtonText}>Añadir Empleado</Text>
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
            <Text style={styles.loadingText}>Cargando empleados...</Text>
        </View>
    );

    // Obtener estadísticas
    const stats = getEmpleadosStats();

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
                    <Text style={styles.headerTitle}>Empleados</Text>
                    <TouchableOpacity 
                        style={styles.headerAddButton}
                        onPress={handleOpenAddModal}
                    >
                        <Ionicons name="person-add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.headerSubtitle}>Gestiona todos los empleados de la óptica</Text>
                
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
                        <Text style={styles.statNumber}>{stats.sucursales}</Text>
                        <Text style={styles.statLabel}>Sucursales</Text>
                    </View>
                </View>
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nombre, DUI, email o cargo..."
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
                
                {/* Nómina total discreta */}
                <View style={styles.nominaDiscreta}>
                    <Text style={styles.nominaDiscreteLabel}>Nómina Total: </Text>
                    <Text style={styles.nominaDiscreteValue}>${stats.nominaTotal.toFixed(2)}</Text>
                </View>
            </View>

            {/* Filtros */}
            <EmpleadosFilter
                selectedEstadoFilter={selectedEstadoFilter}
                selectedSucursalFilter={selectedSucursalFilter}
                onEstadoFilterChange={setSelectedEstadoFilter}
                onSucursalFilterChange={setSelectedSucursalFilter}
            />

            {/* Lista de empleados */}
            <View style={styles.listContainer}>
                {loading ? (
                    renderLoadingState()
                ) : (
                    <FlatList
                        data={filteredEmpleados}
                        renderItem={renderEmpleadoItem}
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

            {/* Modal de agregar empleado */}
            <AddEmpleadoModal
                visible={addModalVisible}
                onClose={handleCloseAddModal}
                onSuccess={handleAddSuccess}
            />

            {/* Modal de editar empleado */}
            <EditEmpleadoModal
                visible={editModalVisible}
                empleado={selectedEmpleadoForEdit}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
            />

            {/* Modal de detalle empleado */}
            <EmpleadoDetailModal
                visible={modalVisible}
                empleado={selectedEmpleado}
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
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 8,
    },
    nominaContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginTop: 12,
        alignItems: 'center',
    },
    nominaLabel: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    nominaValue: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    searchContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
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
        marginRight: 19,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    nominaDiscreta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    nominaDiscreteLabel: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    nominaDiscreteValue: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    separator: {
        height: 6,
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

export default Empleados;