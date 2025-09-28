import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFormatters } from '../../utils/formatters';
import { useI18n } from '../../utils/i18n';

const VentaItem = ({ venta, onView, onEdit, onDelete }) => {
  const { formatCurrency, formatDate } = useFormatters();
  const { t } = useI18n();
  const total = venta?.total ?? 0;
  const fechaStr = formatDate(venta?.fecha);
  const cliente = venta?.cliente?.nombre || venta?.clienteNombre || 'Cliente';
  const metodo = venta?.metodoPago || '—';
  const sucursal = venta?.sucursal?.nombre || venta?.sucursalNombre || '—';
  const estado = (venta?.estado || '—').toString();

  const estadoColorMap = {
    pendiente: '#F59E0B',
    procesada: '#3B82F6',
    completada: '#10B981',
    cancelada: '#EF4444',
  };
  const dotColor = estadoColorMap[estado.toLowerCase?.()] || '#94A3B8';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{cliente}</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>
      <View style={styles.badgesRow}>
        <View style={[styles.badge, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
          <Ionicons name="ellipse" size={8} color={dotColor} />
          <Text style={[styles.badgeText, { color: '#475569' }]}>{estado}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
          <Ionicons name="card-outline" size={12} color="#0D9488" />
          <Text style={[styles.badgeText, { color: '#0D9488' }]}>{metodo}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.infoText}>{fechaStr}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="storefront-outline" size={16} color="#666" />
        <Text style={styles.infoText}>{t('branch')}: {sucursal}</Text>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onView}>
          <Ionicons name="eye-outline" size={18} color="#009BBF" />
          <Text style={[styles.actionText, { color: '#009BBF' }]}>{t('see')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="create-outline" size={18} color="#6B46C1" />
          <Text style={[styles.actionText, { color: '#6B46C1' }]}>{t('edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
          <Text style={[styles.actionText, { color: '#DC2626' }]}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EDEDED', padding: 14, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, shadowOffset:{width:0,height:2}, elevation:2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontFamily: 'Lato-Bold', fontSize: 16, color: '#1A1A1A' },
  total: { fontFamily: 'Lato-Bold', fontSize: 16, color: '#10B981' },
  badgesRow: { flexDirection:'row', gap:8, marginBottom: 6, alignItems:'center' },
  badge: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:8, paddingVertical:4, borderRadius:999, borderWidth:1 },
  badgeText: { fontFamily:'Lato-Bold', fontSize:12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  infoText: { fontFamily: 'Lato-Regular', fontSize: 14, color: '#333' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontFamily: 'Lato-Bold', fontSize: 13 },
});

export default VentaItem;
