import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const useAccesorios = () => {
    const { getAuthHeaders } = useAuth();

    // Estados principales
    const [accesorios, setAccesorios] = useState([]);
    const [filteredAccesorios, setFilteredAccesorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modales
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAccesorio, setSelectedAccesorio] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [addModalVisible, setAddModalVisible] = useState(false);

    // Filtros y búsqueda
    const [searchText, setSearchText] = useState('');
    const [selectedTipoFilter, setSelectedTipoFilter] = useState('Todos');

    // CARGAR ACCESORIOS
    const loadAccesorios = async () => {
        try {
            setLoading(true);
            console.log('📄 Cargando accesorios...');
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/accesorios', {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            
            console.log('📡 Respuesta del servidor:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📦 Datos recibidos:', data);
                console.log('📦 Tipo de datos:', typeof data);
                
                // Determinar estructura de respuesta
                let accesoriosArray = [];
                if (Array.isArray(data)) {
                    accesoriosArray = data;
                    console.log('✅ Datos son array directo');
                } else if (Array.isArray(data.accesorios)) {
                    accesoriosArray = data.accesorios;
                    console.log('✅ Datos en propiedad "accesorios"');
                } else if (Array.isArray(data.data)) {
                    accesoriosArray = data.data;
                    console.log('✅ Datos en propiedad "data"');
                } else {
                    console.warn('⚠️ Estructura de respuesta desconocida');
                    accesoriosArray = [];
                }
                
                console.log('📊 Total accesorios cargados:', accesoriosArray.length);
                setAccesorios(accesoriosArray);
            } else {
                console.error('❌ Error de servidor:', response.status);
                const errorText = await response.text();
                console.error('❌ Detalle del error:', errorText);
                Alert.alert('Error de conexión', 'No se pudieron cargar los accesorios.');
                setAccesorios([]);
            }
        } catch (error) {
            console.error('💥 Error de red al cargar accesorios:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            setAccesorios([]);
        } finally {
            setLoading(false);
        }
    };

    // CREAR ACCESORIO - CON DEBUG COMPLETO
    const createAccesorio = async (accesorioData) => {
        try {
            console.log('🚀 Iniciando creación de accesorio...');
            console.log('📋 Datos a enviar:', JSON.stringify(accesorioData, null, 2));
            
            const headers = getAuthHeaders();
            console.log('🔑 Headers:', headers);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/accesorios', {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accesorioData),
            });
            
            console.log('📡 Respuesta POST:', response.status, response.statusText);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('✅ Accesorio creado - Respuesta completa:', responseData);
                console.log('✅ Tipo de respuesta:', typeof responseData);
                
                // Extraer el accesorio creado según diferentes estructuras posibles
                let newAccesorio = null;
                if (responseData.accesorio) {
                    newAccesorio = responseData.accesorio;
                    console.log('✅ Accesorio extraído de "accesorio"');
                } else if (responseData.data) {
                    newAccesorio = responseData.data;
                    console.log('✅ Accesorio extraído de "data"');
                } else if (responseData._id || responseData.id) {
                    newAccesorio = responseData;
                    console.log('✅ Respuesta es el accesorio directo');
                } else {
                    console.warn('⚠️ No se pudo extraer accesorio de la respuesta');
                    console.warn('⚠️ Recargando lista completa...');
                    await loadAccesorios();
                    Alert.alert('Accesorio creado', 'El accesorio ha sido registrado exitosamente.');
                    return true;
                }
                
                if (newAccesorio) {
                    console.log('📄 Nuevo accesorio a agregar:', newAccesorio);
                    // Agregar al inicio de la lista
                    setAccesorios(prev => {
                        const updated = [newAccesorio, ...prev];
                        console.log('📊 Lista actualizada - Total:', updated.length);
                        return updated;
                    });
                }
                
                Alert.alert('Accesorio creado', 'El accesorio ha sido registrado exitosamente.');
                return true;
                
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                
                console.error('❌ Error del servidor al crear:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });
                
                Alert.alert('Error al crear accesorio', errorMessage);
                return false;
            }
        } catch (error) {
            console.error('💥 Error de red al crear accesorio:', error);
            console.error('💥 Stack:', error.stack);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // ACTUALIZAR ACCESORIO
    const updateAccesorio = async (accesorioId, accesorioData) => {
        try {
            console.log('📄 Actualizando accesorio:', accesorioId);
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/accesorios/${accesorioId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accesorioData),
            });
            
            if (response.ok) {
                const updatedAccesorio = await response.json();
                console.log('✅ Accesorio actualizado:', updatedAccesorio);
                
                setAccesorios(prev =>
                    prev.map(accesorio => 
                        (accesorio._id === accesorioId || accesorio.id === accesorioId) ? updatedAccesorio : accesorio
                    )
                );
                Alert.alert('Accesorio actualizado', 'Los datos del accesorio han sido actualizados.');
                return true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                Alert.alert('Error al actualizar accesorio', errorData.message || 'No se pudo actualizar el accesorio.');
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar accesorio:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // ELIMINAR ACCESORIO
    const deleteAccesorio = async (accesorioId) => {
        try {
            console.log('🗑️ Eliminando accesorio:', accesorioId);
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/accesorios/${accesorioId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            
            if (response.ok) {
                setAccesorios(prev => prev.filter(accesorio => 
                    accesorio._id !== accesorioId && accesorio.id !== accesorioId
                ));
                Alert.alert('Accesorio eliminado', 'El accesorio ha sido eliminado exitosamente.');
                return true;
            } else {
                Alert.alert('Error al eliminar accesorio', 'No se pudo eliminar el accesorio.');
                return false;
            }
        } catch (error) {
            console.error('Error al eliminar accesorio:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // REFRESCAR
    const onRefresh = async () => {
        setRefreshing(true);
        await loadAccesorios();
        setRefreshing(false);
    };

    // HANDLERS DE MODAL
    const handleViewMore = (accesorio, index) => {
        setSelectedAccesorio(accesorio);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedAccesorio(null);
        setSelectedIndex(0);
    };

    const handleOpenAddModal = () => setAddModalVisible(true);
    const handleCloseAddModal = () => setAddModalVisible(false);

    const handleCreateAccesorio = async (accesorioData) => {
        const success = await createAccesorio(accesorioData);
        if (success) handleCloseAddModal();
        return success;
    };

    // FILTRADO
    const filterAndSortAccesorios = () => {
        let filtered = [...accesorios];
        
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            filtered = filtered.filter(accesorio =>
                accesorio.nombre?.toLowerCase().includes(searchLower) ||
                accesorio.descripcion?.toLowerCase().includes(searchLower) ||
                accesorio.marcaId?.nombre?.toLowerCase().includes(searchLower) ||
                accesorio.tipo?.nombre?.toLowerCase().includes(searchLower)
            );
        }
        
        switch (selectedTipoFilter) {
            case 'En Promoción':
                filtered = filtered.filter(accesorio => accesorio.enPromocion);
                break;
            case 'Sin Promoción':
                filtered = filtered.filter(accesorio => !accesorio.enPromocion);
                break;
            case 'Con Stock':
                filtered = filtered.filter(accesorio =>
                    Array.isArray(accesorio.sucursales)
                        ? accesorio.sucursales.some(s => s.stock > 0)
                        : (accesorio.stock > 0)
                );
                break;
            case 'Sin Stock':
                filtered = filtered.filter(accesorio =>
                    Array.isArray(accesorio.sucursales)
                        ? accesorio.sucursales.every(s => s.stock === 0)
                        : (accesorio.stock === 0)
                );
                break;
            case 'Precio Alto':
                filtered = filtered.filter(accesorio => {
                    const precio = accesorio.precioActual || accesorio.precioBase || 0;
                    return precio > 100; // Umbral configurable
                });
                break;
            case 'Precio Bajo':
                filtered = filtered.filter(accesorio => {
                    const precio = accesorio.precioActual || accesorio.precioBase || 0;
                    return precio <= 100; // Umbral configurable
                });
                break;
            default:
                // 'Todos' no filtra nada
        }
        
        // Ordenar por fecha de creación (más reciente primero)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return filtered;
    };

    // ESTADÍSTICAS
    const getAccesoriosStats = () => {
        const total = Array.isArray(accesorios) ? accesorios.length : 0;
        const promocion = Array.isArray(accesorios) ? accesorios.filter(a => a.enPromocion).length : 0;
        const precioPromedio = Array.isArray(accesorios) && accesorios.length > 0
            ? accesorios.reduce((acc, a) => acc + (a.precioActual || a.precioBase || 0), 0) / accesorios.length
            : 0;
        const stock = Array.isArray(accesorios)
            ? accesorios.reduce((acc, a) => acc + (
                Array.isArray(a.sucursales)
                    ? a.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0)
                    : (a.stock || 0)
              ), 0)
            : 0;
        return { total, promocion, precioPromedio, stock };
    };

    useEffect(() => {
        setFilteredAccesorios(filterAndSortAccesorios());
    }, [accesorios, searchText, selectedTipoFilter]);

    useEffect(() => {
        loadAccesorios();
    }, []);

    return {
        accesorios,
        filteredAccesorios,
        loading,
        refreshing,
        modalVisible,
        selectedAccesorio,
        selectedIndex,
        addModalVisible,
        searchText,
        selectedTipoFilter,
        loadAccesorios,
        onRefresh,
        getAccesoriosStats,
        createAccesorio,
        updateAccesorio,
        deleteAccesorio,
        handleViewMore,
        handleCloseModal,
        handleOpenAddModal,
        handleCloseAddModal,
        handleCreateAccesorio,
        setSearchText,
        setSelectedTipoFilter,
        filterAndSortAccesorios
    };
};