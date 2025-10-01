// hooks/useMarcas.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que esta ruta sea correcta

export const useMarcas = () => {
    const { getAuthHeaders } = useAuth(); // Usar el hook useAuth aquí
    
    // Estados principales
    const [marcas, setMarcas] = useState([]);
    const [filteredMarcas, setFilteredMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados de modales
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMarca, setSelectedMarca] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    
    // Estados de filtros
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todas');

    // Función auxiliar para validar IDs
    const isValidMongoId = (id) => {
        if (!id) return false;
        // Verificar que no sea un ID temporal
        if (typeof id === 'string' && id.startsWith('temp_')) {
            return false;
        }
        // Verificar formato básico de ObjectId (24 caracteres hex)
        if (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
            return true;
        }
        return false;
    };

    /**
     * Cargar marcas desde el servidor
     */
    const fetchMarcas = async () => {
        try {
            const response = await fetch('https://aurora-production-7e57.up.railway.app/api/marcas', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setMarcas(data);
                setFilteredMarcas(data);
            } else {
                throw new Error('Error al cargar marcas');
            }
        } catch (error) {
            console.error('Error fetching marcas:', error);
            Alert.alert('Error', 'No se pudieron cargar las marcas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Cargar marcas al montar el componente
     */
    useEffect(() => {
        fetchMarcas();
    }, []);

    /**
     * Filtrar marcas cuando cambian los filtros
     */
    useEffect(() => {
        let filtered = marcas;

        // Filtrar por búsqueda
        if (searchText) {
            filtered = filtered.filter(marca => 
                marca.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
                marca.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ||
                marca.paisOrigen?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filtrar por línea
        if (selectedFilter !== 'todas') {
            filtered = filtered.filter(marca => 
                marca.lineas?.includes(selectedFilter)
            );
        }

        setFilteredMarcas(filtered);
    }, [searchText, selectedFilter, marcas]);

    /**
     * Actualizar lista al hacer pull-to-refresh
     */
    const onRefresh = () => {
        setRefreshing(true);
        fetchMarcas();
    };

    // Estadísticas de marcas
    const marcasStats = useMemo(() => {
        const total = marcas.length;
        const premium = marcas.filter(m => m.lineas?.includes('Premium')).length;
        const economicas = marcas.filter(m => m.lineas?.includes('Económica')).length;
        const mixtas = marcas.filter(m => 
            m.lineas?.includes('Premium') && m.lineas?.includes('Económica')
        ).length;

        return {
            total,
            premium,
            economicas,
            mixtas,
            porcentajePremium: total ? Math.round((premium / total) * 100) : 0,
            porcentajeEconomicas: total ? Math.round((economicas / total) * 100) : 0,
            porcentajeMixtas: total ? Math.round((mixtas / total) * 100) : 0
        };
    }, [marcas]);

    /**
     * Manejar ver detalles de marca
     */
    const handleViewMore = (marca, index) => {
        setSelectedMarca(marca);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    /**
     * Cerrar modal de detalles
     */
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedMarca(null);
    };

    /**
     * Abrir modal para agregar marca
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
     * Abrir modal para editar marca
     */
    const handleOpenEditModal = (marca) => {
        setSelectedMarca(marca);
        setEditModalVisible(true);
    };

    /**
     * Cerrar modal de editar
     */
    const handleCloseEditModal = () => {
        setEditModalVisible(false);
        setSelectedMarca(null);
    };

    /**
     * Agregar marca a la lista local
     */
    const addMarcaToList = useCallback((newMarca) => {
        setMarcas(prev => [newMarca, ...prev]);
    }, []);

    /**
     * Actualizar marca en la lista local
     */
    const updateMarcaInList = (updatedMarca) => {
        if (!updatedMarca || !updatedMarca._id) {
            console.error('Marca no válida para actualizar:', updatedMarca);
            return;
        }
        
        // Verificar que el _id no sea temporal
        if (!isValidMongoId(updatedMarca._id)) {
            console.error('No se puede actualizar marca con ID temporal o inválido:', updatedMarca._id);
            return;
        }
        
        setMarcas(prev => 
            prev.map(m => m._id === updatedMarca._id ? updatedMarca : m)
        );
    };

    /**
     * Eliminar marca de la lista local
     */
    const removeMarcaFromList = (id) => {
        if (!id || !isValidMongoId(id)) {
            console.error('ID no válido para eliminar:', id);
            return;
        }
        setMarcas(prev => prev.filter(m => m._id !== id));
    };

    return {
        // Estados de datos
        marcas,
        filteredMarcas,
        loading,
        refreshing,
        
        // Estados de modales
        modalVisible,
        addModalVisible,
        editModalVisible,
        selectedMarca,
        selectedIndex,
        
        // Estados de filtros
        searchText,
        selectedFilter,
        
        // Funciones de datos
        onRefresh,
        fetchMarcas,
        
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
        addMarcaToList,
        updateMarcaInList,
        removeMarcaFromList,

        // Estadísticas de marcas
        marcasStats,

        // Función de validación
        isValidMongoId,

        // Pasar getAuthHeaders para que esté disponible en el componente principal
        getAuthHeaders,
    };
};