import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const usePersonalizados = () => {
    const { getAuthHeaders } = useAuth();

    // Estados principales
    const [personalizados, setPersonalizados] = useState([]);
    const [filteredPersonalizados, setFilteredPersonalizados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modales
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPersonalizado, setSelectedPersonalizado] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [addModalVisible, setAddModalVisible] = useState(false);

    // Filtros y búsqueda
    const [searchText, setSearchText] = useState('');
    const [selectedEstadoFilter, setSelectedEstadoFilter] = useState('Todos');

    // CARGAR PRODUCTOS PERSONALIZADOS
    const loadPersonalizados = async () => {
        try {
            setLoading(true);
            console.log('📄 Cargando productos personalizados...');
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/productosPersonalizados', {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            
            console.log('📡 Respuesta del servidor:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📦 Datos recibidos:', data);
                console.log('📦 Tipo de datos:', typeof data);
                
                // Determinar estructura de respuesta
                let personalizadosArray = [];
                if (Array.isArray(data)) {
                    personalizadosArray = data;
                    console.log('✅ Datos son array directo');
                } else if (Array.isArray(data.personalizados)) {
                    personalizadosArray = data.personalizados;
                    console.log('✅ Datos en propiedad "personalizados"');
                } else if (Array.isArray(data.data)) {
                    personalizadosArray = data.data;
                    console.log('✅ Datos en propiedad "data"');
                } else {
                    console.warn('⚠️ Estructura de respuesta desconocida');
                    personalizadosArray = [];
                }
                
                console.log('📊 Total personalizados cargados:', personalizadosArray.length);
                setPersonalizados(personalizadosArray);
            } else {
                console.error('❌ Error de servidor:', response.status);
                const errorText = await response.text();
                console.error('❌ Detalle del error:', errorText);
                Alert.alert('Error de conexión', 'No se pudieron cargar los productos personalizados.');
                setPersonalizados([]);
            }
        } catch (error) {
            console.error('💥 Error de red al cargar personalizados:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            setPersonalizados([]);
        } finally {
            setLoading(false);
        }
    };

    // CREAR PRODUCTO PERSONALIZADO - CON DEBUG COMPLETO
    const createPersonalizado = async (personalizadoData) => {
        try {
            console.log('🚀 Iniciando creación de producto personalizado...');
            console.log('📝 Datos a enviar:', JSON.stringify(personalizadoData, null, 2));
            
            const headers = getAuthHeaders();
            console.log('🔑 Headers:', headers);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/productosPersonalizados', {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(personalizadoData),
            });
            
            console.log('📡 Respuesta POST:', response.status, response.statusText);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('✅ Personalizado creado - Respuesta completa:', responseData);
                console.log('✅ Tipo de respuesta:', typeof responseData);
                
                // Extraer el personalizado creado según diferentes estructuras posibles
                let newPersonalizado = null;
                if (responseData.personalizado) {
                    newPersonalizado = responseData.personalizado;
                    console.log('✅ Personalizado extraído de "personalizado"');
                } else if (responseData.data) {
                    newPersonalizado = responseData.data;
                    console.log('✅ Personalizado extraído de "data"');
                } else if (responseData._id || responseData.id) {
                    newPersonalizado = responseData;
                    console.log('✅ Respuesta es el personalizado directo');
                } else {
                    console.warn('⚠️ No se pudo extraer personalizado de la respuesta');
                    console.warn('⚠️ Recargando lista completa...');
                    await loadPersonalizados();
                    Alert.alert('Personalizado creado', 'El producto personalizado ha sido registrado exitosamente.');
                    return true;
                }
                
                if (newPersonalizado) {
                    console.log('📄 Nuevo personalizado a agregar:', newPersonalizado);
                    // Agregar al inicio de la lista
                    setPersonalizados(prev => {
                        const updated = [newPersonalizado, ...prev];
                        console.log('📊 Lista actualizada - Total:', updated.length);
                        return updated;
                    });
                }
                
                Alert.alert('Personalizado creado', 'El producto personalizado ha sido registrado exitosamente.');
                return true;
                
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                
                console.error('❌ Error del servidor al crear:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });
                
                Alert.alert('Error al crear personalizado', errorMessage);
                return false;
            }
        } catch (error) {
            console.error('💥 Error de red al crear personalizado:', error);
            console.error('💥 Stack:', error.stack);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // ACTUALIZAR PRODUCTO PERSONALIZADO
    const updatePersonalizado = async (personalizadoId, personalizadoData) => {
        try {
            console.log('📄 Actualizando personalizado:', personalizadoId);
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/productosPersonalizados/${personalizadoId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(personalizadoData),
            });
            
            if (response.ok) {
                const updatedPersonalizado = await response.json();
                console.log('✅ Personalizado actualizado:', updatedPersonalizado);
                
                setPersonalizados(prev =>
                    prev.map(personalizado => 
                        (personalizado._id === personalizadoId || personalizado.id === personalizadoId) 
                            ? updatedPersonalizado 
                            : personalizado
                    )
                );
                Alert.alert('Personalizado actualizado', 'Los datos del producto personalizado han sido actualizados.');
                return true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                Alert.alert('Error al actualizar personalizado', errorData.message || 'No se pudo actualizar el producto personalizado.');
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar personalizado:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // ELIMINAR PRODUCTO PERSONALIZADO
    const deletePersonalizado = async (personalizadoId) => {
        try {
            console.log('🗑️ Eliminando personalizado:', personalizadoId);
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/productosPersonalizados/${personalizadoId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            
            if (response.ok) {
                setPersonalizados(prev => prev.filter(personalizado => 
                    personalizado._id !== personalizadoId && personalizado.id !== personalizadoId
                ));
                Alert.alert('Personalizado eliminado', 'El producto personalizado ha sido eliminado exitosamente.');
                return true;
            } else {
                Alert.alert('Error al eliminar personalizado', 'No se pudo eliminar el producto personalizado.');
                return false;
            }
        } catch (error) {
            console.error('Error al eliminar personalizado:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // ACTUALIZAR ESTADO DEL PERSONALIZADO
    const updateEstado = async (personalizadoId, nuevoEstado) => {
        try {
            console.log('🔄 Actualizando estado:', personalizadoId, 'a:', nuevoEstado);
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/productosPersonalizados/${personalizadoId}/estado`, {
                method: 'PATCH',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });
            
            if (response.ok) {
                setPersonalizados(prev =>
                    prev.map(personalizado => 
                        (personalizado._id === personalizadoId || personalizado.id === personalizadoId)
                            ? { ...personalizado, estado: nuevoEstado }
                            : personalizado
                    )
                );
                Alert.alert('Estado actualizado', 'El estado del producto personalizado ha sido actualizado.');
                return true;
            } else {
                Alert.alert('Error al actualizar estado', 'No se pudo actualizar el estado.');
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // REFRESCAR
    const onRefresh = async () => {
        setRefreshing(true);
        await loadPersonalizados();
        setRefreshing(false);
    };

    // HANDLERS DE MODAL
    const handleViewMore = (personalizado, index) => {
        setSelectedPersonalizado(personalizado);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedPersonalizado(null);
        setSelectedIndex(0);
    };

    const handleOpenAddModal = () => setAddModalVisible(true);
    const handleCloseAddModal = () => setAddModalVisible(false);

    const handleCreatePersonalizado = async (personalizadoData) => {
        const success = await createPersonalizado(personalizadoData);
        if (success) handleCloseAddModal();
        return success;
    };

    // FILTRADO
    const filterAndSortPersonalizados = () => {
        let filtered = [...personalizados];
        
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            filtered = filtered.filter(personalizado =>
                personalizado.nombre?.toLowerCase().includes(searchLower) ||
                personalizado.descripcion?.toLowerCase().includes(searchLower) ||
                personalizado.clienteId?.nombre?.toLowerCase().includes(searchLower) ||
                personalizado.clienteId?.fullName?.toLowerCase().includes(searchLower) ||
                personalizado.categoria?.toLowerCase().includes(searchLower)
            );
        }
        
        switch (selectedEstadoFilter) {
            case 'Pendiente':
                filtered = filtered.filter(p => p.estado === 'pendiente');
                break;
            case 'En Proceso':
                filtered = filtered.filter(p => p.estado === 'en_proceso');
                break;
            case 'Completado':
                filtered = filtered.filter(p => p.estado === 'completado');
                break;
            case 'Cancelado':
                filtered = filtered.filter(p => p.estado === 'cancelado');
                break;
            case 'Entregado':
                filtered = filtered.filter(p => p.estado === 'entregado');
                break;
            default:
                // 'Todos' no filtra nada
        }
        
        // Ordenar por fecha de creación (más reciente primero)
        filtered.sort((a, b) => new Date(b.createdAt || b.fechaSolicitud) - new Date(a.createdAt || a.fechaSolicitud));
        return filtered;
    };

    // ESTADÍSTICAS
    const getPersonalizadosStats = () => {
        const total = Array.isArray(personalizados) ? personalizados.length : 0;
        const enProceso = Array.isArray(personalizados) ? personalizados.filter(p => p.estado === 'en_proceso').length : 0;
        const completados = Array.isArray(personalizados) ? personalizados.filter(p => p.estado === 'completado').length : 0;
        const pendientes = Array.isArray(personalizados) ? personalizados.filter(p => p.estado === 'pendiente').length : 0;
        const valorTotal = Array.isArray(personalizados)
            ? personalizados.reduce((acc, p) => {
                const precio = p.precioCalculado || p.cotizacion?.total || 0;
                return acc + precio;
              }, 0)
            : 0;
        return { total, enProceso, completados, pendientes, valorTotal };
    };

    useEffect(() => {
        setFilteredPersonalizados(filterAndSortPersonalizados());
    }, [personalizados, searchText, selectedEstadoFilter]);

    useEffect(() => {
        loadPersonalizados();
    }, []);

    return {
        personalizados,
        filteredPersonalizados,
        loading,
        refreshing,
        modalVisible,
        selectedPersonalizado,
        selectedIndex,
        addModalVisible,
        searchText,
        selectedEstadoFilter,
        loadPersonalizados,
        onRefresh,
        getPersonalizadosStats,
        createPersonalizado,
        updatePersonalizado,
        deletePersonalizado,
        updateEstado,
        handleViewMore,
        handleCloseModal,
        handleOpenAddModal,
        handleCloseAddModal,
        handleCreatePersonalizado,
        setSearchText,
        setSelectedEstadoFilter,
        filterAndSortPersonalizados
    };
};