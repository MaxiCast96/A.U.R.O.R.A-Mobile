// hooks/usePromociones.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const usePromociones = () => {
    const { getAuthHeaders } = useAuth();
    
    // Estados principales
    const [promociones, setPromociones] = useState([]);
    const [filteredPromociones, setFilteredPromociones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados de modales
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPromocion, setSelectedPromocion] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    
    // Estados de filtros
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todas');

    /**
     * Cargar promociones desde el servidor
     */
    const fetchPromociones = async () => {
        try {
            const response = await fetch('https://aurora-production-7e57.up.railway.app/api/promociones', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setPromociones(data);
                setFilteredPromociones(data);
            } else {
                throw new Error('Error al cargar promociones');
            }
        } catch (error) {
            console.error('Error fetching promociones:', error);
            Alert.alert('Error', 'No se pudieron cargar las promociones');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Cargar promociones al montar el componente
     */
    useEffect(() => {
        fetchPromociones();
    }, []);

    /**
     * Filtrar promociones cuando cambian los filtros
     */
    useEffect(() => {
        let filtered = promociones;

        // Filtrar por búsqueda
        if (searchText) {
            filtered = filtered.filter(promo => 
                promo.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
                promo.codigoPromo.toLowerCase().includes(searchText.toLowerCase()) ||
                promo.descripcion.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filtrar por estado
        if (selectedFilter !== 'todas') {
            filtered = filtered.filter(promo => {
                if (selectedFilter === 'activas') return promo.activo && promo.estaVigente?.();
                if (selectedFilter === 'inactivas') return !promo.activo;
                if (selectedFilter === 'expiradas') return !promo.estaVigente?.();
                return true;
            });
        }

        setFilteredPromociones(filtered);
    }, [searchText, selectedFilter, promociones]);

    /**
     * Actualizar lista al hacer pull-to-refresh
     */
    const onRefresh = () => {
        setRefreshing(true);
        fetchPromociones();
    };

    // Cambiamos a promocionesStats para claridad
    const promocionesStats = useMemo(() => {
        const total = promociones.length;
        const activas = promociones.filter(p => p.activo).length;
        const inactivas = total - activas;
        const porVencer = promociones.filter(p => {
            if (!p.activo) return false;
            const fechaFin = new Date(p.fechaFin);
            const hoy = new Date();
            const diferenciaDias = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
            return diferenciaDias <= 7 && diferenciaDias > 0;
        }).length;

        return {
            total,
            activas,
            inactivas,
            porVencer,
            porcentajeActivas: total ? Math.round((activas / total) * 100) : 0,
            porcentajeInactivas: total ? Math.round((inactivas / total) * 100) : 0,
            porcentajePorVencer: total ? Math.round((porVencer / total) * 100) : 0
        };
    }, [promociones]);

    /**
     * Manejar ver detalles de promoción
     */
    const handleViewMore = (promocion, index) => {
        setSelectedPromocion(promocion);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    /**
     * Cerrar modal de detalles
     */
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedPromocion(null);
    };

    /**
     * Abrir modal para agregar promoción
     */
    const handleOpenAddModal = () => {
        setAddModalVisible(true);
    };

    /**
     * Cerrar modal de agregar
     */
    const handleCloseAddModal = useCallback(() => {
        setAddModalVisible(false);
    }, []);

    /**
     * Abrir modal para editar promoción
     */
    const handleOpenEditModal = (promocion) => {
        setSelectedPromocion(promocion);
        setEditModalVisible(true);
    };

    /**
     * Cerrar modal de editar
     */
    const handleCloseEditModal = () => {
        setEditModalVisible(false);
        setSelectedPromocion(null);
    };

    /**
     * Agregar promoción a la lista local
     */
    const addPromocionToList = useCallback((newPromocion) => {
        setPromociones(prev => [newPromocion, ...prev]);
    }, []);

    /**
     * Actualizar promoción en la lista local
     */
    const updatePromocionInList = (updatedPromocion) => {
        setPromociones(prev => 
            prev.map(p => p._id === updatedPromocion._id ? updatedPromocion : p)
        );
    };

    /**
     * Eliminar promoción de la lista local
     */
    const removePromocionFromList = (id) => {
        setPromociones(prev => prev.filter(p => p._id !== id));
    };

    return {
        // Estados de datos
        promociones,
        filteredPromociones,
        loading,
        refreshing,
        
        // Estados de modales
        modalVisible,
        addModalVisible,
        editModalVisible,
        selectedPromocion,
        selectedIndex,
        
        // Estados de filtros
        searchText,
        selectedFilter,
        
        // Funciones de datos
        onRefresh,
        fetchPromociones,
        
        // Funciones de modales
        handleViewMore,
        handleCloseModal,
        handleOpenAddModal,
        handleCloseAddModal,
        handleOpenEditModal,
        handleCloseEditModal,
        
        // Funciones de filtros
        setSearchText,
        setSelectedFilter,
        
        // Funciones de gestión de lista
        addPromocionToList,
        updatePromocionInList,
        removePromocionFromList,

        // Estadísticas de promociones
        promocionesStats,
    };
};