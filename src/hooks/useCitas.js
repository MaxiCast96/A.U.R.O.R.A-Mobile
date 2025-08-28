import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar el estado y operaciones de citas
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Carga de citas desde el servidor
 * - Filtrado y ordenamiento de citas
 * - Estados de carga y refresh
 * - Manejo de modales de detalle
 * - Cálculo de estadísticas
 * 
 * @returns {Object} Objeto con estados y funciones para manejar citas
 */
export const useCitas = () => {
    const { getAuthHeaders } = useAuth();
    
    // Estados principales
    const [citas, setCitas] = useState([]);
    const [filteredCitas, setFilteredCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados del modal de detalle
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCita, setSelectedCita] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Estados de filtros y búsqueda
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('reciente');

    /**
     * Función para cargar citas desde el backend
     * Incluye manejo de errores y estados de carga
     */
    const loadCitas = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/citas', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setCitas(data);
            } else {
                Alert.alert(
                    'Error de conexión', 
                    'No se pudieron cargar las citas. Verifica tu conexión a internet.',
                    [{ text: 'Entendido', style: 'default' }]
                );
            }
        } catch (error) {
            console.error('Error al cargar citas:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor. Intenta nuevamente.',
                [{ text: 'Reintentar', onPress: loadCitas, style: 'default' }]
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función para refrescar la lista mediante pull-to-refresh
     * Proporciona feedback visual al usuario durante la actualización
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadCitas();
        setRefreshing(false);
    };

    /**
     * Función para abrir el modal de detalle de una cita
     * @param {Object} cita - Objeto con los datos de la cita
     * @param {number} index - Índice de la cita en la lista filtrada
     */
    const handleViewMore = (cita, index) => {
        setSelectedCita(cita);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    /**
     * Función para cerrar el modal de detalle
     */
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCita(null);
        setSelectedIndex(0);
    };

    /**
     * Función para filtrar y ordenar citas según búsqueda y filtros seleccionados
     */
    const filterAndSortCitas = () => {
        let filtered = [...citas];

        // Aplicar filtro de búsqueda por motivo de cita
        if (searchText.trim()) {
            filtered = filtered.filter(cita => 
                cita.motivoCita?.toLowerCase().includes(searchText.toLowerCase().trim())
            );
        }

        // Aplicar ordenamiento según filtro seleccionado
        switch (selectedFilter) {
            case 'reciente':
                // Ordenar por fecha de creación (más reciente primero)
                filtered.sort((a, b) => {
                    const dateA = new Date(a.fecha || a.createdAt);
                    const dateB = new Date(b.fecha || b.createdAt);
                    return dateB - dateA;
                });
                break;
            
            case 'proxima':
                // Ordenar por fecha de cita (más próxima primero)
                filtered.sort((a, b) => {
                    const dateA = new Date(a.fecha);
                    const dateB = new Date(b.fecha);
                    return dateA - dateB;
                });
                break;
            
            case 'lejana':
                // Ordenar por fecha de cita (más lejana primero)
                filtered.sort((a, b) => {
                    const dateA = new Date(a.fecha);
                    const dateB = new Date(b.fecha);
                    return dateB - dateA;
                });
                break;
            
            default:
                // Por defecto, más reciente
                filtered.sort((a, b) => {
                    const dateA = new Date(a.fecha || a.createdAt);
                    const dateB = new Date(b.fecha || b.createdAt);
                    return dateB - dateA;
                });
        }

        return filtered;
    };

    /**
     * Obtener estadísticas rápidas de las citas con los 5 estados
     */
    const getCitasStats = () => {
        const total = citas.length;
        const agendadas = citas.filter(cita => cita.estado?.toLowerCase() === 'agendada').length;
        const pendientes = citas.filter(cita => cita.estado?.toLowerCase() === 'pendiente').length;
        const confirmadas = citas.filter(cita => cita.estado?.toLowerCase() === 'confirmada').length;
        const canceladas = citas.filter(cita => cita.estado?.toLowerCase() === 'cancelada').length;
        const completadas = citas.filter(cita => 
            cita.estado?.toLowerCase() === 'completada' || 
            cita.estado?.toLowerCase() === 'completado'
        ).length;
        
        return { total, agendadas, pendientes, confirmadas, canceladas, completadas };
    };

    /**
     * Efecto para actualizar la lista filtrada cuando cambian los datos, búsqueda o filtros
     */
    useEffect(() => {
        const filtered = filterAndSortCitas();
        setFilteredCitas(filtered);
    }, [citas, searchText, selectedFilter]);

    /**
     * Cargar citas al montar el componente
     */
    useEffect(() => {
        loadCitas();
    }, []);

    // Retornar todos los estados y funciones necesarias
    return {
        // Estados de datos
        citas,
        filteredCitas,
        loading,
        refreshing,
        
        // Estados de modal
        modalVisible,
        selectedCita,
        selectedIndex,
        
        // Estados de filtros
        searchText,
        selectedFilter,
        
        // Funciones de datos
        loadCitas,
        onRefresh,
        getCitasStats,
        
        // Funciones de modal
        handleViewMore,
        handleCloseModal,
        
        // Funciones de filtros
        setSearchText,
        setSelectedFilter,
        filterAndSortCitas
    };
};