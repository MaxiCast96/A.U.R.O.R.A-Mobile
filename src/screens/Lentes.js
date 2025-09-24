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
import { useLentes } from '../hooks/useLentes';
import LentesStatsCard from '../components/Lentes/LentesStatsCard';
import AddLenteModal from '../components/Lentes/AddLenteModal';
import EditLenteModal from '../components/Lentes/EditLenteModal';
import LenteDetailModal from '../components/Lentes/LenteDetailModal';

/**
 * Pantalla de Gestión de Lentes
 * 
 * Esta pantalla replica la funcionalidad del sitio web de escritorio
 * para gestionar lentes de la óptica, incluyendo:
 * - Estadísticas de lentes (total, en promoción, stock total, valor inventario)
 * - Búsqueda por nombre, marca, material, color, etc.
 * - Filtros por estado (todos, promoción, stock, tipo de lente)
 * - Lista de lentes con información completa
 * - Acciones para ver, editar y eliminar lentes
 * - Función para añadir nuevos lentes con modales
 * - CRUD completo funcional
 * 
 * Sigue el mismo diseño y colores del sitio web de escritorio
 * adaptado para dispositivos móviles.
 */
const Lentes = () => {
    const navigation = useNavigation();
    
    // Estado para el modal de editar
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedLenteForEdit, setSelectedLenteForEdit] = useState(null);
    
    const {
        // Estados de datos
        filteredLentes,
        loading,
        refreshing,
        
        // Estados de modal de detalle
        modalVisible,
        selectedLente,
        selectedIndex,
        
        // Estados de modal de agregar
        addModalVisible,
        
        // Estados de filtros
        searchText,
        selectedFilter,
        
        // Funciones de datos
        onRefresh,
        getLentesStats,
        
        // Funciones CRUD
        deleteLente,
        updateLente,
        
        // Funciones de modal de detalle
        handleViewMore,
        handleCloseModal,
        
        // Funciones de modal de agregar
        handleOpenAddModal,
        handleCloseAddModal,
        
        // Funciones de filtros
        setSearchText,
        setSelectedFilter,
        
        // Función para actualizar lista de lentes
        addLenteToList,
    } = useLentes();

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
     * Manejar edición de lente
     */
    const handleEdit = (lente) => {
        // Cerrar modal de detalle primero si está abierto
        if (modalVisible) {
            handleCloseModal();
        }
        
        // Abrir modal de editar con los datos del lente
        setSelectedLenteForEdit(lente);
        setEditModalVisible(true);
    };

    /**
     * Cerrar modal de editar lente
     */
    const handleCloseEditModal = () => {
        setEditModalVisible(false);
        setSelectedLenteForEdit(null);
    };

    /**
     * Manejar éxito al actualizar lente
     */
    const handleEditSuccess = (updatedLente) => {
        // Actualizar la lista local usando la función del hook
        updateLente(updatedLente._id, updatedLente);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Lente actualizado exitosamente');
    };

    /**
     * Manejar éxito al agregar lente
     */
    const handleAddSuccess = (newLente) => {
        // Actualizar la lista local cuando se crea un lente
        addLenteToList(newLente);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Lente creado exitosamente');
    };

    /**
     * Manejar eliminación de lente
     */
    const handleDelete = (lente) => {
        Alert.alert(
            'Eliminar Lente',
            `¿Estás seguro de que deseas eliminar "${lente.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        handleCloseModal(); // Cerrar modal primero
                        const success = await deleteLente(lente._id);
                        if (success) {
                            showSuccessMessage('Lente eliminado exitosamente');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Renderizar item de lente
     */
    const renderLenteItem = ({ item, index }) => (
        <LenteItem
            lente={item}
            onViewMore={() => handleViewMore(item, index)}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
            <Ionicons name="glasses-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay lentes</Text>
            <Text style={styles.emptySubtitle}>
                {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Añade tu primer lente para comenzar'}
            </Text>
            {!searchText && (
                <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
                    <Text style={styles.addButtonText}>Añadir Lente</Text>
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
            <Text style={styles.loadingText}>Cargando lentes...</Text>
        </View>
    );

    // Obtener estadísticas
    const stats = getLentesStats();

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
                    <Text style={styles.headerTitle}>Lentes</Text>
                    <TouchableOpacity 
                        style={styles.headerAddButton}
                        onPress={handleOpenAddModal}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.headerSubtitle}>Gestiona el inventario de lentes de la óptica</Text>
            </View>

            {/* Estadísticas */}
            <LentesStatsCard stats={stats} />

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar lentes..."
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
            <LentesFilter
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
            />

            {/* Lista de lentes */}
            <View style={styles.listContainer}>
                {loading ? (
                    renderLoadingState()
                ) : (
                    <FlatList
                        data={filteredLentes}
                        renderItem={renderLenteItem}
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

            {/* Modal para agregar lente */}
            <AddLenteModal
                visible={addModalVisible}
                onClose={handleCloseAddModal}
                onSuccess={handleAddSuccess}
            />

            {/* Modal para editar lente */}
            <EditLenteModal
                visible={editModalVisible}
                lente={selectedLenteForEdit}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
            />

            {/* Modal para ver detalles del lente */}
            <LenteDetailModal
                visible={modalVisible}
                lente={selectedLente}
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

export default Lentes;