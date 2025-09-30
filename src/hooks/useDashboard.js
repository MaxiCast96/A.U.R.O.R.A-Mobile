import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const useDashboard = () => {
  const { getAuthHeaders, verifyToken } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [from, setFrom] = useState(''); // YYYY-MM-DD
  const [to, setTo] = useState('');   // YYYY-MM-DD

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const ok = await verifyToken();
      if (!ok) {
        throw new Error('Sesión no válida. Inicia sesión nuevamente.');
      }
      // Preferir endpoint unificado /api/dashboard/all
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const allUrl = `https://a-u-r-o-r-a.onrender.com/api/dashboard/all${params.toString() ? `?${params.toString()}` : ''}`;
      let resp = await fetch(allUrl, { headers: getAuthHeaders() });
      let json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (resp.status === 401) throw new Error(json?.message || 'No autorizado: token inválido o ausente');
        // Fallback a /api/dashboard/stats si no existe /all
        const statsUrl = `https://a-u-r-o-r-a.onrender.com/api/dashboard/stats${params.toString() ? `?${params.toString()}` : ''}`;
        resp = await fetch(statsUrl, { headers: getAuthHeaders() });
        json = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          if (resp.status === 401) throw new Error(json?.message || 'No autorizado: token inválido o ausente');
          const msg = json?.message || 'No se pudo obtener dashboard';
          throw new Error(msg);
        }
        // Solo stats disponibles
        setData({ stats: json?.data ?? json });
        return;
      }
      // json esperado: { success: true, data: { stats, ventasMensuales, estadoCitas, productosPopulares } }
      const payload = json?.data ? json.data : json;
      const normalized = {
        stats: payload?.stats || payload,
        ventasMensuales: payload?.ventasMensuales || [],
        estadoCitas: payload?.estadoCitas || [],
        productosPopulares: payload?.productosPopulares || [],
      };
      setData(normalized);
    } catch (e) {
      console.error('Dashboard error:', e);
      setError(e?.message || 'No se pudo cargar');
      Alert.alert('Error', e?.message || 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { data, loading, error, from, to, setFrom, setTo, reload: load };
};
