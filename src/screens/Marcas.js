import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Hooks
import { useMarcas } from '../hooks/useMarcas';
import { useMarcaDetail } from '../hooks/useMarcas/useMarcasDetail';
import { useAddMarca } from '../hooks/useMarcas/useAddMarcas';
import { useEditMarca } from '../hooks/useMarcas/useEditMarcas';

// Componentes
import AddMarcaModal from '../components/Marcas/AddMarcaModal';
import EditMarcaModal from '../components/Marcas/EditMarcaModal';
import MarcaDetailModal from '../components/Marcas/MarcaDetailModal';
import MarcasStatsCard from '../components/Marcas/MarcasStatsCard';
import MarcasFilter from '../components/Marcas/MarcasFilter';
import MarcaItem from '../components/Marcas/MarcaItem';

const Marcas = () => {
    const navigation = useNavigation();
    
    // Hook principal
    const {
        filteredMarcas,
        loading,
        refreshing,
        modalVisible,
        addModalVisible,
        editModalVisible,
        selectedMarca,
        selectedIndex,
        searchText,
        selectedFilter,
        onRefresh,
        handleViewMore,
        handleCloseModal,
        handleOpenAddModal,
        handleCloseAddModal,
        handleOpenEditModal,
        handleCloseEditModal,
        setSearchText,
        setSelectedFilter,
        addMarcaToList,
        updateMarcaInList,
        removeMarcaFromList,
        marcasStats,
        isValidMongoId,
        getAuthHeaders
    } = useMarcas();

    // Hook para detalles
    const {
        loading: detailLoading,
        deleteMarca: deleteMarcaAPI
    } = useMarcaDetail();

    // Hook para editar
    const editMarcaHook = useEditMarca();

    // Hook para agregar
    const {
        addMarca: addMarcaAPI,
        loading: addLoading,
        error: addError
    } = useAddMarca();

    /**
     * Verificar conexión con el backend
     */
    const testBackendConnection = async () => {
        try {
            console.log('Probando conexión con el backend...');
            const response = await fetch('https://aurora-production-7e57.up.railway.app/api/marcas', {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            console.log('Test connection status:', response.status);
            return response.ok;
        } catch (error) {
            console.error('Test connection failed:', error);
            return false;
        }
    };

    // Probar conexión al cargar el componente
    useEffect(() => {
        testBackendConnection();
    }, []);

    /**
     * Mostrar notificación de éxito
     */
    const showSuccessMessage = (message) => {
        Alert.alert('Éxito', message, [{ text: 'OK', style: 'default' }]);
    };

    /**
     * Manejar éxito al crear marca
     */
    const handleAddSuccess = async (marcaData) => {
        try {
            const result = await addMarcaAPI(marcaData);
            if (result.success && result.data) {
                // Usar la marca completa que devuelve el backend con el _id real
                addMarcaToList(result.data);
                showSuccessMessage('Marca creada exitosamente');
                handleCloseAddModal();
            } else {
                Alert.alert('Error', result.error || 'No se pudo crear la marca');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la marca');
        }
    };

    /**
     * Manejar éxito al actualizar marca
     */
    const handleEditSuccess = (updatedMarca) => {
        console.log('handleEditSuccess llamado con:', updatedMarca);
        
        if (updatedMarca && updatedMarca._id) {
            if (isValidMongoId(updatedMarca._id)) {
                console.log('ID válido, actualizando lista...');
                updateMarcaInList(updatedMarca);
                showSuccessMessage('Marca actualizada exitosamente');
                handleCloseEditModal();
            } else {
                console.error('ID inválido en marca actualizada:', updatedMarca._id);
                Alert.alert('Error', 'No se pudo actualizar la marca: ID inválido');
            }
        } else {
            console.error('Marca actualizada undefined o sin ID:', updatedMarca);
            Alert.alert('Error', 'No se pudo actualizar la marca: datos incompletos');
        }
    };

    /**
     * Manejar eliminación de marca
     */
    const handleDelete = async (marca) => {
        if (!marca || !marca._id || !isValidMongoId(marca._id)) {
            Alert.alert('Error', 'ID de marca no válido');
            return;
        }

        Alert.alert(
            'Eliminar Marca',
            `¿Estás seguro de que deseas eliminar la marca "${marca.nombre}"?`,
            [
                { 
                    text: 'Cancelar', 
                    style: 'cancel' 
                },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await deleteMarcaAPI(marca._id);
                            if (success) {
                                removeMarcaFromList(marca._id);
                                showSuccessMessage('Marca eliminada exitosamente');
                                handleCloseModal();
                                handleCloseEditModal();
                            }
                        } catch (error) {
                            console.error('Error deleting marca:', error);
                            Alert.alert('Error', 'No se pudo eliminar la marca: ' + error.message);
                        }
                    }
                }
            ]
        );
    };

    /**
     * Manejar edición desde el modal de detalles
     */
    const handleEditFromDetail = (marca) => {
        if (marca && isValidMongoId(marca._id)) {
            editMarcaHook.loadMarcaData(marca);
            handleCloseModal();
            handleOpenEditModal(marca);
        } else {
            Alert.alert('Error', 'No se puede editar una marca temporal');
        }
    };

    /**
     * Manejar eliminar desde el modal de detalles
     */
    const handleDeleteFromDetail = (marca) => {
        handleCloseModal();
        handleDelete(marca);
    };

    /**
     * Manejar guardar edición
     */
    const handleSaveEdit = async () => {
        console.log('Iniciando actualización de marca...');

        // Primero verificar conexión
        const isConnected = await testBackendConnection();
        if (!isConnected) {
            Alert.alert('Error de conexión', 'No se puede conectar al servidor. Verifica tu internet y que el backend esté funcionando.');
            return;
        }

        try {
            const updatedMarca = await editMarcaHook.updateMarca();
            console.log('Resultado de updateMarca:', updatedMarca);
            
            if (updatedMarca && updatedMarca._id) {
                handleEditSuccess(updatedMarca);
            } else if (updatedMarca === null) {
                // updateMarca ya mostró un Alert de error
                console.log('Update fue cancelado o falló');
            } else {
                console.error('Marca actualizada sin ID:', updatedMarca);
                Alert.alert('Error', 'No se pudo actualizar la marca: respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('Error en handleSaveEdit:', error);
            Alert.alert('Error', 'Ocurrió un error inesperado al actualizar la marca');
        }
    };

    /**
     * Renderizar item de marca
     */
    const renderMarcaItem = ({ item, index }) => (
        <MarcaItem
            marca={item}
            onViewMore={() => handleViewMore(item, index)}
            onEdit={() => {
                if (item && isValidMongoId(item._id)) {
                    editMarcaHook.loadMarcaData(item);
                    handleOpenEditModal(item);
                } else {
                    Alert.alert('Error', 'No se puede editar una marca temporal');
                }
            }}
            onDelete={() => handleDelete(item)}
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
            <Ionicons name="business-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay marcas</Text>
            <Text style={styles.emptySubtitle}>
                {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Agrega tu primera marca para comenzar'}
            </Text>
            {!searchText && (
                <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
                    <Text style={styles.addButtonText}>Agregar Marca</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    /**
     * Renderizar carga
     */
    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009BBF" />
            <Text style={styles.loadingText}>Cargando marcas...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Marcas</Text>
                    <TouchableOpacity 
                        style={styles.headerAddButton}
                        onPress={handleOpenAddModal}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.headerSubtitle}>Gestiona las marcas de la óptica</Text>
                
                {/* Estadísticas */}
                <MarcasStatsCard stats={marcasStats} />
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar marca..."
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
            <View style={styles.filtersContainer}>
                <MarcasFilter
                    selectedFilter={selectedFilter}
                    onFilterChange={setSelectedFilter}
                />
            </View>

            {/* Lista de marcas */}
            <View style={styles.listContainer}>
                {loading ? (
                    renderLoadingState()
                ) : (
                    <FlatList
                        data={filteredMarcas}
                        renderItem={renderMarcaItem}
                        keyExtractor={(item) => {
                            // Si es una marca temporal, usar un key único basado en timestamp
                            if (item._id && item._id.toString().startsWith('temp_')) {
                                return item._id;
                            }
                            // Si es una marca real, usar el _id normal
                            return item._id || Math.random().toString();
                        }}
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

            {/* Modales */}
            <AddMarcaModal
                visible={addModalVisible}
                onClose={handleCloseAddModal}
                onAdd={handleAddSuccess}
            />

            <EditMarcaModal
                visible={editModalVisible}
                onClose={handleCloseEditModal}
                onSave={handleSaveEdit}
                editHook={editMarcaHook}
            />

            <MarcaDetailModal
                visible={modalVisible}
                marca={selectedMarca}
                index={selectedIndex}
                onClose={handleCloseModal}
                onEdit={handleEditFromDetail}
                onDelete={handleDeleteFromDetail}
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
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    filtersContainer: {
        backgroundColor: '#F8F9FA',
        paddingBottom: 8,
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
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },
    addButton: {
        marginTop: 20,
        backgroundColor: '#009BBF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
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

export default Marcas;