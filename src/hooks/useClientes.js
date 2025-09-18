import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar el estado y operaciones de clientes
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Carga de clientes desde el servidor
 * - Filtrado y ordenamiento de clientes
 * - Estados de carga y refresh
 * - Manejo de modales de detalle y agregar
 * - Cálculo de estadísticas de clientes
 * - Gestión de filtros por estado (Todos, Activos, Inactivos)
 * - CRUD completo de clientes (Create, Read, Update, Delete)
 * 
 * @returns {Object} Objeto con estados y funciones para manejar clientes
 */
export const useClientes = () => {
    const { getAuthHeaders } = useAuth();
    
    // ===========================================
    // ESTADOS PRINCIPALES
    // ===========================================
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // ===========================================
    // ESTADOS DE MODALES
    // ===========================================
    // Modal de detalle
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    // Modal de agregar
    const [addModalVisible, setAddModalVisible] = useState(false);

    // ===========================================
    // ESTADOS DE FILTROS Y BÚSQUEDA
    // ===========================================
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todos'); // 'todos', 'activos', 'inactivos'

    // ===========================================
    // FUNCIONES CRUD - CREATE, READ, UPDATE, DELETE
    // ===========================================

    /**
     * Función para cargar clientes desde el backend (READ)
     * Incluye manejo de errores y estados de carga
     */
    const loadClientes = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/clientes', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setClientes(data);
            } else {
                Alert.alert(
                    'Error de conexión', 
                    'No se pudieron cargar los clientes. Verifica tu conexión a internet.',
                    [{ text: 'Entendido', style: 'default' }]
                );
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor. Intenta nuevamente.',
                [{ text: 'Reintentar', onPress: loadClientes, style: 'default' }]
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función para crear un nuevo cliente (CREATE)
     * @param {Object} clienteData - Datos del cliente a crear
     */
    const createCliente = async (clienteData) => {
        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/clientes', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clienteData),
            });

            if (response.ok) {
                const newCliente = await response.json();
                setClientes(prevClientes => [newCliente, ...prevClientes]);
                
                Alert.alert(
                    'Cliente creado', 
                    'El cliente ha sido registrado exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                const errorData = await response.json();
                Alert.alert(
                    'Error al crear cliente', 
                    errorData.message || 'No se pudo crear el cliente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al crear cliente:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    /**
     * Función para actualizar un cliente existente (UPDATE)
     * @param {string} clienteId - ID del cliente a actualizar
     * @param {Object} clienteData - Nuevos datos del cliente
     */
    const updateCliente = async (clienteId, clienteData) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/clientes/${clienteId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clienteData),
            });

            if (response.ok) {
                const updatedCliente = await response.json();
                setClientes(prevClientes => 
                    prevClientes.map(cliente => 
                        cliente._id === clienteId ? updatedCliente : cliente
                    )
                );
                
                Alert.alert(
                    'Cliente actualizado', 
                    'Los datos del cliente han sido actualizados exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                const errorData = await response.json();
                Alert.alert(
                    'Error al actualizar cliente', 
                    errorData.message || 'No se pudo actualizar el cliente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    /**
     * Función para eliminar un cliente (DELETE)
     * @param {string} clienteId - ID del cliente a eliminar
     */
    const deleteCliente = async (clienteId) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/clientes/${clienteId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                setClientes(prevClientes => 
                    prevClientes.filter(cliente => cliente._id !== clienteId)
                );
                
                Alert.alert(
                    'Cliente eliminado', 
                    'El cliente ha sido eliminado exitosamente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                
                return true;
            } else {
                Alert.alert(
                    'Error al eliminar cliente', 
                    'No se pudo eliminar el cliente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        }
    };

    /**
     * Función para actualizar el estado de un cliente
     * @param {string} clienteId - ID del cliente
     * @param {string} nuevoEstado - Nuevo estado del cliente ('activo' o 'inactivo')
     */
    const updateClienteEstado = async (clienteId, nuevoEstado) => {
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/clientes/${clienteId}/estado`, {
                method: 'PATCH',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            if (response.ok) {
                // Actualizar el cliente en el estado local
                setClientes(prevClientes => 
                    prevClientes.map(cliente => 
                        cliente._id === clienteId 
                            ? { ...cliente, estado: nuevoEstado }
                            : cliente
                    )
                );
                
                Alert.alert(
                    'Estado actualizado', 
                    `El cliente ha sido marcado como ${nuevoEstado}.`,
                    [{ text: 'Entendido', style: 'default' }]
                );
            } else {
                Alert.alert(
                    'Error', 
                    'No se pudo actualizar el estado del cliente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
            }
        } catch (error) {
            console.error('Error al actualizar estado del cliente:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al actualizar el estado del cliente.',
                [{ text: 'Entendido', style: 'default' }]
            );
        }
    };

    // ===========================================
    // FUNCIONES DE GESTIÓN DE LISTA
    // ===========================================

    /**
     * Función para agregar un cliente a la lista local
     * @param {Object} newCliente - Nuevo cliente a agregar
     */
    const addClienteToList = (newCliente) => {
        setClientes(prevClientes => [newCliente, ...prevClientes]);
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
        await loadClientes();
        setRefreshing(false);
    };

    // ===========================================
    // FUNCIONES DE MODAL DE DETALLE
    // ===========================================

    /**
     * Función para abrir el modal de detalle de un cliente
     * @param {Object} cliente - Objeto con los datos del cliente
     * @param {number} index - Índice del cliente en la lista filtrada
     */
    const handleViewMore = (cliente, index) => {
        setSelectedCliente(cliente);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    /**
     * Función para cerrar el modal de detalle
     */
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCliente(null);
        setSelectedIndex(0);
    };

    // ===========================================
    // FUNCIONES DE MODAL DE AGREGAR
    // ===========================================

    /**
     * Función para abrir el modal de agregar cliente
     */
    const handleOpenAddModal = () => {
        setAddModalVisible(true);
    };

    /**
     * Función para cerrar el modal de agregar cliente
     */
    const handleCloseAddModal = () => {
        setAddModalVisible(false);
    };

    /**
     * Función para manejar la creación de cliente desde el modal
     * @param {Object} clienteData - Datos del cliente a crear
     */
    const handleCreateCliente = async (clienteData) => {
        const success = await createCliente(clienteData);
        if (success) {
            handleCloseAddModal();
        }
        return success;
    };

    // ===========================================
    // FUNCIONES DE FILTROS Y BÚSQUEDA
    // ===========================================

    /**
     * Función para filtrar y ordenar clientes según búsqueda y filtros seleccionados
     */
    const filterAndSortClientes = () => {
        let filtered = [...clientes];

        // Aplicar filtro de búsqueda por nombre, apellido, DUI, correo o teléfono
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            filtered = filtered.filter(cliente => 
                cliente.nombre?.toLowerCase().includes(searchLower) ||
                cliente.apellido?.toLowerCase().includes(searchLower) ||
                cliente.dui?.toLowerCase().includes(searchLower) ||
                cliente.correo?.toLowerCase().includes(searchLower) ||
                cliente.telefono?.includes(searchText.trim())
            );
        }

        // Aplicar filtro por estado
        switch (selectedFilter) {
            case 'activos':
                filtered = filtered.filter(cliente => 
                    cliente.estado?.toLowerCase() === 'activo'
                );
                break;
            
            case 'inactivos':
                filtered = filtered.filter(cliente => 
                    cliente.estado?.toLowerCase() === 'inactivo'
                );
                break;
            
            case 'todos':
            default:
                // No filtrar por estado, mostrar todos
                break;
        }

        // Ordenar por fecha de registro (más reciente primero)
        filtered.sort((a, b) => {
            const dateA = new Date(a.fechaRegistro || a.createdAt);
            const dateB = new Date(b.fechaRegistro || b.createdAt);
            return dateB - dateA;
        });

        return filtered;
    };

    // ===========================================
    // FUNCIONES DE ESTADÍSTICAS
    // ===========================================

    /**
     * Obtener estadísticas rápidas de los clientes
     */
    const getClientesStats = () => {
        const total = clientes.length;
        const activos = clientes.filter(cliente => 
            cliente.estado?.toLowerCase() === 'activo'
        ).length;
        const inactivos = clientes.filter(cliente => 
            cliente.estado?.toLowerCase() === 'inactivo'
        ).length;
        
        return { total, activos, inactivos };
    };

    // ===========================================
    // EFECTOS (useEffect)
    // ===========================================

    /**
     * Efecto para actualizar la lista filtrada cuando cambian los datos, búsqueda o filtros
     */
    useEffect(() => {
        const filtered = filterAndSortClientes();
        setFilteredClientes(filtered);
    }, [clientes, searchText, selectedFilter]);

    /**
     * Cargar clientes al montar el componente
     */
    useEffect(() => {
        loadClientes();
    }, []);

    // ===========================================
    // RETORNO DEL HOOK
    // ===========================================
    return {
        // Estados de datos
        clientes,
        filteredClientes,
        loading,
        refreshing,
        
        // Estados de modal de detalle
        modalVisible,
        selectedCliente,
        selectedIndex,
        
        // Estados de modal de agregar
        addModalVisible,
        
        // Estados de filtros
        searchText,
        selectedFilter,
        
        // Funciones de datos y refresh
        loadClientes,
        onRefresh,
        getClientesStats,
        addClienteToList,
        
        // Funciones CRUD
        createCliente,
        updateCliente,
        deleteCliente,
        updateClienteEstado,
        
        // Funciones de modal de detalle
        handleViewMore,
        handleCloseModal,
        
        // Funciones de modal de agregar
        handleOpenAddModal,
        handleCloseAddModal,
        handleCreateCliente,
        
        // Funciones de filtros
        setSearchText,
        setSelectedFilter,
        filterAndSortClientes
    };
};