import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList,
    ToastAndroid,
    Platform,
    RefreshControl
} from 'react-native';
import { ArrowLeft, Plus, Cube } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCategorias } from '../hooks/useCategorias';
import { useCategoriaDetail } from '../hooks/useCategorias/useCategoriaDetail';
import { useAddCategoria } from '../hooks/useCategorias/useAddCategoria';
import AddCategoriaModal from '../components/Categorias/AddCategoriaModal';
import EditCategoriaModal from '../components/Categorias/EditCategoriaModal';
import CategoriaDetailModal from '../components/Categorias/CategoriaDetailModal';
import CategoriaItem from '../components/Categorias/CategoriaItem';

const Categoria = () => {
    const navigation = useNavigation();
    
    // Hook principal
    const {
        categorias,
        loading,
        refreshing,
        modalVisible,
        addModalVisible,
        editModalVisible,
        selectedCategoria,
        selectedIndex,
        onRefresh,
        handleViewMore,
        handleCloseModal,
        handleOpenAddModal,
        handleCloseAddModal,
        handleOpenEditModal,
        handleCloseEditModal,
        addCategoriaToList,
        updateCategoriaInList,
        removeCategoriaFromList,
        categoriasStats
    } = useCategorias();

    // Hooks específicos
    const { addCategoria, loading: addLoading } = useAddCategoria();
    const { loading: detailLoading, deleteCategoria: deleteCategoriaAPI } = useCategoriaDetail();

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
     * Manejar éxito al crear categoría
     */
    const handleAddSuccess = async (categoriaData) => {
        const result = await addCategoria(categoriaData);
        if (result.success) {
            addCategoriaToList(result.data);
            showSuccessMessage('Categoría creada exitosamente');
            handleCloseAddModal();
        } else {
            Alert.alert('Error', result.error);
        }
    };

    /**
     * Manejar éxito al actualizar categoría
     */
    const handleEditSuccess = (updatedCategoria) => {
        updateCategoriaInList(updatedCategoria);
        showSuccessMessage('Categoría actualizada exitosamente');
        handleCloseEditModal();
    };

    /**
     * Manejar eliminación de categoría
     */
    const handleDelete = async (categoria) => {
        Alert.alert(
            'Eliminar Categoría',
            `¿Estás seguro de que deseas eliminar la categoría "${categoria.nombre}"?`,
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
                            await deleteCategoriaAPI(categoria._id);
                            removeCategoriaFromList(categoria._id);
                            showSuccessMessage('Categoría eliminada exitosamente');
                            // Cerrar modales si están abiertos
                            handleCloseModal();
                            handleCloseEditModal();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar la categoría');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Manejar editar desde el modal de detalles
     */
    const handleEditFromDetail = (categoria) => {
        handleCloseModal();
        handleOpenEditModal(categoria);
    };

    /**
     * Manejar eliminar desde el modal de detalles
     */
    const handleDeleteFromDetail = (categoria) => {
        handleCloseModal();
        handleDelete(categoria);
    };

    /**
     * Renderizar item de categoría
     */
    const renderCategoriaItem = ({ item, index }) => (
        <CategoriaItem
            categoria={item}
            onViewMore={() => handleViewMore(item, index)}
            onEdit={() => handleOpenEditModal(item)}
            onDelete={() => handleDelete(item)}
        />
    );

    /**
     * Renderizar estado vacío
     */
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Cube size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay categorías</Text>
            <Text style={styles.emptySubtitle}>
                Crea tu primera categoría para organizar tus productos
            </Text>
            {!addLoading && (
                <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
                    <Text style={styles.addButtonText}>Crear Categoría</Text>
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
            <Text style={styles.loadingText}>Cargando categorías...</Text>
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
                        <ArrowLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Categorías</Text>
                    <TouchableOpacity 
                        style={styles.headerAddButton}
                        onPress={handleOpenAddModal}
                    >
                        <Plus size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.headerSubtitle}>Gestiona las categorías de productos</Text>
                
                {/* Estadísticas */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Text style={styles.statTitle}>Total Categorías</Text>
                            <View style={[styles.iconContainer, { backgroundColor: '#009BBF15' }]}>
                                <Cube size={20} color="#009BBF" />
                            </View>
                        </View>
                        <Text style={[styles.statValue, { color: '#009BBF' }]}>
                            {categoriasStats.total}
                        </Text>
                    </View>
                    
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Text style={styles.statTitle}>Con Icono</Text>
                            <View style={[styles.iconContainer, { backgroundColor: '#49AA4C15' }]}>
                                <Cube size={20} color="#49AA4C" />
                            </View>
                        </View>
                        <Text style={[styles.statValue, { color: '#49AA4C' }]}>
                            {categoriasStats.conIcono}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Lista de categorías */}
            <View style={styles.listContainer}>
                {loading ? (
                    renderLoadingState()
                ) : (
                    <FlatList
                        data={categorias}
                        renderItem={renderCategoriaItem}
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
            <AddCategoriaModal
                visible={addModalVisible}
                onClose={handleCloseAddModal}
                onSubmit={handleAddSuccess}
            />

            <EditCategoriaModal
                visible={editModalVisible}
                categoria={selectedCategoria}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
            />

            <CategoriaDetailModal
                visible={modalVisible}
                categoria={selectedCategoria}
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
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statTitle: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        flex: 1,
        lineHeight: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    statValue: {
        fontSize: 28,
        fontFamily: 'Lato-Bold',
        lineHeight: 32,
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

export default Categoria;