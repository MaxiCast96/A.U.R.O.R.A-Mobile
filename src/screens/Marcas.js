import React, { useState, useCallback } from 'react';
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
        marcasStats
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
            if (result.success) {
                // La API devuelve el mensaje pero no la marca completa, así que creamos un objeto temporal
                const newMarca = {
                    _id: `temp_${Date.now()}`,
                    ...marcaData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                addMarcaToList(newMarca);
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
        updateMarcaInList(updatedMarca);
        showSuccessMessage('Marca actualizada exitosamente');
        handleCloseEditModal();
    };

    /**
     * Manejar eliminación de marca
     */
    const handleDelete = async (marca) => {
        if (!marca || !marca._id) {
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
        editMarcaHook.loadMarcaData(marca);
        handleCloseModal();
        handleOpenEditModal(marca);
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
        const updatedMarca = await editMarcaHook.updateMarca();
        if (updatedMarca) {
            handleEditSuccess(updatedMarca);
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
                editMarcaHook.loadMarcaData(item);
                handleOpenEditModal(item);
            }}
            onDelete={() => handleDelete(item)}
        />
    );

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

            {/* Barra de búsqueda y filtros */}
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

            <MarcasFilter
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
            />

            {/* Lista de marcas */}
            <View style={styles.listContainer}>
                {loading ? (
                    renderLoadingState()
                ) : (
                    <FlatList
                        data={filteredMarcas}
                        renderItem={renderMarcaItem}
                        keyExtractor={(item) => item._id || Math.random().toString()}
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
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
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
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
    },
    headerAddButton: {
        padding: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 8,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 8,
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#999999',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    addButton: {
        marginTop: 20,
        backgroundColor: '#009BBF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    addButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 12,
    },
});

export default Marcas;