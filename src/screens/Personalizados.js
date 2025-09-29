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
import PersonalizadosStatsCard from '../components/Personalizados/PersonalizadosStatsCard';
import PersonalizadosFilter from '../components/Personalizados/PersonalizadosFilter';
import PersonalizadoItem from '../components/Personalizados/PersonalizadoItem';
import AddPersonalizadoModal from '../components/Personalizados/AddPersonalizadoModal';
import EditPersonalizadoModal from '../components/Personalizados/EditPersonalizadoModal';
import PersonalizadoDetailModal from '../components/Personalizados/PersonalizadosDetailModel';
import { usePersonalizados } from '../hooks/usePersonalizados';
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
 * Pantalla de Gestión de Productos Personalizados
 * 
 * Esta pantalla replica la funcionalidad del sitio web de escritorio
 * para gestionar productos personalizados de la óptica, incluyendo:
 * - Estadísticas de personalizados (total, en proceso, completados, valor total)
 * - Búsqueda por nombre, descripción, cliente
 * - Filtros por estado del personalizado
 * - Lista de personalizados con información completa
 * - Acciones para ver, editar y eliminar personalizados
 * - Función para añadir nuevos personalizados con modales
 * - CRUD completo funcional
 * - Gestión de estados del proceso
 * 
 * Sigue el mismo diseño y colores del sitio web de escritorio
 * adaptado para dispositivos móviles.
 */
const Personalizados = () => {
  const navigation = useNavigation();

  // --- HOOK PARA LENTES (REEMPLAZA LA LLAMADA MANUAL) ---
  const { lentes, loading: lentesLoading, error: lentesError, refetch: refetchLentes } = useLentes();

  // --- ESTADOS PARA DATOS DE LA API (sin incluir lentes) ---
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Estados de modales
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPersonalizado, setSelectedPersonalizado] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Estados de búsqueda
  const [searchText, setSearchText] = useState('');

  // ✅ NUEVO: Estado combinado para saber cuándo TODO está listo
  const allDataLoaded = !loadingData && !lentesLoading && Array.isArray(lentes) && lentes.length > 0;

  // --- CARGAR DATOS DEL BACKEND (sin lentes) ---
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        setLoadingData(true);
        
        const [catRes, marRes, cliRes] = await Promise.all([
          axios.get(`${BASE_URL}/categoria`).catch(err => {
            console.warn('Error cargando categorías:', err.message);
            return { data: [] };
          }),
          axios.get(`${BASE_URL}/marcas`).catch(err => {
            console.warn('Error cargando marcas:', err.message);
            return { data: [] };
          }),
          axios.get(`${BASE_URL}/clientes`).catch(err => {
            console.warn('Error cargando clientes:', err.message);
            return { data: [] };
          })
        ]);

        setCategorias(Array.isArray(catRes.data) ? catRes.data : []);
        setMarcas(Array.isArray(marRes.data) ? marRes.data : []);
        setClientes(Array.isArray(cliRes.data) ? cliRes.data : []);

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
    filteredPersonalizados,
    loading,
    refreshing,
    getPersonalizadosStats,
    onRefresh,
    createPersonalizado,
    updatePersonalizado,
    deletePersonalizado,
    updateEstado,
    selectedEstadoFilter,
    setSelectedEstadoFilter,
  } = usePersonalizados();

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
  const handleViewDetail = (personalizado, index) => {
    setSelectedPersonalizado(personalizado);
    setSelectedIndex(index);
    setDetailModalVisible(true);
  };

  const handleEditPersonalizado = (personalizado) => {
    // Cerrar modal de detalle si está abierto
    if (detailModalVisible) {
      setDetailModalVisible(false);
    }
    
    setSelectedPersonalizado(personalizado);
    setEditModalVisible(true);
  };

  const handleDeletePersonalizado = async (personalizado) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar el personalizado "${personalizado.nombre}"?`,
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
                setSelectedPersonalizado(null);
              }

              const result = await deletePersonalizado(personalizado._id || personalizado.id);
              if (result) {
                await onRefresh();
                showSuccessMessage('Personalizado eliminado exitosamente');
              }
            } catch (error) {
              console.error('Error al eliminar personalizado:', error);
              Alert.alert('Error', 'No se pudo eliminar el personalizado');
            }
          }
        }
      ]
    );
  };

  const handleCreatePersonalizado = async (data) => {
    try {
      console.log('Creando personalizado con datos:', data);
      const result = await createPersonalizado(data);
      if (result) {
        setAddModalVisible(false);
        await onRefresh();
        showSuccessMessage('Personalizado creado exitosamente');
      }
    } catch (error) {
      console.error('Error en handleCreatePersonalizado:', error);
      Alert.alert('Error', 'Hubo un problema al crear el personalizado');
    }
  };

  const handleUpdatePersonalizado = async (data) => {
    try {
      const result = await updatePersonalizado(selectedPersonalizado._id || selectedPersonalizado.id, data);
      if (result) {
        setEditModalVisible(false);
        setSelectedPersonalizado(null);
        await onRefresh();
        showSuccessMessage('Personalizado actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error en handleUpdatePersonalizado:', error);
      Alert.alert('Error', 'No se pudo actualizar el personalizado');
    }
  };

  const handleEstadoChange = async (personalizadoId, nuevoEstado) => {
    try {
      const result = await updateEstado(personalizadoId, nuevoEstado);
      if (result) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  // --- FILTRADO ---
  const filtered = Array.isArray(filteredPersonalizados)
    ? filteredPersonalizados.filter(personalizado => {
        const matchesSearch = !searchText || 
          personalizado.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
          personalizado.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ||
          personalizado.clienteId?.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
          personalizado.clienteId?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          personalizado.categoria?.toLowerCase().includes(searchText.toLowerCase());
        
        return matchesSearch;
      })
    : [];

  /**
   * Renderizar item de personalizado
   */
  const renderPersonalizadoItem = ({ item, index }) => (
    <PersonalizadoItem
      personalizado={item}
      onViewDetail={() => handleViewDetail(item, index)}
      onEdit={() => handleEditPersonalizado(item)}
      onDelete={() => handleDeletePersonalizado(item)}
      onEstadoChange={(nuevoEstado) => handleEstadoChange(item._id || item.id, nuevoEstado)}
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
      <Ionicons name="build-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>No hay productos personalizados</Text>
      <Text style={styles.emptySubtitle}>
        {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Añade tu primer producto personalizado para comenzar'}
      </Text>
      {!searchText && allDataLoaded && (
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>Añadir Personalizado</Text>
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
      <Text style={styles.loadingText}>Cargando personalizados...</Text>
    </View>
  );

  // Obtener estadísticas
  const stats = getPersonalizadosStats();

  // Verificar si hay error en lentes
  if (lentesError) {
    console.warn('Error al cargar lentes:', lentesError);
  }

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
          <Text style={styles.headerTitle}>Productos Personalizados</Text>
          <TouchableOpacity 
            style={[
              styles.headerAddButton, 
              !allDataLoaded && styles.headerAddButtonDisabled
            ]}
            onPress={() => setAddModalVisible(true)}
            disabled={!allDataLoaded}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.headerSubtitle}>Gestiona los productos personalizados de la óptica</Text>
        
        {/* Estadísticas integradas en el header */}
        <PersonalizadosStatsCard stats={stats} />
      </View>

      {/* ✅ Banner de carga de datos */}
      {(loadingData || lentesLoading) && (
        <View style={styles.loadingDataBanner}>
          <ActivityIndicator size="small" color="#00BCD4" />
          <Text style={styles.loadingDataText}>
            Cargando datos necesarios...
          </Text>
        </View>
      )}

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, descripción o cliente..."
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
        <PersonalizadosFilter
          selectedFilter={selectedEstadoFilter}
          onFilterChange={setSelectedEstadoFilter}
        />
      </View>

      {/* Lista de personalizados */}
      <View style={styles.listContainer}>
        {loading ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item, index) => 
              item._id?.toString() || 
              item.id?.toString() || 
              `personalizado-${index}`
            }
            renderItem={renderPersonalizadoItem}
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

      {/* Modal de agregar - Usando el hook useLentes */}
      <AddPersonalizadoModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleCreatePersonalizado}
        categorias={categorias}
        marcas={marcas}
        clientes={clientes}
        lentes={lentes || []}
        materiales={MATERIALES_LENTES}
        colores={COLORES_LENTES}
        tiposLente={TIPOS_LENTE}
      />

      <EditPersonalizadoModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedPersonalizado(null);
        }}
        personalizado={selectedPersonalizado}
        onSave={handleUpdatePersonalizado}
        categorias={categorias}
        marcas={marcas}
        clientes={clientes}
        lentes={lentes || []}
        materiales={MATERIALES_LENTES}
        colores={COLORES_LENTES}
        tiposLente={TIPOS_LENTE}
      />

      <PersonalizadoDetailModal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedPersonalizado(null);
        }}
        personalizado={selectedPersonalizado}
        index={selectedIndex}
        onEdit={handleEditPersonalizado}
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
  loadingDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3CD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  loadingDataText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#856404',
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

export default Personalizados;