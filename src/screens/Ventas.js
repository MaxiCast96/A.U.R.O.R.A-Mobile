import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList, TextInput, ActivityIndicator, Alert, Platform, ToastAndroid, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useVentas } from '../hooks/useVentas';
import VentaItem from '../components/Ventas/VentaItem';
import AddVentaModal from '../components/Ventas/AddVentaModal';
import EditVentaModal from '../components/Ventas/EditVentaModal';
import { useI18n } from '../utils/i18n';

const Ventas = () => {
  const navigation = useNavigation();
  const { t } = useI18n();
  const [editVisible, setEditVisible] = useState(false);
  const [ventaForEdit, setVentaForEdit] = useState(null);
  const [detail, setDetail] = useState(null);

  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [metodoFilter, setMetodoFilter] = useState('Todos');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortKey, setSortKey] = useState('fecha'); // 'fecha' | 'total'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'

  const {
    filteredVentas,
    loading,
    refreshing,

    searchText,
    setSearchText,

    addModalVisible,
    modalVisible,
    selectedVenta,

    onRefresh,
    createVenta,
    updateVenta,
    deleteVenta,

    handleOpenAddModal,
    handleCloseAddModal,
  } = useVentas();

  const showSuccess = (message) => {
    if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
    else Alert.alert('Éxito', message);
  };

  const handleAddSave = async (payload) => {
    const ok = await createVenta(payload);
    if (ok) showSuccess('Venta creada');
    return ok;
  };

  const handleEdit = (venta) => { setVentaForEdit(venta); setEditVisible(true); };
  const handleEditSave = async (id, payload) => {
    const ok = await updateVenta(id, payload);
    if (ok) showSuccess('Venta actualizada');
    return ok;
  };

  const handleDelete = (venta) => {
    Alert.alert('Eliminar Venta', '¿Deseas eliminar esta venta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { const ok = await deleteVenta(venta._id); if (ok) showSuccess('Venta eliminada'); } }
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
    let list = filteredVentas.filter(v =>
      (estadoFilter === 'Todos' || String(v.estado).toLowerCase() === String(estadoFilter).toLowerCase()) &&
      (metodoFilter === 'Todos' || String(v.metodoPago).toLowerCase() === String(metodoFilter).toLowerCase()) &&
      (!from && !to ? true : inRange(v.fecha))
    );
    list.sort((a,b) => {
      const av = sortKey === 'total' ? (a.total||0) : new Date(a.fecha||0).getTime();
      const bv = sortKey === 'total' ? (b.total||0) : new Date(b.fecha||0).getTime();
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [filteredVentas, estadoFilter, metodoFilter, from, to, sortKey, sortDir]);

  const renderItem = ({ item }) => (
    <VentaItem
      venta={item}
      onView={() => setDetail(item)}
      onEdit={() => { setVentaForEdit(item); setEditVisible(true); }}
      onDelete={() => handleDelete(item)}
    />
  );

  const renderSeparator = () => <View style={{ height: 8 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('sales_title')}</Text>
          <TouchableOpacity style={styles.headerAddButton} onPress={handleOpenAddModal}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>{t('sales_subtitle')}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_sales_placeholder')}
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
        {/* Filtros */}
        <View style={{ marginTop: 10, gap: 8 }}>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
            {['Todos','pendiente','completada','procesada','cancelada'].map(st => (
              <TouchableOpacity key={st} style={[styles.chip, estadoFilter===st && styles.chipActive]} onPress={()=>setEstadoFilter(st)}>
                <Text style={[styles.chipText, estadoFilter===st && styles.chipTextActive]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
            {['Todos','efectivo','tarjeta_credito','transferencia'].map(m => (
              <TouchableOpacity key={m} style={[styles.chip, metodoFilter===m && styles.chipActive]} onPress={()=>setMetodoFilter(m)}>
                <Text style={[styles.chipText, metodoFilter===m && styles.chipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection:'row' }}>
            <TextInput style={[styles.textInput, { flex:1 }]} placeholder="Desde (YYYY-MM-DD)" value={from} onChangeText={setFrom} placeholderTextColor="#999" />
            <View style={{ width: 8 }} />
            <TextInput style={[styles.textInput, { flex:1 }]} placeholder="Hasta (YYYY-MM-DD)" value={to} onChangeText={setTo} placeholderTextColor="#999" />
          </View>
          <View style={{ flexDirection:'row', gap:8 }}>
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
            <Text style={styles.loadingText}>{t('loading_sales')}</Text>
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

      <AddVentaModal visible={addModalVisible} onClose={handleCloseAddModal} onSave={handleAddSave} />
      <EditVentaModal visible={editVisible} venta={ventaForEdit} onClose={() => setEditVisible(false)} onSave={handleEditSave} />

      {/* Detalle de venta */}
      <Modal visible={!!detail} animationType="slide" transparent onRequestClose={()=>setDetail(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de Venta</Text>
              <TouchableOpacity onPress={()=>setDetail(null)}>
                <Ionicons name="close" size={22} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            {detail ? (
              <View style={{ gap: 8 }}>
                <Text style={styles.detailLine}>Cliente: <Text style={styles.bold}>{detail.clienteNombre}</Text></Text>
                <Text style={styles.detailLine}>Estado: <Text style={styles.bold}>{detail.estado}</Text></Text>
                <Text style={styles.detailLine}>Fecha: <Text style={styles.bold}>{detail.fecha ? new Date(detail.fecha).toLocaleString('es-ES') : ''}</Text></Text>
                <Text style={styles.detailLine}>Total: <Text style={styles.bold}>${Number(detail.total||0).toFixed(2)}</Text></Text>
                <Text style={styles.detailLine}>Método: <Text style={styles.bold}>{detail.metodoPago}</Text></Text>
                <Text style={styles.detailLine}>Sucursal: <Text style={styles.bold}>{detail.sucursalNombre}</Text></Text>
                <Text style={styles.detailLine}>Factura: <Text style={styles.bold}>{detail.numeroFactura}</Text></Text>
                <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop: 8 }}>
                  <TouchableOpacity style={styles.editBtn} onPress={()=>{ setVentaForEdit(detail); setDetail(null); setEditVisible(true); }}>
                    <Ionicons name="create-outline" size={18} color="#FFF" />
                    <Text style={styles.editText}>Editar</Text>
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
  headerAddButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerSubtitle: { fontSize: 16, fontFamily: 'Lato-Regular', color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  searchContainer: { paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#F8F9FA' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E5E5', elevation: 2 },
  searchIcon: { marginRight: 19 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Lato-Regular', color: '#1A1A1A' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 16, fontFamily: 'Lato-Regular', color: '#666666', marginTop: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#009BBF20', borderColor: '#009BBF' },
  chipText: { color: '#1F2937', fontFamily: 'Lato-Regular', fontSize: 12 },
  chipTextActive: { color: '#007B99', fontFamily: 'Lato-Bold' },
  textInput: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFF', fontFamily: 'Lato-Regular', fontSize: 14, color: '#1A1A1A' },
  sortBtn: { flexDirection:'row', alignItems:'center', gap:6, borderWidth:1, borderColor:'#009BBF', paddingHorizontal:10, paddingVertical:8, borderRadius:8, backgroundColor:'#009BBF10' },
  sortText: { color:'#009BBF', fontFamily:'Lato-Bold' },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.25)', alignItems:'center', justifyContent:'flex-end' },
  modalCard: { width:'100%', backgroundColor:'#FFF', borderTopLeftRadius:16, borderTopRightRadius:16, padding:16, borderWidth:1, borderColor:'#E5E5E5' },
  modalHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  modalTitle: { fontFamily:'Lato-Bold', fontSize:16, color:'#1A1A1A' },
  detailLine: { fontFamily:'Lato-Regular', color:'#333' },
  bold: { fontFamily:'Lato-Bold', color:'#1A1A1A' },
  editBtn: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#6B46C1', paddingHorizontal:12, paddingVertical:10, borderRadius:8 },
  editText: { color:'#FFF', fontFamily:'Lato-Bold' },
});

export default Ventas;
