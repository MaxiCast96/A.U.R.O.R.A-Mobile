// screens/Promociones.js (completamente corregido)
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList,
    ToastAndroid,
    Platform,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePromociones } from '../hooks/usePromociones';
import { usePromocionDetail } from '../hooks/usePromociones/usePromocionesDetail';
import AddPromocionModal from '../components/Promociones/AddPromocionModal';
import EditPromocionModal from '../components/Promociones/EditPromocionModal';
import PromocionDetailModal from '../components/Promociones/PromocionDetailModal';
import PromocionesStatsCard from '../components/Promociones/PromocionesStatsCard';
import PromocionesFilter from '../components/Promociones/PromocionesFilter';
import PromocionItem from '../components/Promociones/promocionItem';

const Promociones = () => {
    const navigation = useNavigation();
    
    // Hook principal
    const {
        filteredPromociones,
        loading,
        refreshing,
        modalVisible,
        addModalVisible,
        editModalVisible,
        selectedPromocion,
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
        addPromocionToList,
        updatePromocionInList,
        removePromocionFromList,
        promocionesStats
    } = usePromociones();

    // Hook para detalles
    const {
        loading: detailLoading,
        deletePromocion: deletePromocionAPI,
        updatePromocionEstado: updatePromocionEstadoAPI
    } = usePromocionDetail();

    /**
     * Mostrar notificación de éxito
     */
    const showSuccessMessage = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
            Alert.alert('Éxito', message, [{ text: 'Entendido', style: 'default' }]);
        }
    };

    /**
     * Manejar éxito al crear promoción
     */
    const handleAddSuccess = (newPromocion) => {
        addPromocionToList(newPromocion);
        showSuccessMessage('Promoción creada exitosamente');
        handleCloseAddModal();
    };

    /**
     * Manejar éxito al actualizar promoción
     */
    const handleEditSuccess = (updatedPromocion) => {
        updatePromocionInList(updatedPromocion);
        showSuccessMessage('Promoción actualizada exitosamente');
        handleCloseEditModal();
    };

    /**
     * Manejar eliminación de promoción
     */
    const handleDelete = async (promocion) => {
        Alert.alert(
            'Eliminar Promoción',
            `¿Estás seguro de que deseas eliminar la promoción "${promocion.nombre}"?`,
            [
                { 
                    text: 'Cancelar', 
                    style: 'cancel' 
                },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deletePromocionAPI(promocion._id);
                        if (success) {
                            removePromocionFromList(promocion._id);
                            showSuccessMessage('Promoción eliminada exitosamente');
                            // Cerrar modales si están abiertos
                            handleCloseModal();
                            handleCloseEditModal();
                        } else {
                            Alert.alert('Error', 'No se pudo eliminar la promoción');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Manejar cambio de estado
     */
    const handleToggleEstado = async (promocion) => {
        const nuevoEstado = !promocion.activo;
        Alert.alert(
            'Cambiar Estado',
            `¿Estás seguro de que deseas ${nuevoEstado ? 'activar' : 'desactivar'} la promoción "${promocion.nombre}"?`,
            [
                { 
                    text: 'Cancelar', 
                    style: 'cancel' 
                },
                { 
                    text: 'Confirmar', 
                    style: 'default',
                    onPress: async () => {
                        const success = await updatePromocionEstadoAPI(promocion._id, nuevoEstado);
                        if (success) {
                            // Actualizar en lista local
                            updatePromocionInList({ ...promocion, activo: nuevoEstado });
                            showSuccessMessage(`Promoción ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`);
                        } else {
                            Alert.alert('Error', 'No se pudo cambiar el estado de la promoción');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Manejar ver detalles desde el modal de detalles
     */
    const handleEditFromDetail = (promocion) => {
        handleCloseModal();
        handleOpenEditModal(promocion);
    };

    /**
     * Manejar eliminar desde el modal de detalles
     */
    const handleDeleteFromDetail = (promocion) => {
        handleCloseModal();
        handleDelete(promocion);
    };

    /**
     * Renderizar item de promoción
     */
    const renderPromocionItem = ({ item, index }) => (
        <PromocionItem
            promocion={item}
            onViewMore={() => handleViewMore(item, index)}
            onEdit={() => handleOpenEditModal(item)}
            onDelete={() => handleDelete(item)}
            onToggleEstado={() => handleToggleEstado(item)}
        />
    );

    /**
     * Renderizar estado vacío
     */
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay promociones</Text>
            <Text style={styles.emptySubtitle}>
                {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primera promoción para comenzar'}
            </Text>
            {!searchText && (
                <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
                    <Text style={styles.addButtonText}>Crear Promoción</Text>
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
            <Text style={styles.loadingText}>Cargando promociones...</Text>
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
                    <Text style={styles.headerTitle}>Promociones</Text>
                    <TouchableOpacity 
                        style={styles.headerAddButton}
                        onPress={handleOpenAddModal}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.headerSubtitle}>Gestiona las promociones de la óptica</Text>
                
                {/* Estadísticas */}
                <PromocionesStatsCard stats={promocionesStats} />
            </View>

            {/* Barra de búsqueda y filtros */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar promoción..."
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

            <PromocionesFilter
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
            />

            {/* Lista de promociones */}
            <View style={styles.listContainer}>
                {loading ? (
                    renderLoadingState()
                ) : (
                    <FlatList
                        data={filteredPromociones}
                        renderItem={renderPromocionItem}
                        keyExtractor={(item) => item._id}
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
            <AddPromocionModal
                visible={addModalVisible}
                onClose={handleCloseAddModal}
                onSubmit={handleAddSuccess}
            />

            <EditPromocionModal
                visible={editModalVisible}
                promocion={selectedPromocion}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
            />

            <PromocionDetailModal
                visible={modalVisible}
                promocion={selectedPromocion}
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

export default Promociones;