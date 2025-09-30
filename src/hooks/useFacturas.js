import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const useFacturas = () => {
  const { getAuthHeaders } = useAuth();

  const [facturas, setFacturas] = useState([]);
  const [filteredFacturas, setFilteredFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const loadFacturas = async () => {
    try {
      setLoading(true);
      const resp = await fetch('https://a-u-r-o-r-a.onrender.com/api/pedidos', {
        method: 'GET', headers: getAuthHeaders(),
      });
      if (!resp.ok) throw new Error('No se pudieron cargar las facturas');
      const data = await resp.json();
      setFacturas(Array.isArray(data) ? data : (data.pedidos || data.facturas || []));
    } catch (e) {
      console.error('Facturas load error:', e);
      Alert.alert('Error', 'No se pudieron cargar las facturas');
    } finally { setLoading(false); }
  };

  const deleteFactura = async (id) => {
    try {
      const resp = await fetch(`https://a-u-r-o-r-a.onrender.com/api/pedidos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!resp.ok) { Alert.alert('Error', 'No se pudo eliminar la factura'); return false; }
      setFacturas(prev => prev.filter(f => f._id !== id));
      return true;
    } catch (e) {
      console.error('Delete factura error:', e);
      Alert.alert('Error', 'No se pudo eliminar la factura');
      return false;
    }
  };

  const onRefresh = async () => { setRefreshing(true); await loadFacturas(); setRefreshing(false); };

  const filterList = () => {
    const q = searchText.trim().toLowerCase();
    let list = [...facturas];
    if (q) {
      list = list.filter(f =>
        f.cliente?.nombre?.toLowerCase().includes(q) ||
        String(f.total || '').includes(q) ||
        f.estado?.toLowerCase().includes(q)
      );
    }
    list.sort((a,b) => new Date(b.fecha || b.createdAt || 0) - new Date(a.fecha || a.createdAt || 0));
    return list;
  };

  useEffect(() => { setFilteredFacturas(filterList()); }, [facturas, searchText]);
  useEffect(() => { loadFacturas(); }, []);

  return { facturas, filteredFacturas, searchText, setSearchText, loading, refreshing, onRefresh, loadFacturas, deleteFactura };
};
