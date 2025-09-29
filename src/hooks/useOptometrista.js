import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar el estado y operaciones de optometristas
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Carga de optometristas desde el servidor
 * - Filtrado y ordenamiento de optometristas
 * - Estados de carga y refresh
 * - Manejo de modales de detalle
 * - Cálculo de estadísticas de optometristas
 * - Gestión de filtros por disponibilidad y sucursal
 * - CRUD completo de optometristas (Create, Read, Update, Delete)
 * 
 * @returns {Object} Objeto con estados y funciones para manejar optometristas
 */
export const useOptometristas = () => {
    const { getAuthHeaders } = useAuth();
    
    // ===========================================
    // ESTADOS PRINCIPALES
    // ===========================================
    const [optometristas, setOptometristas] = useState([]);
    const [filteredOptometristas, setFilteredOptometristas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // ===========================================
    // ESTADOS DE MODALES
    // ===========================================
    // Modal de detalle
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOptometrista, setSelectedOptometrista] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // ===========================================
    // ESTADOS DE FILTROS Y BÚSQUEDA
    // ===========================================
    const [searchText, setSearchText] = useState('');
    const [selectedDisponibilidadFilter, setSelectedDisponibilidadFilter] = useState('todos'); // 'todos', 'disponibles', 'no_disponibles'
    const [selectedSucursalFilter, setSelectedSucursalFilter] = useState('todas'); // 'todas', 'coatepeque', 'escalon', etc.

    // ===========================================
    // FUNCIONES CRUD - CREATE, READ, UPDATE, DELETE
    // ===========================================

    /**
     * Función para cargar optometristas desde el backend (READ)
     * Incluye manejo de errores y estados de carga
     */
    const loadOptometristas = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/optometrista', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setOptometristas(data);
            } else {
                Alert.alert(
                    'Error de conexión', 
                    'No se pudieron cargar los optometristas. Verifica tu conexión a internet.',
                    [{ text: 'Entendido', style: 'default' }]
                );
            }
        } catch (error) {
            console.error('Error al cargar optometristas:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor. Intenta nuevamente.',
                [{ text: 'Reintentar', onPress: loadOptometristas, style: 'default' }]
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función para actualizar un optometrista existente (UPDATE)
     * @param {string} optometristaId - ID del optometrista a actualizar
     * @param {Object} optometristaData - Nuevos datos del optometrista
     */
    const updateOptometrista = async (optometristaId, optometristaData) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/optometristas/${optometristaId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(optometristaData),
            });

            if (response.ok) {
                const updatedOptometrista = await response.json();
                setOptometristas(prevOptometristas => 
                    prevOptometristas.map(optometrista => 
                        optometrista._id === optometristaId ? updatedOptometrista : optometrista
                    )
                );
                
                Alert.alert(
                    'Optometrista actualizado', 
                    'Los datos del optometrista han sido actualizados exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                const errorData = await response.json();
                Alert.alert(
                    'Error al actualizar optometrista', 
                    errorData.message || 'No se pudo actualizar el optometrista.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar optometrista:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    /**
     * Función para eliminar un optometrista (DELETE)
     * @param {string} optometristaId - ID del optometrista a eliminar
     */
    const deleteOptometrista = async (optometristaId) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/optometristas/${optometristaId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                setOptometristas(prevOptometristas => 
                    prevOptometristas.filter(optometrista => optometrista._id !== optometristaId)
                );
                
                Alert.alert(
                    'Optometrista eliminado', 
                    'El optometrista ha sido eliminado exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                Alert.alert(
                    'Error al eliminar optometrista', 
                    'No se pudo eliminar el optometrista.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al eliminar optometrista:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    /**
     * Función para actualizar la disponibilidad de un optometrista
     * @param {string} optometristaId - ID del optometrista
     * @param {boolean} nuevaDisponibilidad - Nueva disponibilidad del optometrista
     */
    const updateOptometristaDisponibilidad = async (optometristaId, nuevaDisponibilidad) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/optometristas/${optometristaId}/disponibilidad`, {
                method: 'PATCH',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ disponible: nuevaDisponibilidad }),
            });

            if (response.ok) {
                // Actualizar el optometrista en el estado local
                setOptometristas(prevOptometristas => 
                    prevOptometristas.map(optometrista => 
                        optometrista._id === optometristaId 
                            ? { ...optometrista, disponible: nuevaDisponibilidad }
                            : optometrista
                    )
                );
                
                return true;
            } else {
                Alert.alert(
                    'Error', 
                    'No se pudo actualizar la disponibilidad del optometrista.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar disponibilidad del optometrista:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al actualizar la disponibilidad del optometrista.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    // ===========================================
    // FUNCIONES DE GESTIÓN DE LISTA
    // ===========================================

    /**
     * Función para agregar un optometrista a la lista local
     * @param {Object} newOptometrista - Nuevo optometrista a agregar
     */
    const addOptometristaToList = (newOptometrista) => {
        setOptometristas(prevOptometristas => [newOptometrista, ...prevOptometristas]);
    };

    // ===========================================
    // FUNCIONES DE REFRESH Y CARGA
    // ===========================================

    /**
     * Función para refrescar la lista mediante pull-to-refresh
     * Proporciona feedback visual al usuario durante la actualización
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadOptometristas();
        setRefreshing(false);
    };

    // ===========================================
    // FUNCIONES DE MODAL DE DETALLE
    // ===========================================

    /**
     * Función para abrir el modal de detalle de un optometrista
     * @param {Object} optometrista - Objeto con los datos del optometrista
     * @param {number} index - Índice del optometrista en la lista filtrada
     */
    const handleViewMore = (optometrista, index) => {
        setSelectedOptometrista(optometrista);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    /**
     * Función para cerrar el modal de detalle
     */
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedOptometrista(null);
        setSelectedIndex(0);
    };

    // ===========================================
    // FUNCIONES DE FILTROS Y BÚSQUEDA
    // ===========================================

    /**
     * Función para filtrar y ordenar optometristas según búsqueda y filtros seleccionados
     */
    const filterAndSortOptometristas = () => {
        let filtered = [...optometristas];

        // Aplicar filtro de búsqueda por nombre, apellido, email, especialidad o licencia
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            filtered = filtered.filter(optometrista => {
                const empleado = optometrista.empleadoId || {};
                return (
                    empleado.nombre?.toLowerCase().includes(searchLower) ||
                    empleado.apellido?.toLowerCase().includes(searchLower) ||
                    empleado.correo?.toLowerCase().includes(searchLower) ||
                    optometrista.especialidad?.toLowerCase().includes(searchLower) ||
                    optometrista.licencia?.toLowerCase().includes(searchLower)
                );
            });
        }

        // Aplicar filtro por disponibilidad
        switch (selectedDisponibilidadFilter) {
            case 'disponibles':
                filtered = filtered.filter(optometrista => 
                    optometrista.disponible === true
                );
                break;
            
            case 'no_disponibles':
                filtered = filtered.filter(optometrista => 
                    optometrista.disponible === false
                );
                break;
            
            case 'todos':
            default:
                // No filtrar por disponibilidad, mostrar todos
                break;
        }

        // Aplicar filtro por sucursal
        if (selectedSucursalFilter !== 'todas') {
            filtered = filtered.filter(optometrista => {
                const sucursales = optometrista.sucursalesAsignadas || [];
                
                // Verificar si el optometrista está asignado a la sucursal seleccionada
                return sucursales.some(sucursalId => {
                    // Mapear IDs a nombres para comparar
                    const sucursalMap = {
                        '1': 'coatepeque',
                        '2': 'escalon',
                        '3': 'santa rosa',
                        // Agregar más según tu base de datos
                    };
                    
                    return sucursalMap[sucursalId] === selectedSucursalFilter;
                });
            });
        }

        // Ordenar por fecha de creación (más reciente primero)
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.updatedAt);
            const dateB = new Date(b.createdAt || b.updatedAt);
            return dateB - dateA;
        });

        return filtered;
    };

    // ===========================================
    // FUNCIONES DE ESTADÍSTICAS
    // ===========================================

    /**
     * Obtener estadísticas rápidas de los optometristas
     */
    const getOptometristasStats = () => {
        const total = optometristas.length;
        const disponibles = optometristas.filter(optometrista => 
            optometrista.disponible === true
        ).length;
        const noDisponibles = optometristas.filter(optometrista => 
            optometrista.disponible === false
        ).length;

        // Calcular experiencia promedio
        const totalExperiencia = optometristas.reduce((total, optometrista) => {
            return total + (parseInt(optometrista.experiencia) || 0);
        }, 0);
        
        const experienciaPromedio = total > 0 ? Math.round(totalExperiencia / total) : 0;
        
        return { 
            total, 
            disponibles, 
            noDisponibles, 
            experienciaPromedio: `${experienciaPromedio} años`
        };
    };

    // ===========================================
    // EFECTOS (useEffect)
    // ===========================================

    /**
     * Efecto para actualizar la lista filtrada cuando cambian los datos, búsqueda o filtros
     */
    useEffect(() => {
        const filtered = filterAndSortOptometristas();
        setFilteredOptometristas(filtered);
    }, [optometristas, searchText, selectedDisponibilidadFilter, selectedSucursalFilter]);

    /**
     * Cargar optometristas al montar el componente
     */
    useEffect(() => {
        loadOptometristas();
    }, []);

    // ===========================================
    // RETORNO DEL HOOK
    // ===========================================
    return {
        // Estados de datos
        optometristas,
        filteredOptometristas,
        loading,
        refreshing,
        
        // Estados de modal de detalle
        modalVisible,
        selectedOptometrista,
        selectedIndex,
        
        // Estados de filtros
        searchText,
        selectedDisponibilidadFilter,
        selectedSucursalFilter,
        
        // Funciones de datos y refresh
        loadOptometristas,
        onRefresh,
        getOptometristasStats,
        addOptometristaToList,
        
        // Funciones CRUD
        updateOptometrista,
        deleteOptometrista,
        updateOptometristaDisponibilidad,
        
        // Funciones de modal de detalle
        handleViewMore,
        handleCloseModal,
        
        // Funciones de filtros
        setSearchText,
        setSelectedDisponibilidadFilter,
        setSelectedSucursalFilter,
        filterAndSortOptometristas
    };
};