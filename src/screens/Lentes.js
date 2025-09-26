import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ToastAndroid,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import LentesStatsCard from '../components/Lentes/LentesStatsCard';
import LentesFilter from '../components/Lentes/LentesFilter';
import LenteItem from '../components/Lentes/LenteItem';
import AddLenteModal from '../components/Lentes/AddLenteModal';
import EditLenteModal from '../components/Lentes/EditLenteModal';
import LenteDetailModal from '../components/Lentes/LenteDetailModal';
import { useLentes } from '../hooks/useLentes';

const BASE_URL = 'https://a-u-r-o-r-a.onrender.com/api';

// Constantes hardcodeadas (igual que en la aplicación web)
const MATERIALES_LENTES = [
  'Orgánico',
  'Policarbonato', 
  'Trivex',
  'Alto índice',
  'Cristal mineral',
  'CR-39',
  'Otro'
];

const COLORES_LENTES = [
  'Transparente',
  'Amarillo',
  'Azul',
  'Gris',
  'Marrón',
  'Verde',
  'Rosa',
  'Fotocromático',
  'Polarizado',
  'Espejado',
  'Degradado'
];

const TIPOS_LENTE = [
  'Monofocal',
  'Bifocal',
  'Progresivo',
  'Ocupacional'
];

/**
 * Pantalla de Gestión de Lentes
 * 
 * Esta pantalla replica la funcionalidad del sitio web de escritorio
 * para gestionar lentes de la óptica, incluyendo:
 * - Estadísticas de lentes (total, en promoción, stock total, valor inventario)
 * - Búsqueda por nombre, descripción, marca
 * - Filtros por tipo de lente y estado
 * - Lista de lentes con información completa
 * - Acciones para ver, editar y eliminar lentes
 * - Función para añadir nuevos lentes con modales
 * - CRUD completo funcional
 * 
 * Sigue el mismo diseño y colores del sitio web de escritorio
 * adaptado para dispositivos móviles.
 */
const Lentes = () => {
  const navigation = useNavigation();

  // --- ESTADOS PARA DATOS DE LA API (solo los que vienen del backend) ---
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Estados de modales
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLente, setSelectedLente] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Estados de búsqueda
  const [searchText, setSearchText] = useState('');

  // --- CARGAR DATOS DEL BACKEND (solo los que realmente existen) ---
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        setLoadingData(true);
        
        const [catRes, marRes, promRes, sucRes] = await Promise.all([
          axios.get(`${BASE_URL}/categoria`).catch(err => {
            console.warn('Error cargando categorías:', err.message);
            return { data: [] };
          }),
          axios.get(`${BASE_URL}/marcas`).catch(err => {
            console.warn('Error cargando marcas:', err.message);
            return { data: [] };
          }),
          axios.get(`${BASE_URL}/promociones`).catch(err => {
            console.warn('Error cargando promociones:', err.message);
            return { data: [] };
          }),
          axios.get(`${BASE_URL}/sucursales`).catch(err => {
            console.warn('Error cargando sucursales:', err.message);
            return { data: [] };
          })
        ]);

        setCategorias(Array.isArray(catRes.data) ? catRes.data : []);
        setMarcas(Array.isArray(marRes.data) ? marRes.data : []);
        setPromociones(Array.isArray(promRes.data) ? promRes.data : []);
        setSucursales(Array.isArray(sucRes.data) ? sucRes.data : []);

      } catch (error) {
        console.error('Error cargando datos del backend:', error);
        Alert.alert(
          'Error de carga', 
          'Algunos datos no se pudieron cargar del servidor.'
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchBackendData();
  }, []);

  // --- HOOK PERSONALIZADO ---
  const {
    filteredLentes,
    loading,
    refreshing,
    getLentesStats,
    onRefresh,
    createLente,
    updateLente,
    deleteLente,
    selectedTipoFilter,
    setSelectedTipoFilter,
  } = useLentes();

  /**
   * Mostrar notificación de éxito multiplataforma
   */
  const showSuccessMessage = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('Éxito', message, [{ text: 'Entendido', style: 'default' }]);
    }
  };

  // --- HANDLERS ---
  const handleViewDetail = (lente, index) => {
    setSelectedLente(lente);
    setSelectedIndex(index);
    setDetailModalVisible(true);
  };

  const handleEditLente = (lente) => {
    // Cerrar modal de detalle si está abierto
    if (detailModalVisible) {
      setDetailModalVisible(false);
    }
    
    setSelectedLente(lente);
    setEditModalVisible(true);
  };

  const handleDeleteLente = async (lente) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar el lente "${lente.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cerrar modal de detalle si está abierto
              if (detailModalVisible) {
                setDetailModalVisible(false);
                setSelectedLente(null);
              }

              const result = await deleteLente(lente._id || lente.id);
              if (result) {
                await onRefresh();
                showSuccessMessage('Lente eliminado exitosamente');
              }
            } catch (error) {
              console.error('Error al eliminar lente:', error);
              Alert.alert('Error', 'No se pudo eliminar el lente');
            }
          }
        }
      ]
    );
  };

  const handleCreateLente = async (data) => {
    try {
      console.log('Creando lente con datos:', data);
      const result = await createLente(data);
      if (result) {
        setAddModalVisible(false);
        await onRefresh();
        showSuccessMessage('Lente creado exitosamente');
      }
    } catch (error) {
      console.error('Error en handleCreateLente:', error);
      Alert.alert('Error', 'Hubo un problema al crear el lente');
    }
  };

  const handleUpdateLente = async (data) => {
    try {
      const result = await updateLente(selectedLente._id || selectedLente.id, data);
      if (result) {
        setEditModalVisible(false);
        setSelectedLente(null);
        await onRefresh();
        showSuccessMessage('Lente actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error en handleUpdateLente:', error);
      Alert.alert('Error', 'No se pudo actualizar el lente');
    }
  };

  // --- FILTRADO ---
  const filtered = Array.isArray(filteredLentes)
    ? filteredLentes.filter(lente => {
        const matchesSearch = !searchText || 
          lente.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
          lente.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ||
          lente.marcaId?.nombre?.toLowerCase().includes(searchText.toLowerCase());
        
        return matchesSearch;
      })
    : [];

  /**
   * Renderizar item de lente
   */
  const renderLenteItem = ({ item, index }) => (
    <LenteItem
      lente={item}
      onViewDetail={() => handleViewDetail(item, index)}
      onEdit={() => handleEditLente(item)}
      onDelete={() => handleDeleteLente(item)}
    />
  );

  /**
   * Renderizar separador entre items
   */
  const renderSeparator = () => <View style={styles.separator} />;

  /**
   * Renderizar estado vacío
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="glasses-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>No hay lentes</Text>
      <Text style={styles.emptySubtitle}>
        {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Añade tu primer lente para comenzar'}
      </Text>
      {!searchText && !loadingData && (
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>Añadir Lente</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Renderizar indicador de carga
   */
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00BCD4" />
      <Text style={styles.loadingText}>Cargando lentes...</Text>
    </View>
  );

  // Obtener estadísticas
  const stats = getLentesStats();

  return (
    <View style={styles.container}>
      {/* Header con título, botón atrás y botón añadir */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión de Lentes</Text>
          <TouchableOpacity 
            style={[styles.headerAddButton, loadingData && styles.headerAddButtonDisabled]}
            onPress={() => setAddModalVisible(true)}
            disabled={loadingData}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.headerSubtitle}>Administra el inventario de lentes de la óptica</Text>
        
        {/* Estadísticas integradas en el header */}
        <LentesStatsCard stats={stats} />
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, descripción o marca..."
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
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <LentesFilter
          selectedFilter={selectedTipoFilter}
          onFilterChange={setSelectedTipoFilter}
        />
      </View>

      {/* Lista de lentes */}
      <View style={styles.listContainer}>
        {loading ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item, index) => 
              item._id?.toString() || 
              item.id?.toString() || 
              `lente-${index}`
            }
            renderItem={renderLenteItem}
            ItemSeparatorComponent={renderSeparator}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#00BCD4']}
                tintColor="#00BCD4"
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Modal de agregar - Pasando constantes hardcodeadas */}
      <AddLenteModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleCreateLente}
        categorias={categorias}
        marcas={marcas}
        promociones={promociones}
        sucursales={sucursales}
        materiales={MATERIALES_LENTES}
        colores={COLORES_LENTES}
        tiposLente={TIPOS_LENTE}
      />

      <EditLenteModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedLente(null);
        }}
        lente={selectedLente}
        onSave={handleUpdateLente}
        categorias={categorias}
        marcas={marcas}
        promociones={promociones}
        sucursales={sucursales}
        materiales={MATERIALES_LENTES}
        colores={COLORES_LENTES}
        tiposLente={TIPOS_LENTE}
      />

      <LenteDetailModal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedLente(null);
        }}
        lente={selectedLente}
        index={selectedIndex}
        onEdit={handleEditLente}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#00BCD4',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: { 
    fontSize: 24,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerAddButton: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAddButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#1A1A1A',
  },
  filtersContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 6,
  },
  emptyContainer: { 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: { 
    fontSize: 20,
    fontFamily: 'Lato-Bold',
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    marginTop: 12,
  },
});

export default Lentes;