import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFacturas } from '../hooks/useFacturas';
import { useFormatters } from '../utils/formatters';
import { useI18n } from '../utils/i18n';

const FacturaRow = ({ factura, onPress, onDelete }) => {
  const { formatCurrency, formatDate } = useFormatters();
  const { t } = useI18n();
  const cliente = factura.clienteId?.nombre || factura.clienteNombre || 'Cliente';
  const total = factura.total ?? 0;
  const estado = factura.estado || '—';
  const fechaStr = formatDate(factura.fecha);
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.rowTop}>
        <Text style={styles.title}>{cliente}</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.infoText}>{fechaStr}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Ionicons name="pricetag-outline" size={16} color="#666" />
        <Text style={styles.infoText}>Estado: {estado}</Text>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
          <Text style={[styles.actionText, { color: '#DC2626' }]}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const Facturas = () => {
  const navigation = useNavigation();
  const { t } = useI18n();
  const { filteredFacturas, loading, refreshing, searchText, setSearchText, onRefresh, deleteFactura } = useFacturas();

  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortKey, setSortKey] = useState('fecha'); // 'fecha' | 'total'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [detail, setDetail] = useState(null);

  const handleDelete = (factura) => {
    Alert.alert('Eliminar Factura', '¿Deseas eliminar esta factura?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteFactura(factura._id) }
    ]);
  };

  const displayList = useMemo(() => {
    const inRange = (d) => {
      if (!d) return false;
      const time = new Date(d).getTime();
      if (from) {
        const f = new Date(from).getTime();
        if (time < f) return false;
      }
      if (to) {
        const t = new Date(to).getTime() + 24*60*60*1000 - 1;
        if (time > t) return false;
      }
      return true;
    };
    let list = filteredFacturas.filter(f =>
      (estadoFilter === 'Todos' || String(f.estado).toLowerCase() === String(estadoFilter).toLowerCase())
      && (!from && !to ? true : inRange(f.fecha))
    );
    list.sort((a,b) => {
      const av = sortKey === 'total' ? (a.total||0) : new Date(a.fecha||0).getTime();
      const bv = sortKey === 'total' ? (b.total||0) : new Date(b.fecha||0).getTime();
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [filteredFacturas, estadoFilter, from, to, sortKey, sortDir]);

  const renderItem = ({ item }) => (
    <FacturaRow factura={item} onPress={() => setDetail(item)} onDelete={() => handleDelete(item)} />
  );

  const renderSeparator = () => <View style={{ height: 8 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('invoices_title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSubtitle}>{t('invoices_subtitle')}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_invoices_placeholder')}
            placeholderTextColor="#999999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          ) : null}
        </View>
        {/* Filtros rápidos */}
        <View style={styles.filtersRow}>
          <View style={styles.chipsRow}>
            {['Todos','creado','pendiente','completada','pagado','cancelado'].map(st => (
              <TouchableOpacity key={st} style={[styles.chip, estadoFilter===st && styles.chipActive]} onPress={()=>setEstadoFilter(st)}>
                <Text style={[styles.chipText, estadoFilter===st && styles.chipTextActive]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.rowInline}>
            <TextInput style={[styles.textInput, { flex:1 }]} placeholder="Desde (YYYY-MM-DD)" value={from} onChangeText={setFrom} placeholderTextColor="#999" />
            <View style={{ width: 8 }} />
            <TextInput style={[styles.textInput, { flex:1 }]} placeholder="Hasta (YYYY-MM-DD)" value={to} onChangeText={setTo} placeholderTextColor="#999" />
          </View>
          <View style={styles.rowInline}>
            <TouchableOpacity style={styles.sortBtn} onPress={()=>setSortKey(sortKey==='fecha'?'total':'fecha')}>
              <Ionicons name="swap-vertical-outline" size={18} color="#009BBF" />
              <Text style={styles.sortText}>{sortKey==='fecha'?'Ordenar por Total':'Ordenar por Fecha'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortBtn} onPress={()=>setSortDir(sortDir==='asc'?'desc':'asc')}>
              <Ionicons name="funnel-outline" size={18} color="#009BBF" />
              <Text style={styles.sortText}>{sortDir==='asc'?'Ascendente':'Descendente'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009BBF" />
            <Text style={styles.loadingText}>{t('loading_invoices')}</Text>
          </View>
        ) : (
          <FlatList
            data={displayList}
            keyExtractor={(item, index) => String(item?._id ?? item?.id ?? index)}
            renderItem={renderItem}
            ItemSeparatorComponent={renderSeparator}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#009BBF"]} tintColor="#009BBF" />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Detalle de factura */}
      <Modal visible={!!detail} animationType="slide" transparent onRequestClose={()=>setDetail(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de Factura</Text>
              <TouchableOpacity onPress={()=>setDetail(null)}>
                <Ionicons name="close" size={22} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            {detail ? (
              <View style={{ gap: 8 }}>
                <Text style={styles.detailLine}>Cliente: <Text style={styles.bold}>{detail.clienteId?.nombre || '—'}</Text></Text>
                <Text style={styles.detailLine}>Estado: <Text style={styles.bold}>{detail.estado}</Text></Text>
                <Text style={styles.detailLine}>Fecha: <Text style={styles.bold}>{detail.fecha ? new Date(detail.fecha).toLocaleString('es-ES') : ''}</Text></Text>
                <Text style={styles.detailLine}>Total: <Text style={styles.bold}>${Number(detail.total||0).toFixed(2)}</Text></Text>
                <View style={styles.itemsBox}>
                  <Text style={styles.itemsTitle}>Items</Text>
                  {Array.isArray(detail.items) && detail.items.length ? detail.items.map((it, idx)=>(
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemName}>{it.nombre}</Text>
                      <Text style={styles.itemQty}>x{it.cantidad}</Text>
                      <Text style={styles.itemPrice}>${Number(it.subtotal||0).toFixed(2)}</Text>
                    </View>
                  )) : <Text style={styles.emptyText}>Sin items</Text>}
                </View>
                <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop: 8 }}>
                  <TouchableOpacity style={styles.deleteButton} onPress={()=>{ const f=detail; setDetail(null); handleDelete(f); }}>
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#009BBF', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 24, fontFamily: 'Lato-Bold', color: '#FFFFFF', flex: 1, textAlign: 'center', marginHorizontal: 16 },
  headerSubtitle: { fontSize: 16, fontFamily: 'Lato-Regular', color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  searchContainer: { paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#F8F9FA' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E5E5', elevation: 2 },
  searchIcon: { marginRight: 19 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Lato-Regular', color: '#1A1A1A' },
  filtersRow: { marginTop: 10, gap: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#009BBF20', borderColor: '#009BBF' },
  chipText: { color: '#1F2937', fontFamily: 'Lato-Regular', fontSize: 12 },
  chipTextActive: { color: '#007B99', fontFamily: 'Lato-Bold' },
  rowInline: { flexDirection: 'row' },
  textInput: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFF', fontFamily: 'Lato-Regular', fontSize: 14, color: '#1A1A1A' },
  sortBtn: { flexDirection:'row', alignItems:'center', gap:6, borderWidth:1, borderColor:'#009BBF', paddingHorizontal:10, paddingVertical:8, borderRadius:8, backgroundColor:'#009BBF10', marginRight:8 },
  sortText: { color:'#009BBF', fontFamily:'Lato-Bold' },

  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 16, fontFamily: 'Lato-Regular', color: '#666666', marginTop: 12 },

  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', padding: 14 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontFamily: 'Lato-Bold', fontSize: 16, color: '#1A1A1A' },
  total: { fontFamily: 'Lato-Bold', fontSize: 16, color: '#10B981' },
  rowInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  infoText: { fontFamily: 'Lato-Regular', fontSize: 14, color: '#333' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontFamily: 'Lato-Bold', fontSize: 13 },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.25)', alignItems:'center', justifyContent:'flex-end' },
  modalCard: { width:'100%', backgroundColor:'#FFF', borderTopLeftRadius:16, borderTopRightRadius:16, padding:16, borderWidth:1, borderColor:'#E5E5E5' },
  modalHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  modalTitle: { fontFamily:'Lato-Bold', fontSize:16, color:'#1A1A1A' },
  detailLine: { fontFamily:'Lato-Regular', color:'#333' },
  bold: { fontFamily:'Lato-Bold', color:'#1A1A1A' },
  itemsBox: { marginTop:8, borderWidth:1, borderColor:'#E5E5E5', borderRadius:8, padding:8 },
  itemsTitle: { fontFamily:'Lato-Bold', color:'#1A1A1A', marginBottom:6 },
  itemRow: { flexDirection:'row', justifyContent:'space-between', paddingVertical:4, borderBottomWidth:1, borderBottomColor:'#F0F0F0' },
  itemName: { fontFamily:'Lato-Regular', color:'#333', flex:1 },
  itemQty: { fontFamily:'Lato-Regular', color:'#666', width:40, textAlign:'right' },
  itemPrice: { fontFamily:'Lato-Bold', color:'#009BBF', width:80, textAlign:'right' },
  deleteButton: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#DC2626', paddingHorizontal:12, paddingVertical:10, borderRadius:8 },
  deleteText: { color:'#FFF', fontFamily:'Lato-Bold' },
});

export default Facturas;
