import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, RefreshControl, FlatList, ActivityIndicator, Alert, Platform, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSucursales } from '../hooks/useSucursales';
import SucursalItem from '../components/Sucursales/SucursalItem';
import AddSucursalModal from '../components/Sucursales/AddSucursalModal';
import EditSucursalModal from '../components/Sucursales/EditSucursalModal';
import SucursalDetailModal from '../components/Sucursales/SucursalDetailModal';
import MapaSucursalModal from '../components/Sucursales/MapaSucursalModal';

const Sucursales = () => {
  const navigation = useNavigation();
  const [editVisible, setEditVisible] = useState(false);
  const [sucursalForEdit, setSucursalForEdit] = useState(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [sucursalForMap, setSucursalForMap] = useState(null);

  const {
    filteredSucursales,
    loading,
    refreshing,
    addModalVisible,
    modalVisible,
    selectedSucursal,
    searchText,
    setSearchText,
    selectedEstadoFilter,
    setSelectedEstadoFilter,
    onRefresh,
    createSucursal,
    updateSucursal,
    deleteSucursal,
    updateSucursalEstado,
    handleViewMore,
    handleCloseModal,
    handleOpenAddModal,
    handleCloseAddModal,
  } = useSucursales();

  const showSuccess = (message) => {
    if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
    else Alert.alert('Éxito', message);
  };

  const handleAddSave = async (payload) => {
    const { ok } = await createSucursal(payload);
    if (ok) showSuccess('Sucursal creada correctamente');
    return ok;
  };

  const handleEdit = (sucursal) => {
    setSucursalForEdit(sucursal);
    setEditVisible(true);
  };

  const handleEditSave = async (id, payload) => {
    const { ok } = await updateSucursal(id, payload);
    if (ok) showSuccess('Sucursal actualizada');
    return ok;
  };

  const handleDelete = (sucursal) => {
    Alert.alert(
      'Eliminar sucursal',
      `¿Deseas eliminar la sucursal "${sucursal.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteSucursal(sucursal._id);
            if (ok) showSuccess('Sucursal eliminada');
          },
        },
      ]
    );
  };

  const handleToggleEstado = async (sucursal) => {
    const nuevoActivo = !sucursal.activo;
    const ok = await updateSucursalEstado(sucursal._id, nuevoActivo);
    if (ok) showSuccess(`Sucursal ${nuevoActivo ? 'activada' : 'desactivada'}`);
  };

  const handleViewMap = (sucursal) => {
    setSucursalForMap(sucursal);
    setMapModalVisible(true);
  };

  const handleCloseMapModal = () => {
    setMapModalVisible(false);
    setSucursalForMap(null);
  };

  const renderItem = ({ item }) => (
    <SucursalItem
      sucursal={item}
      onViewMore={() => handleViewMore(item)}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onToggleEstado={handleToggleEstado}
      onViewMap={() => handleViewMap(item)}
    />
  );

  const renderSeparator = () => <View style={{ height: 8 }} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="business-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>No hay sucursales</Text>
      <Text style={styles.emptySubtitle}>
        {searchText ? 'Sin resultados para tu búsqueda' : 'Agrega tu primera sucursal'}
      </Text>
      {!searchText && (
        <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
          <Text style={styles.addButtonText}>Añadir Sucursal</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sucursales</Text>
          <TouchableOpacity style={styles.headerAddButton} onPress={handleOpenAddModal}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Gestiona las sucursales de la óptica</Text>
      </View>

      {/* Búsqueda y filtros */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, teléfono o dirección..."
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

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedEstadoFilter === 'todas' && styles.filterChipActive]}
            onPress={() => setSelectedEstadoFilter('todas')}
          >
            <Text style={[styles.filterText, selectedEstadoFilter === 'todas' && styles.filterTextActive]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedEstadoFilter === 'activas' && styles.filterChipActive]}
            onPress={() => setSelectedEstadoFilter('activas')}
          >
            <Text style={[styles.filterText, selectedEstadoFilter === 'activas' && styles.filterTextActive]}>Activas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedEstadoFilter === 'inactivas' && styles.filterChipActive]}
            onPress={() => setSelectedEstadoFilter('inactivas')}
          >
            <Text style={[styles.filterText, selectedEstadoFilter === 'inactivas' && styles.filterTextActive]}>Inactivas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009BBF" />
            <Text style={styles.loadingText}>Cargando sucursales...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredSucursales}
            keyExtractor={(item, index) => String(item?._id ?? item?.id ?? index)}
            renderItem={renderItem}
            ItemSeparatorComponent={renderSeparator}
            ListEmptyComponent={renderEmpty}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#009BBF"]} tintColor="#009BBF" />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Modales */}
      <AddSucursalModal visible={addModalVisible} onClose={handleCloseAddModal} onSave={handleAddSave} />
      <EditSucursalModal visible={editVisible} sucursal={sucursalForEdit} onClose={() => setEditVisible(false)} onSave={handleEditSave} />
      <SucursalDetailModal visible={modalVisible} onClose={handleCloseModal} sucursal={selectedSucursal} />
      <MapaSucursalModal visible={mapModalVisible} onClose={handleCloseMapModal} sucursal={sucursalForMap} />
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E5E5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchIcon: { marginRight: 19 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Lato-Regular', color: '#1A1A1A' },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' },
  filterChipActive: { backgroundColor: '#009BBF' },
  filterText: { fontFamily: 'Lato-Bold', color: '#1A1A1A' },
  filterTextActive: { color: '#FFFFFF' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontFamily: 'Lato-Bold', color: '#666666', marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, fontFamily: 'Lato-Regular', color: '#999999', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  addButton: { backgroundColor: '#009BBF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 20 },
  addButtonText: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#FFFFFF' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 16, fontFamily: 'Lato-Regular', color: '#666666', marginTop: 12 },
});

export default Sucursales;