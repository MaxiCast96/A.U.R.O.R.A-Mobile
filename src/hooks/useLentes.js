import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const useLentes = () => {
    const { getAuthHeaders } = useAuth();

    // Estados principales
    const [lentes, setLentes] = useState([]);
    const [filteredLentes, setFilteredLentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modales
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLente, setSelectedLente] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [addModalVisible, setAddModalVisible] = useState(false);

    // Filtros y búsqueda
    const [searchText, setSearchText] = useState('');
    const [selectedTipoFilter, setSelectedTipoFilter] = useState('Todos');

    // CARGAR LENTES
    const loadLentes = async () => {
        try {
            setLoading(true);
            console.log('🔄 Cargando lentes...');
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/lentes', {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            
            console.log('📡 Respuesta del servidor:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📦 Datos recibidos:', data);
                console.log('📦 Tipo de datos:', typeof data);
                
                // Determinar estructura de respuesta
                let lentesArray = [];
                if (Array.isArray(data)) {
                    lentesArray = data;
                    console.log('✅ Datos son array directo');
                } else if (Array.isArray(data.lentes)) {
                    lentesArray = data.lentes;
                    console.log('✅ Datos en propiedad "lentes"');
                } else if (Array.isArray(data.data)) {
                    lentesArray = data.data;
                    console.log('✅ Datos en propiedad "data"');
                } else {
                    console.warn('⚠️ Estructura de respuesta desconocida');
                    lentesArray = [];
                }
                
                console.log('📊 Total lentes cargados:', lentesArray.length);
                setLentes(lentesArray);
            } else {
                console.error('❌ Error de servidor:', response.status);
                const errorText = await response.text();
                console.error('❌ Detalle del error:', errorText);
                Alert.alert('Error de conexión', 'No se pudieron cargar los lentes.');
                setLentes([]);
            }
        } catch (error) {
            console.error('💥 Error de red al cargar lentes:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            setLentes([]);
        } finally {
            setLoading(false);
        }
    };

    // CREAR LENTE - CON DEBUG COMPLETO
    const createLente = async (lenteData) => {
        try {
            console.log('🚀 Iniciando creación de lente...');
            console.log('📝 Datos a enviar:', JSON.stringify(lenteData, null, 2));
            
            const headers = getAuthHeaders();
            console.log('🔑 Headers:', headers);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/lentes', {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lenteData),
            });
            
            console.log('📡 Respuesta POST:', response.status, response.statusText);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('✅ Lente creado - Respuesta completa:', responseData);
                console.log('✅ Tipo de respuesta:', typeof responseData);
                
                // Extraer el lente creado según diferentes estructuras posibles
                let newLente = null;
                if (responseData.lente) {
                    newLente = responseData.lente;
                    console.log('✅ Lente extraído de "lente"');
                } else if (responseData.data) {
                    newLente = responseData.data;
                    console.log('✅ Lente extraído de "data"');
                } else if (responseData._id || responseData.id) {
                    newLente = responseData;
                    console.log('✅ Respuesta es el lente directo');
                } else {
                    console.warn('⚠️ No se pudo extraer lente de la respuesta');
                    console.warn('⚠️ Recargando lista completa...');
                    await loadLentes();
                    Alert.alert('Lente creado', 'El lente ha sido registrado exitosamente.');
                    return true;
                }
                
                if (newLente) {
                    console.log('📄 Nuevo lente a agregar:', newLente);
                    // Agregar al inicio de la lista
                    setLentes(prev => {
                        const updated = [newLente, ...prev];
                        console.log('📊 Lista actualizada - Total:', updated.length);
                        return updated;
                    });
                }
                
                Alert.alert('Lente creado', 'El lente ha sido registrado exitosamente.');
                return true;
                
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                
                console.error('❌ Error del servidor al crear:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });
                
                Alert.alert('Error al crear lente', errorMessage);
                return false;
            }
        } catch (error) {
            console.error('💥 Error de red al crear lente:', error);
            console.error('💥 Stack:', error.stack);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // ACTUALIZAR LENTE
    const updateLente = async (lenteId, lenteData) => {
        try {
            console.log('🔄 Actualizando lente:', lenteId);
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/lentes/${lenteId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lenteData),
            });
            
            if (response.ok) {
                const updatedLente = await response.json();
                console.log('✅ Lente actualizado:', updatedLente);
                
                setLentes(prev =>
                    prev.map(lente => 
                        (lente._id === lenteId || lente.id === lenteId) ? updatedLente : lente
                    )
                );
                Alert.alert('Lente actualizado', 'Los datos del lente han sido actualizados.');
                return true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                Alert.alert('Error al actualizar lente', errorData.message || 'No se pudo actualizar el lente.');
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar lente:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // ELIMINAR LENTE
    const deleteLente = async (lenteId) => {
        try {
            console.log('🗑️ Eliminando lente:', lenteId);
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/lentes/${lenteId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            
            if (response.ok) {
                setLentes(prev => prev.filter(lente => 
                    lente._id !== lenteId && lente.id !== lenteId
                ));
                Alert.alert('Lente eliminado', 'El lente ha sido eliminado exitosamente.');
                return true;
            } else {
                Alert.alert('Error al eliminar lente', 'No se pudo eliminar el lente.');
                return false;
            }
        } catch (error) {
            console.error('Error al eliminar lente:', error);
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        }
    };

    // REFRESCAR
    const onRefresh = async () => {
        setRefreshing(true);
        await loadLentes();
        setRefreshing(false);
    };

    // HANDLERS DE MODAL
    const handleViewMore = (lente, index) => {
        setSelectedLente(lente);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedLente(null);
        setSelectedIndex(0);
    };

    const handleOpenAddModal = () => setAddModalVisible(true);
    const handleCloseAddModal = () => setAddModalVisible(false);

    const handleCreateLente = async (lenteData) => {
        const success = await createLente(lenteData);
        if (success) handleCloseAddModal();
        return success;
    };

    // FILTRADO
    const filterAndSortLentes = () => {
        let filtered = [...lentes];
        
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            filtered = filtered.filter(lente =>
                lente.nombre?.toLowerCase().includes(searchLower) ||
                lente.marcaId?.nombre?.toLowerCase().includes(searchLower) ||
                lente.categoriaId?.nombre?.toLowerCase().includes(searchLower)
            );
        }
        
        switch (selectedTipoFilter) {
            case 'En Promoción':
                filtered = filtered.filter(lente => lente.enPromocion);
                break;
            case 'Sin Promoción':
                filtered = filtered.filter(lente => !lente.enPromocion);
                break;
            case 'Con Stock':
                filtered = filtered.filter(lente =>
                    Array.isArray(lente.sucursales)
                        ? lente.sucursales.some(s => s.stock > 0)
                        : (lente.stock > 0)
                );
                break;
            case 'Sin Stock':
                filtered = filtered.filter(lente =>
                    Array.isArray(lente.sucursales)
                        ? lente.sucursales.every(s => s.stock === 0)
                        : (lente.stock === 0)
                );
                break;
            case 'Monofocal':
            case 'Bifocal':
            case 'Progresivo':
            case 'Ocupacional':
                filtered = filtered.filter(lente => lente.tipoLente?.toLowerCase() === selectedTipoFilter.toLowerCase());
                break;
            default:
                // 'Todos' no filtra nada
        }
        
        // Ordenar por fecha de creación (más reciente primero)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return filtered;
    };

    // ESTADÍSTICAS
    const getLentesStats = () => {
        const total = Array.isArray(lentes) ? lentes.length : 0;
        const promocion = Array.isArray(lentes) ? lentes.filter(l => l.enPromocion).length : 0;
        const stock = Array.isArray(lentes)
            ? lentes.reduce((acc, l) => acc + (
                Array.isArray(l.sucursales)
                    ? l.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0)
                    : (l.stock || 0)
              ), 0)
            : 0;
        const valorInventario = Array.isArray(lentes)
            ? lentes.reduce((acc, l) => {
                const precio = l.precioActual || l.precioBase || 0;
                const stockLente = Array.isArray(l.sucursales)
                    ? l.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0)
                    : (l.stock || 0);
                return acc + (precio * stockLente);
              }, 0)
            : 0;
        return { total, promocion, stock, valorInventario };
    };

    useEffect(() => {
        setFilteredLentes(filterAndSortLentes());
    }, [lentes, searchText, selectedTipoFilter]);

    useEffect(() => {
        loadLentes();
    }, []);

    return {
        lentes,
        filteredLentes,
        loading,
        refreshing,
        modalVisible,
        selectedLente,
        selectedIndex,
        addModalVisible,
        searchText,
        selectedTipoFilter,
        loadLentes,
        onRefresh,
        getLentesStats,
        createLente,
        updateLente,
        deleteLente,
        handleViewMore,
        handleCloseModal,
        handleOpenAddModal,
        handleCloseAddModal,
        handleCreateLente,
        setSearchText,
        setSelectedTipoFilter,
        filterAndSortLentes
    };
};