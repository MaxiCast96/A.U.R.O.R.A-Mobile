import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

const API_BASE_URL = 'https://aurora-production-7e57.up.railway.app/api/categoria';

export const useCategorias = () => {
    // Estados principales
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados de modales
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    /**
     * Cargar categorías desde el servidor
     */
    const fetchCategorias = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await fetch(API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error fetching categorias:', error);
            Alert.alert('Error', 'No se pudieron cargar las categorías');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Cargar categorías al montar el componente
     */
    useEffect(() => {
        fetchCategorias();
    }, []);

    /**
     * Actualizar lista al hacer pull-to-refresh
     */
    const onRefresh = useCallback(() => {
        fetchCategorias(true);
    }, []);

    /**
     * Manejar ver detalles de categoría
     */
    const handleViewMore = useCallback((categoria, index) => {
        setSelectedCategoria(categoria);
        setSelectedIndex(index);
        setModalVisible(true);
    }, []);

    /**
     * Cerrar modal de detalles
     */
    const handleCloseModal = useCallback(() => {
        setModalVisible(false);
        setSelectedCategoria(null);
    }, []);

    /**
     * Abrir modal para agregar categoría
     */
    const handleOpenAddModal = useCallback(() => {
        setAddModalVisible(true);
    }, []);

    /**
     * Cerrar modal de agregar
     */
    const handleCloseAddModal = useCallback(() => {
        setAddModalVisible(false);
    }, []);

    /**
     * Abrir modal para editar categoría
     */
    const handleOpenEditModal = useCallback((categoria) => {
        setSelectedCategoria(categoria);
        setEditModalVisible(true);
    }, []);

    /**
     * Cerrar modal de editar
     */
    const handleCloseEditModal = useCallback(() => {
        setEditModalVisible(false);
        setSelectedCategoria(null);
    }, []);

    /**
     * Agregar categoría a la lista local
     */
    const addCategoriaToList = useCallback((newCategoria) => {
        setCategorias(prev => [newCategoria, ...prev]);
    }, []);

    /**
     * Actualizar categoría en la lista local
     */
    const updateCategoriaInList = useCallback((updatedCategoria) => {
        setCategorias(prev => 
            prev.map(cat => cat._id === updatedCategoria._id ? updatedCategoria : cat)
        );
    }, []);

    /**
     * Eliminar categoría de la lista local
     */
    const removeCategoriaFromList = useCallback((id) => {
        setCategorias(prev => prev.filter(cat => cat._id !== id));
    }, []);

    // Estadísticas de categorías
    const categoriasStats = useMemo(() => {
        const total = categorias.length;
        const conIcono = categorias.filter(cat => cat.icono).length;
        const sinIcono = total - conIcono;

        return {
            total,
            conIcono,
            sinIcono,
            porcentajeConIcono: total ? Math.round((conIcono / total) * 100) : 0,
            porcentajeSinIcono: total ? Math.round((sinIcono / total) * 100) : 0,
        };
    }, [categorias]);

    return {
        // Estados de datos
        categorias,
        loading,
        refreshing,
        
        // Estados de modales
        modalVisible,
        addModalVisible,
        editModalVisible,
        selectedCategoria,
        selectedIndex,
        
        // Funciones de datos
        onRefresh,
        fetchCategorias,
        
        // Funciones de modales
        handleViewMore,
        handleCloseModal,
        handleOpenAddModal,
        handleCloseAddModal,
        handleOpenEditModal,
        handleCloseEditModal,
        
        // Funciones de gestión de lista
        addCategoriaToList,
        updateCategoriaInList,
        removeCategoriaFromList,

        // Estadísticas de categorías
        categoriasStats,
    };
};