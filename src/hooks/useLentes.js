import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar lentes
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Carga y gestión de datos de lentes
 * - Filtrado y búsqueda
 * - Operaciones CRUD (crear, leer, actualizar, eliminar)
 * - Manejo de estados de carga y modales
 * - Cálculo de estadísticas
 * 
 * @returns {Object} Objeto con estados y funciones para gestionar lentes
 */
export const useLentes = () => {
    // ===========================================
    // ESTADOS PRINCIPALES
    // ===========================================
    const { getAuthHeaders } = useAuth();
    
    // Datos principales
    const [lentes, setLentes] = useState([]);
    const [filteredLentes, setFilteredLentes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados de modales
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLente, setSelectedLente] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [addModalVisible, setAddModalVisible] = useState(false);
    
    // Estados de filtros
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todos');

    // ===========================================
    // FUNCIONES DE DATOS
    // ===========================================

    /**
     * Cargar lentes desde el servidor
     */
    const loadLentes = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/lentes', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setLentes(data);
            } else {
                Alert.alert('Error', 'No se pudieron cargar los lentes');
            }
        } catch (error) {
            console.error('Error loading lentes:', error);
            Alert.alert('Error de red', 'No se pudo conectar con el servidor');
        } finally {
            if (isRefreshing) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    /**
     * Función para refrescar datos
     */
    const onRefresh = () => {
        loadLentes(true);
    };

    // ===========================================
    // FUNCIONES DE FILTRADO
    // ===========================================

    /**
     * Aplicar filtros a la lista de lentes
     */
    const applyFilters = () => {
        let filtered = [...lentes];

        // Aplicar búsqueda por texto
        if (searchText.trim() !== '') {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(lente => 
                lente.nombre?.toLowerCase().includes(searchLower) ||
                lente.descripcion?.toLowerCase().includes(searchLower) ||
                lente.material?.toLowerCase().includes(searchLower) ||
                lente.color?.toLowerCase().includes(searchLower) ||
                lente.tipoLente?.toLowerCase().includes(searchLower) ||
                (typeof lente.marcaId === 'object' ? lente.marcaId?.nombre?.toLowerCase().includes(searchLower) : false) ||
                (typeof lente.categoriaId === 'object' ? lente.categoriaId?.nombre?.toLowerCase().includes(searchLower) : false)
            );
        }

        // Aplicar filtros por tipo
        switch (selectedFilter) {
            case 'promocion':
                filtered = filtered.filter(lente => lente.enPromocion === true);
                break;
            case 'sinPromocion':
                filtered = filtered.filter(lente => lente.enPromocion !== true);
                break;
            case 'conStock':
                filtered = filtered.filter(lente => {
                    const stockTotal = getStockTotal(lente);
                    return stockTotal > 0;
                });
                break;
            case 'sinStock':
                filtered = filtered.filter(lente => {
                    const stockTotal = getStockTotal(lente);
                    return stockTotal === 0;
                });
                break;
            case 'monofocal':
                filtered = filtered.filter(lente => 
                    lente.tipoLente?.toLowerCase().includes('monofocal')
                );
                break;
            case 'bifocal':
                filtered = filtered.filter(lente => 
                    lente.tipoLente?.toLowerCase().includes('bifocal')
                );
                break;
            case 'progresivo':
                filtered = filtered.filter(lente => 
                    lente.tipoLente?.toLowerCase().includes('progresivo')
                );
                break;
            case 'ocupacional':
                filtered = filtered.filter(lente => 
                    lente.tipoLente?.toLowerCase().includes('ocupacional')
                );
                break;
            default:
                // 'todos' - no aplicar filtro adicional
                break;
        }

        setFilteredLentes(filtered);
    };

    // ===========================================
    // FUNCIONES DE UTILIDAD
    // ===========================================

    /**
     * Calcular stock total de un lente
     */
    const getStockTotal = (lente) => {
        if (!lente.sucursales || lente.sucursales.length === 0) return 0;
        return lente.sucursales.reduce((total, sucursal) => total + (sucursal.stock || 0), 0);
    };

    /**
     * Calcular estadísticas de lentes
     */
    const getLentesStats = () => {
        const total = lentes.length;
        const enPromocion = lentes.filter(lente => lente.enPromocion === true).length;
        
        let stockTotal = 0;
        let valorInventario = 0;
        
        lentes.forEach(lente => {
            const stock = getStockTotal(lente);
            stockTotal += stock;
            valorInventario += (lente.precioActual || 0) * stock;
        });

        return {
            total,
            enPromocion,
            stockTotal,
            valorInventario
        };
    };

    // ===========================================
    // FUNCIONES CRUD
    // ===========================================

    /**
     * Agregar nuevo lente a la lista local
     */
    const addLenteToList = (newLente) => {
        setLentes(prevLentes => [newLente, ...prevLentes]);
    };

    /**
     * Actualizar lente en la lista local
     */
    const updateLente = (lenteId, updatedLente) => {
        setLentes(prevLentes => 
            prevLentes.map(lente => 
                lente._id === lenteId ? { ...lente, ...updatedLente } : lente
            )
        );
    };

    /**
     * Eliminar lente
     */
    const deleteLente = async (lenteId) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/lentes/${lenteId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                setLentes(prevLentes => prevLentes.filter(lente => lente._id !== lenteId));
                return true;
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'No se pudo eliminar el lente');
                return false;
            }
        } catch (error) {
            console.error('Error deleting lente:', error);
            Alert.alert('Error', 'No se pudo eliminar el lente');
            return false;
        }
    };

    // ===========================================
    // FUNCIONES DE MODALES
    // ===========================================

    /**
     * Abrir modal de detalles
     */
    const handleViewMore = (lente, index) => {
        setSelectedLente(lente);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    /**
     * Cerrar modal de detalles
     */
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedLente(null);
        setSelectedIndex(0);
    };

    /**
     * Abrir modal de agregar
     */
    const handleOpenAddModal = () => {
        setAddModalVisible(true);
    };

    /**
     * Cerrar modal de agregar
     */
    const handleCloseAddModal = () => {
        setAddModalVisible(false);
    };

    // ===========================================
    // EFECTOS
    // ===========================================

    // Cargar lentes al montar el componente
    useEffect(() => {
        loadLentes();
    }, []);

    // Aplicar filtros cuando cambien los datos o filtros
    useEffect(() => {
        applyFilters();
    }, [lentes, searchText, selectedFilter]);

    // ===========================================
    // RETORNO DEL HOOK
    // ===========================================
    return {
        // Estados de datos
        lentes,
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
        loadLentes,
        onRefresh,
        getLentesStats,
        
        // Funciones CRUD
        addLenteToList,
        updateLente,
        deleteLente,
        
        // Funciones de modal de detalle
        handleViewMore,
        handleCloseModal,
        
        // Funciones de modal de agregar
        handleOpenAddModal,
        handleCloseAddModal,
        
        // Funciones de filtros
        setSearchText,
        setSelectedFilter,
        
        // Funciones de utilidad
        getStockTotal
    };
};