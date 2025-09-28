import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const useVentas = () => {
  const { getAuthHeaders } = useAuth();

  const [ventas, setVentas] = useState([]);
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);

  const normalizeVenta = (v) => ({
    _id: v._id,
    clienteNombre: v.facturaDatos?.nombreCliente || v.facturaDatos?.clienteId?.nombre || v.cliente?.nombre || v.clienteNombre || '—',
    total: v.facturaDatos?.total ?? v.total ?? 0,
    metodoPago: v.datosPago?.metodoPago || v.metodoPago || '—',
    sucursalNombre: v.sucursalId?.nombre || v.sucursal?.nombre || '—',
    fecha: v.fecha || v.createdAt,
    estado: v.estado || '—',
    numeroFactura: v.facturaDatos?.numeroFactura || '—',
    raw: v,
  });

  const loadVentas = async () => {
    try {
      setLoading(true);
      const resp = await fetch('https://a-u-r-o-r-a.onrender.com/api/ventas', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!resp.ok) throw new Error('No se pudieron obtener las ventas');
      const data = await resp.json();
      const raw = Array.isArray(data) ? data : (data.ventas || []);
      const normalized = raw.map(normalizeVenta);
      setVentas(normalized);
    } catch (e) {
      console.error('Ventas load error:', e);
      Alert.alert('Error', 'No se pudieron cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const createVenta = async (payload) => {
    try {
      const resp = await fetch('https://a-u-r-o-r-a.onrender.com/api/ventas', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        Alert.alert('Error', data?.message || 'No se pudo crear la venta');
        return false;
      }
      const nueva = data.venta || data;
      const norm = normalizeVenta(nueva);
      setVentas(prev => [norm, ...prev]);
      return true;
    } catch (e) {
      console.error('Create venta error:', e);
      Alert.alert('Error', 'No se pudo crear la venta');
      return false;
    }
  };

  const updateVenta = async (id, payload) => {
    try {
      // Merge payload into existing raw structure to avoid losing nested data
      const current = ventas.find(v => v._id === id);
      const base = current?.raw ? JSON.parse(JSON.stringify(current.raw)) : {};
      // Map known fields into nested structure
      if (!base.datosPago) base.datosPago = {};
      if (!base.facturaDatos) base.facturaDatos = {};
      if (payload.clienteNombre !== undefined) base.facturaDatos.nombreCliente = payload.clienteNombre;
      if (payload.total !== undefined) {
        base.facturaDatos.total = payload.total;
        if (base.facturaDatos.subtotal === undefined || base.facturaDatos.subtotal === base.facturaDatos.total) {
          base.facturaDatos.subtotal = payload.total;
        }
      }
      if (payload.metodoPago !== undefined) base.datosPago.metodoPago = payload.metodoPago;
      if (payload.sucursalId !== undefined) base.sucursalId = payload.sucursalId;
      if (payload.fecha !== undefined) base.fecha = payload.fecha;
      if (payload.estado !== undefined) base.estado = payload.estado;

      const resp = await fetch(`https://a-u-r-o-r-a.onrender.com/api/ventas/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(base),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        Alert.alert('Error', data?.message || 'No se pudo actualizar la venta');
        return false;
      }
      const actualizada = data.venta || data;
      const norm = normalizeVenta(actualizada);
      setVentas(prev => prev.map(v => (v._id === id ? norm : v)));
      return true;
    } catch (e) {
      console.error('Update venta error:', e);
      Alert.alert('Error', 'No se pudo actualizar la venta');
      return false;
    }
  };

  const deleteVenta = async (id) => {
    try {
      const resp = await fetch(`https://a-u-r-o-r-a.onrender.com/api/ventas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!resp.ok) {
        Alert.alert('Error', 'No se pudo eliminar la venta');
        return false;
      }
      setVentas(prev => prev.filter(v => v._id !== id));
      return true;
    } catch (e) {
      console.error('Delete venta error:', e);
      Alert.alert('Error', 'No se pudo eliminar la venta');
      return false;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVentas();
    setRefreshing(false);
  };

  const handleViewMore = (venta) => { setSelectedVenta(venta); setModalVisible(true); };
  const handleCloseModal = () => { setSelectedVenta(null); setModalVisible(false); };
  const handleOpenAddModal = () => setAddModalVisible(true);
  const handleCloseAddModal = () => setAddModalVisible(false);

  const filterAndSort = () => {
    const q = searchText.trim().toLowerCase();
    let list = [...ventas];
    if (q) {
      list = list.filter(v =>
        v.clienteNombre?.toLowerCase().includes(q) ||
        String(v.total || '').includes(q) ||
        v.metodoPago?.toLowerCase().includes(q) ||
        v.sucursalNombre?.toLowerCase().includes(q) ||
        v.numeroFactura?.toLowerCase().includes(q) ||
        v.estado?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
    return list;
  };

  useEffect(() => { setFilteredVentas(filterAndSort()); }, [ventas, searchText]);
  useEffect(() => { loadVentas(); }, []);

  return {
    ventas,
    filteredVentas,
    loading,
    refreshing,

    searchText, setSearchText,

    addModalVisible,
    modalVisible,
    selectedVenta,

    loadVentas,
    createVenta,
    updateVenta,
    deleteVenta,

    onRefresh,
    handleViewMore,
    handleCloseModal,
    handleOpenAddModal,
    handleCloseAddModal,
  };
};
