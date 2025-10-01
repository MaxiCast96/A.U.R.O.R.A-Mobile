import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Alert, AppState } from 'react-native';

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

    // Ref para manejar el estado de la app
    const appState = useRef(AppState.currentState);

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
     * Actualizar automáticamente cuando la app vuelve al primer plano
     */
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // La app volvió al primer plano, actualizar datos
                fetchCategorias(true);
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription?.remove();
        };
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
     * Agregar categoría a la lista local (actualización optimista)
     */
    const addCategoriaToList = useCallback((newCategoria) => {
        setCategorias(prev => {
            // Evitar duplicados
            const exists = prev.some(cat => cat._id === newCategoria._id);
            if (exists) {
                return prev.map(cat => cat._id === newCategoria._id ? newCategoria : cat);
            }
            return [newCategoria, ...prev];
        });
    }, []);

    /**
     * Actualizar categoría en la lista local (actualización optimista)
     */
    const updateCategoriaInList = useCallback((updatedCategoria) => {
        setCategorias(prev => {
            const updated = prev.map(cat => 
                cat._id === updatedCategoria._id ? updatedCategoria : cat
            );
            
            // Si no existe, agregarlo
            if (!prev.some(cat => cat._id === updatedCategoria._id)) {
                return [updatedCategoria, ...prev];
            }
            
            return updated;
        });
        
        // Actualizar también la categoría seleccionada si está abierta
        if (selectedCategoria?._id === updatedCategoria._id) {
            setSelectedCategoria(updatedCategoria);
        }
    }, [selectedCategoria]);

    /**
     * Eliminar categoría de la lista local (actualización optimista)
     */
    const removeCategoriaFromList = useCallback((id) => {
        setCategorias(prev => prev.filter(cat => cat._id !== id));
    }, []);

    // Estadísticas de categorías
    const categoriasStats = useMemo(() => {
        const total = categorias.length;
        const conIcono = categorias.filter(cat => cat.icono && cat.icono !== '').length;
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