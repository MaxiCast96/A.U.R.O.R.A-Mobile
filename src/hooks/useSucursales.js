import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para gestionar sucursales (CRUD + búsqueda y filtros)
 */
export const useSucursales = () => {
  const { getAuthHeaders } = useAuth();

  // Datos
  const [sucursales, setSucursales] = useState([]);
  const [filteredSucursales, setFilteredSucursales] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);

  // Filtros / búsqueda
  const [searchText, setSearchText] = useState('');
  const [selectedEstadoFilter, setSelectedEstadoFilter] = useState('todas'); // todas | activas | inactivas

  // Cargar sucursales
  const loadSucursales = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/sucursales', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setSucursales(Array.isArray(data) ? data : (data.sucursales || []));
      } else {
        Alert.alert('Error', 'No se pudieron cargar las sucursales');
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Crear sucursal
  const createSucursal = async (payload) => {
    try {
      const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/sucursales', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const created = data.sucursal || data;
        setSucursales(prev => [created, ...prev]);
        Alert.alert('Éxito', 'Sucursal creada exitosamente');
        return { ok: true, data: created };
      } else {
        Alert.alert('Error', data?.message || 'No se pudo crear la sucursal');
        return { ok: false };
      }
    } catch (error) {
      console.error('Error creando sucursal:', error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor');
      return { ok: false };
    }
  };

  // Actualizar sucursal
  const updateSucursal = async (id, payload) => {
    try {
      const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/sucursales/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        const updated = data.sucursal || data;
        setSucursales(prev => prev.map(s => (s._id === id ? updated : s)));
        Alert.alert('Éxito', 'Sucursal actualizada exitosamente');
        return { ok: true, data: updated };
      } else {
        Alert.alert('Error', data?.message || 'No se pudo actualizar la sucursal');
        return { ok: false };
      }
    } catch (error) {
      console.error('Error actualizando sucursal:', error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor');
      return { ok: false };
    }
  };

  // Eliminar sucursal
  const deleteSucursal = async (id) => {
    try {
      const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/sucursales/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setSucursales(prev => prev.filter(s => s._id !== id));
        Alert.alert('Éxito', 'Sucursal eliminada');
        return true;
      } else {
        Alert.alert('Error', 'No se pudo eliminar la sucursal');
        return false;
      }
    } catch (error) {
      console.error('Error eliminando sucursal:', error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor');
      return false;
    }
  };

  // Cambiar estado
  const updateSucursalEstado = async (id, activo) => {
    try {
      // Intento 1: PATCH parcial
      let response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/sucursales/${id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo }),
      });

      // Fallback: algunos backends esperan PUT para actualizar
      if (!response.ok) {
        // Intentar con payload completo si lo tenemos en memoria
        const current = sucursales.find(s => s._id === id) || {};
        const { _id, __v, createdAt, updatedAt, ...rest } = current;
        const putBody = { ...rest, activo };
        response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/sucursales/${id}`, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(putBody),
        });
      }

      if (response.ok) {
        setSucursales(prev => prev.map(s => (s._id === id ? { ...s, activo } : s)));
        return true;
      }
      let msg = 'No se pudo actualizar el estado';
      try {
        const errData = await response.json();
        if (errData?.message) msg = errData.message;
      } catch {}
      Alert.alert('Error', msg);
      return false;
    } catch (error) {
      console.error('Error actualizando estado sucursal:', error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor');
      return false;
    }
  };

  // Filtros + búsqueda
  const filterAndSort = () => {
    let list = [...sucursales];

    // Helper para convertir la dirección a texto si viene como objeto
    const addressToString = (d) => {
      if (!d) return '';
      if (typeof d === 'string') return d;
      if (typeof d === 'object') {
        const calle = d.calle || d.direccionDetallada || '';
        const ciudad = d.ciudad || d.municipio || '';
        const depto = d.departamento || '';
        return [calle, ciudad, depto].filter(Boolean).join(', ');
      }
      return '';
    };

    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      list = list.filter(s =>
        s.nombre?.toLowerCase().includes(q) ||
        (s.telefono ? String(s.telefono) : '').toLowerCase().includes(q) ||
        addressToString(s.direccion).toLowerCase().includes(q)
      );
    }

    if (selectedEstadoFilter !== 'todas') {
      list = list.filter(s => (selectedEstadoFilter === 'activas' ? s.activo === true : s.activo === false));
    }

    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSucursales();
    setRefreshing(false);
  };

  const handleViewMore = (sucursal) => {
    setSelectedSucursal(sucursal);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSucursal(null);
  };

  const handleOpenAddModal = () => setAddModalVisible(true);
  const handleCloseAddModal = () => setAddModalVisible(false);

  useEffect(() => {
    setFilteredSucursales(filterAndSort());
  }, [sucursales, searchText, selectedEstadoFilter]);

  useEffect(() => {
    loadSucursales();
  }, []);

  return {
    // datos
    sucursales,
    filteredSucursales,

    // ui
    loading,
    refreshing,
    addModalVisible,
    modalVisible,
    selectedSucursal,

    // filtros
    searchText,
    setSearchText,
    selectedEstadoFilter,
    setSelectedEstadoFilter,

    // acciones
    loadSucursales,
    onRefresh,
    createSucursal,
    updateSucursal,
    deleteSucursal,
    updateSucursalEstado,
    handleViewMore,
    handleCloseModal,
    handleOpenAddModal,
    handleCloseAddModal,
  };
};
