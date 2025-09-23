import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar el estado y operaciones de empleados
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Carga de empleados desde el servidor
 * - Filtrado y ordenamiento de empleados
 * - Estados de carga y refresh
 * - Manejo de modales de detalle y agregar
 * - Cálculo de estadísticas de empleados
 * - Gestión de filtros por estado y sucursal
 * - CRUD completo de empleados (Create, Read, Update, Delete)
 * 
 * @returns {Object} Objeto con estados y funciones para manejar empleados
 */
export const useEmpleados = () => {
    const { getAuthHeaders } = useAuth();
    
    // ===========================================
    // ESTADOS PRINCIPALES
    // ===========================================
    const [empleados, setEmpleados] = useState([]);
    const [filteredEmpleados, setFilteredEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // ===========================================
    // ESTADOS DE MODALES
    // ===========================================
    // Modal de detalle
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    // Modal de agregar
    const [addModalVisible, setAddModalVisible] = useState(false);

    // ===========================================
    // ESTADOS DE FILTROS Y BÚSQUEDA
    // ===========================================
    const [searchText, setSearchText] = useState('');
    const [selectedEstadoFilter, setSelectedEstadoFilter] = useState('todos'); // 'todos', 'activos', 'inactivos'
    const [selectedSucursalFilter, setSelectedSucursalFilter] = useState('todas'); // 'todas', 'centro', 'escalon', etc.

    // ===========================================
    // FUNCIONES CRUD - CREATE, READ, UPDATE, DELETE
    // ===========================================

    /**
     * Función para cargar empleados desde el backend (READ)
     * Incluye manejo de errores y estados de carga
     */
    const loadEmpleados = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/empleados', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setEmpleados(data);
            } else {
                Alert.alert(
                    'Error de conexión', 
                    'No se pudieron cargar los empleados. Verifica tu conexión a internet.',
                    [{ text: 'Entendido', style: 'default' }]
                );
            }
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor. Intenta nuevamente.',
                [{ text: 'Reintentar', onPress: loadEmpleados, style: 'default' }]
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función para crear un nuevo empleado (CREATE)
     * @param {Object} empleadoData - Datos del empleado a crear
     */
    const createEmpleado = async (empleadoData) => {
        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/empleados', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(empleadoData),
            });

            if (response.ok) {
                const newEmpleado = await response.json();
                setEmpleados(prevEmpleados => [newEmpleado, ...prevEmpleados]);
                
                Alert.alert(
                    'Empleado creado', 
                    'El empleado ha sido registrado exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                const errorData = await response.json();
                Alert.alert(
                    'Error al crear empleado', 
                    errorData.message || 'No se pudo crear el empleado.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al crear empleado:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    /**
     * Función para actualizar un empleado existente (UPDATE)
     * @param {string} empleadoId - ID del empleado a actualizar
     * @param {Object} empleadoData - Nuevos datos del empleado
     */
    const updateEmpleado = async (empleadoId, empleadoData) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${empleadoId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(empleadoData),
            });

            if (response.ok) {
                const updatedEmpleado = await response.json();
                setEmpleados(prevEmpleados => 
                    prevEmpleados.map(empleado => 
                        empleado._id === empleadoId ? updatedEmpleado : empleado
                    )
                );
                
                Alert.alert(
                    'Empleado actualizado', 
                    'Los datos del empleado han sido actualizados exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                const errorData = await response.json();
                Alert.alert(
                    'Error al actualizar empleado', 
                    errorData.message || 'No se pudo actualizar el empleado.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    /**
     * Función para eliminar un empleado (DELETE)
     * @param {string} empleadoId - ID del empleado a eliminar
     */
    const deleteEmpleado = async (empleadoId) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${empleadoId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                setEmpleados(prevEmpleados => 
                    prevEmpleados.filter(empleado => empleado._id !== empleadoId)
                );
                
                Alert.alert(
                    'Empleado eliminado', 
                    'El empleado ha sido eliminado exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                Alert.alert(
                    'Error al eliminar empleado', 
                    'No se pudo eliminar el empleado.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    /**
     * Función para actualizar el estado de un empleado
     * @param {string} empleadoId - ID del empleado
     * @param {string} nuevoEstado - Nuevo estado del empleado ('Activo' o 'Inactivo')
     */
    const updateEmpleadoEstado = async (empleadoId, nuevoEstado) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${empleadoId}/estado`, {
                method: 'PATCH',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            if (response.ok) {
                // Actualizar el empleado en el estado local
                setEmpleados(prevEmpleados => 
                    prevEmpleados.map(empleado => 
                        empleado._id === empleadoId 
                            ? { ...empleado, estado: nuevoEstado }
                            : empleado
                    )
                );
                
                return true;
            } else {
                Alert.alert(
                    'Error', 
                    'No se pudo actualizar el estado del empleado.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar estado del empleado:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al actualizar el estado del empleado.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    // ===========================================
    // FUNCIONES DE GESTIÓN DE LISTA
    // ===========================================

    /**
     * Función para agregar un empleado a la lista local
     * @param {Object} newEmpleado - Nuevo empleado a agregar
     */
    const addEmpleadoToList = (newEmpleado) => {
        setEmpleados(prevEmpleados => [newEmpleado, ...prevEmpleados]);
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
        await loadEmpleados();
        setRefreshing(false);
    };

    // ===========================================
    // FUNCIONES DE MODAL DE DETALLE
    // ===========================================

    /**
     * Función para abrir el modal de detalle de un empleado
     * @param {Object} empleado - Objeto con los datos del empleado
     * @param {number} index - Índice del empleado en la lista filtrada
     */
    const handleViewMore = (empleado, index) => {
        setSelectedEmpleado(empleado);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    /**
     * Función para cerrar el modal de detalle
     */
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedEmpleado(null);
        setSelectedIndex(0);
    };

    // ===========================================
    // FUNCIONES DE MODAL DE AGREGAR
    // ===========================================

    /**
     * Función para abrir el modal de agregar empleado
     */
    const handleOpenAddModal = () => {
        setAddModalVisible(true);
    };

    /**
     * Función para cerrar el modal de agregar empleado
     */
    const handleCloseAddModal = () => {
        setAddModalVisible(false);
    };

    /**
     * Función para manejar la creación de empleado desde el modal
     * @param {Object} empleadoData - Datos del empleado a crear
     */
    const handleCreateEmpleado = async (empleadoData) => {
        const success = await createEmpleado(empleadoData);
        if (success) {
            handleCloseAddModal();
        }
        return success;
    };

    // ===========================================
    // FUNCIONES DE FILTROS Y BÚSQUEDA
    // ===========================================

    /**
     * Función para filtrar y ordenar empleados según búsqueda y filtros seleccionados
     */
    const filterAndSortEmpleados = () => {
        let filtered = [...empleados];

        // Aplicar filtro de búsqueda por nombre, apellido, DUI, correo o teléfono
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            filtered = filtered.filter(empleado => 
                empleado.nombre?.toLowerCase().includes(searchLower) ||
                empleado.apellido?.toLowerCase().includes(searchLower) ||
                empleado.dui?.toLowerCase().includes(searchLower) ||
                empleado.correo?.toLowerCase().includes(searchLower) ||
                empleado.telefono?.includes(searchText.trim()) ||
                empleado.cargo?.toLowerCase().includes(searchLower)
            );
        }

        // Aplicar filtro por estado
        switch (selectedEstadoFilter) {
            case 'activos':
                filtered = filtered.filter(empleado => 
                    empleado.estado?.toLowerCase() === 'activo'
                );
                break;
            
            case 'inactivos':
                filtered = filtered.filter(empleado => 
                    empleado.estado?.toLowerCase() === 'inactivo'
                );
                break;
            
            case 'todos':
            default:
                // No filtrar por estado, mostrar todos
                break;
        }

        // Aplicar filtro por sucursal
        if (selectedSucursalFilter !== 'todas') {
            filtered = filtered.filter(empleado => {
                const sucursalEmpleado = empleado.sucursalId?.nombre || empleado.sucursal || '';
                
                // Comparaciones exactas considerando acentos y espacios
                switch (selectedSucursalFilter) {
                    case 'centro':
                        return sucursalEmpleado.toLowerCase().includes('centro');
                    case 'escalón':
                        return sucursalEmpleado.toLowerCase().includes('escalón') || 
                               sucursalEmpleado.toLowerCase().includes('escalon');
                    case 'santa rosa':
                        return sucursalEmpleado.toLowerCase().includes('santa rosa') ||
                               sucursalEmpleado.toLowerCase().includes('santa-rosa');
                    default:
                        return false;
                }
            });
        }

        // Ordenar por fecha de contratación (más reciente primero)
        filtered.sort((a, b) => {
            const dateA = new Date(a.fechaContratacion || a.createdAt);
            const dateB = new Date(b.fechaContratacion || b.createdAt);
            return dateB - dateA;
        });

        return filtered;
    };

    // ===========================================
    // FUNCIONES DE ESTADÍSTICAS
    // ===========================================

    /**
     * Obtener estadísticas rápidas de los empleados
     */
    const getEmpleadosStats = () => {
        const total = empleados.length;
        const activos = empleados.filter(empleado => 
            empleado.estado?.toLowerCase() === 'activo'
        ).length;
        const inactivos = empleados.filter(empleado => 
            empleado.estado?.toLowerCase() === 'inactivo'
        ).length;

        // Calcular sucursales
        const sucursales = new Set();
        empleados.forEach(empleado => {
            const sucursal = empleado.sucursalId?.nombre || empleado.sucursal;
            if (sucursal) {
                sucursales.add(sucursal);
            }
        });

        // Calcular nómina total de empleados activos
        const nominaTotal = empleados
            .filter(empleado => empleado.estado?.toLowerCase() === 'activo')
            .reduce((total, empleado) => total + (empleado.salario || 0), 0);
        
        return { 
            total, 
            activos, 
            inactivos, 
            sucursales: sucursales.size,
            nominaTotal 
        };
    };

    // ===========================================
    // EFECTOS (useEffect)
    // ===========================================

    /**
     * Efecto para actualizar la lista filtrada cuando cambian los datos, búsqueda o filtros
     */
    useEffect(() => {
        const filtered = filterAndSortEmpleados();
        setFilteredEmpleados(filtered);
    }, [empleados, searchText, selectedEstadoFilter, selectedSucursalFilter]);

    /**
     * Cargar empleados al montar el componente
     */
    useEffect(() => {
        loadEmpleados();
    }, []);

    // ===========================================
    // RETORNO DEL HOOK
    // ===========================================
    return {
        // Estados de datos
        empleados,
        filteredEmpleados,
        loading,
        refreshing,
        
        // Estados de modal de detalle
        modalVisible,
        selectedEmpleado,
        selectedIndex,
        
        // Estados de modal de agregar
        addModalVisible,
        
        // Estados de filtros
        searchText,
        selectedEstadoFilter,
        selectedSucursalFilter,
        
        // Funciones de datos y refresh
        loadEmpleados,
        onRefresh,
        getEmpleadosStats,
        addEmpleadoToList,
        
        // Funciones CRUD
        createEmpleado,
        updateEmpleado,
        deleteEmpleado,
        updateEmpleadoEstado,
        
        // Funciones de modal de detalle
        handleViewMore,
        handleCloseModal,
        
        // Funciones de modal de agregar
        handleOpenAddModal,
        handleCloseAddModal,
        handleCreateEmpleado,
        
        // Funciones de filtros
        setSearchText,
        setSelectedEstadoFilter,
        setSelectedSucursalFilter,
        filterAndSortEmpleados
    };
};