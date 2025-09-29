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
import AccesoriosStatsCard from '../components/Accesorios/AccesoriosStatsCard';
import AccesoriosFilter from '../components/Accesorios/AccesorioFilter';
import AccesorioItem from '../components/Accesorios/AccesorioItem';
import AddAccesorioModal from '../components/Accesorios/AddAccesorioModal';
import EditAccesorioModal from '../components/Accesorios/EditAccesorioModal';
import AccesorioDetailModal from '../components/Accesorios/AccesorioDetailModal';
import { useAccesorios } from '../hooks/useAccesorios';

const BASE_URL = 'https://a-u-r-o-r-a.onrender.com/api';

// Constantes hardcodeadas para accesorios
const MATERIALES_ACCESORIOS = [
  'Acetato',
  'Metal',
  'Titanio',
  'Acero inoxidable',
  'Aluminio',
  'Plástico',
  'Silicona',
  'Cuero',
  'Tela',
  'Goma',
  'Otro'
];

const COLORES_ACCESORIOS = [
  'Negro',
  'Marrón',
  'Plateado',
  'Dorado',
  'Blanco',
  'Azul',
  'Rojo',
  'Verde',
  'Rosa',
  'Morado',
  'Amarillo',
  'Naranja',
  'Gris',
  'Multicolor',
  'Transparente'
];

/**
 * Pantalla de Gestión de Accesorios
 * 
 * Esta pantalla replica la funcionalidad del sitio web de escritorio
 * para gestionar accesorios de la óptica, incluyendo:
 * - Estadísticas de accesorios (total, en promoción, precio promedio, stock total)
 * - Búsqueda por nombre, descripción, marca
 * - Filtros por estado de promoción y disponibilidad
 * - Lista de accesorios con información completa
 * - Acciones para ver, editar y eliminar accesorios
 * - Función para añadir nuevos accesorios con modales
 * - CRUD completo funcional
 * 
 * Sigue el mismo diseño y colores del módulo de Lentes
 * adaptado para dispositivos móviles.
 */
const Accesorios = () => {
  const navigation = useNavigation();

  // --- ESTADOS PARA DATOS DE LA API ---
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Estados de modales
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAccesorio, setSelectedAccesorio] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Estados de búsqueda
  const [searchText, setSearchText] = useState('');

  // --- CARGAR DATOS DEL BACKEND ---
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
    filteredAccesorios,
    loading,
    refreshing,
    getAccesoriosStats,
    onRefresh,
    createAccesorio,
    updateAccesorio,
    deleteAccesorio,
    selectedTipoFilter,
    setSelectedTipoFilter,
  } = useAccesorios();

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
  const handleViewDetail = (accesorio, index) => {
    setSelectedAccesorio(accesorio);
    setSelectedIndex(index);
    setDetailModalVisible(true);
  };

  const handleEditAccesorio = (accesorio) => {
    // Cerrar modal de detalle si está abierto
    if (detailModalVisible) {
      setDetailModalVisible(false);
    }
    
    setSelectedAccesorio(accesorio);
    setEditModalVisible(true);
  };

  const handleDeleteAccesorio = async (accesorio) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar el accesorio "${accesorio.nombre}"?`,
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
                setSelectedAccesorio(null);
              }

              const result = await deleteAccesorio(accesorio._id || accesorio.id);
              if (result) {
                await onRefresh();
                showSuccessMessage('Accesorio eliminado exitosamente');
              }
            } catch (error) {
              console.error('Error al eliminar accesorio:', error);
              Alert.alert('Error', 'No se pudo eliminar el accesorio');
            }
          }
        }
      ]
    );
  };

  const handleCreateAccesorio = async (data) => {
    try {
      console.log('Creando accesorio con datos:', data);
      const result = await createAccesorio(data);
      if (result) {
        setAddModalVisible(false);
        await onRefresh();
        showSuccessMessage('Accesorio creado exitosamente');
      }
    } catch (error) {
      console.error('Error en handleCreateAccesorio:', error);
      Alert.alert('Error', 'Hubo un problema al crear el accesorio');
    }
  };

  const handleUpdateAccesorio = async (data) => {
    try {
      const result = await updateAccesorio(selectedAccesorio._id || selectedAccesorio.id, data);
      if (result) {
        setEditModalVisible(false);
        setSelectedAccesorio(null);
        await onRefresh();
        showSuccessMessage('Accesorio actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error en handleUpdateAccesorio:', error);
      Alert.alert('Error', 'No se pudo actualizar el accesorio');
    }
  };

  // --- FILTRADO ---
  const filtered = Array.isArray(filteredAccesorios)
    ? filteredAccesorios.filter(accesorio => {
        const matchesSearch = !searchText || 
          accesorio.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
          accesorio.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ||
          accesorio.marcaId?.nombre?.toLowerCase().includes(searchText.toLowerCase());
        
        return matchesSearch;
      })
    : [];

  /**
   * Renderizar item de accesorio
   */
  const renderAccesorioItem = ({ item, index }) => (
    <AccesorioItem
      accesorio={item}
      onViewDetail={() => handleViewDetail(item, index)}
      onEdit={() => handleEditAccesorio(item)}
      onDelete={() => handleDeleteAccesorio(item)}
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
      <Ionicons name="bag-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>No hay accesorios</Text>
      <Text style={styles.emptySubtitle}>
        {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Añade tu primer accesorio para comenzar'}
      </Text>
      {!searchText && !loadingData && (
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>Añadir Accesorio</Text>
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
      <Text style={styles.loadingText}>Cargando accesorios...</Text>
    </View>
  );

  // Obtener estadísticas
  const stats = getAccesoriosStats();

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
          <Text style={styles.headerTitle}>Gestión de Accesorios</Text>
          <TouchableOpacity 
            style={[styles.headerAddButton, loadingData && styles.headerAddButtonDisabled]}
            onPress={() => setAddModalVisible(true)}
            disabled={loadingData}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.headerSubtitle}>Administra el inventario de accesorios de la óptica</Text>
        
        {/* Estadísticas integradas en el header */}
        <AccesoriosStatsCard stats={stats} />
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
        <AccesoriosFilter
          selectedFilter={selectedTipoFilter}
          onFilterChange={setSelectedTipoFilter}
        />
      </View>

      {/* Lista de accesorios */}
      <View style={styles.listContainer}>
        {loading ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item, index) => 
              item._id?.toString() || 
              item.id?.toString() || 
              `accesorio-${index}`
            }
            renderItem={renderAccesorioItem}
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

      {/* Modal de agregar */}
      <AddAccesorioModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleCreateAccesorio}
        categorias={categorias}
        marcas={marcas}
        promociones={promociones}
        sucursales={sucursales}
        materiales={MATERIALES_ACCESORIOS}
        colores={COLORES_ACCESORIOS}
      />

      <EditAccesorioModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedAccesorio(null);
        }}
        accesorio={selectedAccesorio}
        onSave={handleUpdateAccesorio}
        categorias={categorias}
        marcas={marcas}
        promociones={promociones}
        sucursales={sucursales}
        materiales={MATERIALES_ACCESORIOS}
        colores={COLORES_ACCESORIOS}
      />

      <AccesorioDetailModal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedAccesorio(null);
        }}
        accesorio={selectedAccesorio}
        index={selectedIndex}
        onEdit={handleEditAccesorio}
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

export default Accesorios;