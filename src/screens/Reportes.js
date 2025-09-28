import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDashboard } from '../hooks/useDashboard';
import { useI18n } from '../utils/i18n';
import { useFormatters } from '../utils/formatters';

const KPI = ({ label, value, color = '#009BBF' }) => (
  <View style={[styles.kpi, { borderColor: color }] }>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
  </View>
);

const Reportes = () => {
  const navigation = useNavigation();
  const { data, loading, from, to, setFrom, setTo, reload } = useDashboard();
  const { t } = useI18n();
  const { formatCurrency } = useFormatters();

  const stats = data?.stats || {};
  const totalIngresos = Number(stats?.totalIngresos || 0);
  const ventasDelMes = Number(stats?.ventasDelMes || 0);
  const citasHoy = Number(stats?.citasHoy || 0);
  const totalClientes = Number(stats?.totalClientes || 0);

  const ventasMensuales = Array.isArray(data?.ventasMensuales) ? data.ventasMensuales : [];
  const estadoCitas = Array.isArray(data?.estadoCitas) ? data.estadoCitas : [];
  const productosPopulares = Array.isArray(data?.productosPopulares) ? data.productosPopulares : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('reports_title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSubtitle}>{t('reports_subtitle')}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
        {/* Filtros por rango */}
        <View style={styles.filters}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Desde (YYYY-MM-DD)</Text>
            <TextInput style={styles.filterInput} value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" placeholderTextColor="#999" />
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Hasta (YYYY-MM-DD)</Text>
            <TextInput style={styles.filterInput} value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" placeholderTextColor="#999" />
          </View>
          <TouchableOpacity style={styles.reloadBtn} onPress={reload}>
            <Ionicons name="sync-outline" size={18} color="#FFF" />
            <Text style={styles.reloadText}>Actualizar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#009BBF" />
          </View>
        ) : (
          <>
            {/* KPIs */}
            <View style={styles.kpiRow}>
              <KPI label={t('kpi_income_month')} value={`${formatCurrency(totalIngresos)}`} color="#10B981" />
              <KPI label={t('kpi_sales_month')} value={String(ventasDelMes)} color="#009BBF" />
            </View>
            <View style={styles.kpiRow}>
              <KPI label={t('kpi_active_clients')} value={String(totalClientes)} color="#6B46C1" />
              <KPI label={t('kpi_today_appointments')} value={String(citasHoy)} color="#F59E0B" />
            </View>

            {/* Ventas mensuales (tabla simple) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('monthly_sales')}</Text>
              {ventasMensuales.length === 0 ? (
                <Text style={styles.emptyText}>No hay datos</Text>
              ) : (
                ventasMensuales.map((m, idx) => (
                  <View key={`${m.mes}-${idx}`} style={styles.row}> 
                    <Text style={styles.rowLeft}>{m.mes}</Text>
                    <Text style={styles.rowRight}>{String(m.ventas)} ventas · {formatCurrency(m.ingresos || 0)}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Estado de citas */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('appointment_status')}</Text>
              {estadoCitas.length === 0 ? (
                <Text style={styles.emptyText}>No hay datos</Text>
              ) : (
                estadoCitas.map((e, idx) => (
                  <View key={`${e.estado}-${idx}`} style={styles.row}> 
                    <Text style={styles.rowLeft}>{e.estado}</Text>
                    <Text style={styles.rowRight}>{String(e.cantidad)}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Productos populares */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('popular_products')}</Text>
              {productosPopulares.length === 0 ? (
                <Text style={styles.emptyText}>No hay datos</Text>
              ) : (
                productosPopulares.map((p, idx) => (
                  <View key={`${p._id}-${idx}`} style={styles.row}> 
                    <Text style={styles.rowLeft}>{p._id}</Text>
                    <Text style={styles.rowRight}>{String(p.cantidad)}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#009BBF', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: 'Lato-Bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, fontFamily: 'Lato-Regular', color: 'rgba(255,255,255,0.8)', textAlign: 'left' },

  content: { flex: 1 },
  loading: { paddingVertical: 40, alignItems: 'center' },

  filters: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  filterItem: { flex: 1 },
  filterLabel: { fontFamily: 'Lato-Bold', fontSize: 12, color: '#333', marginBottom: 4 },
  filterInput: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#FFF' },
  reloadBtn: { flexDirection: 'row', backgroundColor: '#009BBF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center', gap: 6 },
  reloadText: { color: '#FFF', fontFamily: 'Lato-Bold' },

  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpi: { flex: 1, borderRadius: 12, borderWidth: 2, padding: 12, backgroundColor: '#FFF' },
  kpiLabel: { fontFamily: 'Lato-Regular', color: '#666' },
  kpiValue: { fontFamily: 'Lato-Bold', fontSize: 18, marginTop: 4 },

  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', padding: 12, marginBottom: 12 },
  cardTitle: { fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowLeft: { fontFamily: 'Lato-Regular', color: '#333' },
  rowRight: { fontFamily: 'Lato-Bold', color: '#009BBF' },
  emptyText: { fontFamily: 'Lato-Regular', color: '#666' },
});

export default Reportes;
