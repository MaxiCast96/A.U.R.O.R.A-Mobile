import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente PersonalizadosFilter
 * 
 * Proporciona filtros dropdown para la lista de productos personalizados siguiendo
 * el diseño de LentesFilter pero adaptado para personalizados.
 * 
 * Props:
 * @param {string} selectedFilter - Filtro seleccionado actualmente
 * @param {Function} onFilterChange - Callback para cambio de filtro
 */
const PersonalizadosFilter = ({ selectedFilter, onFilterChange }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Opciones de filtro para productos personalizados
  const filtroOptions = [
    { id: 'Todos', label: 'Todos los personalizados', icon: 'build-outline' },
    { id: 'Pendiente', label: 'Pendientes', icon: 'time-outline' },
    { id: 'En Proceso', label: 'En Proceso', icon: 'sync-outline' },
    { id: 'Completado', label: 'Completados', icon: 'checkmark-circle-outline' },
    { id: 'Cancelado', label: 'Cancelados', icon: 'close-circle-outline' },
    { id: 'Entregado', label: 'Entregados', icon: 'checkmark-done-outline' }
  ];

  /**
   * Obtener label del filtro seleccionado
   */
  const getSelectedLabel = () => {
    const selected = filtroOptions.find(option => option.id === selectedFilter);
    return selected ? selected.label : 'Todos los personalizados';
  };

  /**
   * Obtener icono del filtro seleccionado
   */
  const getSelectedIcon = () => {
    const selected = filtroOptions.find(option => option.id === selectedFilter);
    return selected ? selected.icon : 'build-outline';
  };

  /**
   * Obtener color del estado
   */
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return '#F44336';
      case 'En Proceso':
        return '#FF9800';
      case 'Completado':
        return '#4CAF50';
      case 'Cancelado':
        return '#757575';
      case 'Entregado':
        return '#2196F3';
      default:
        return '#00BCD4';
    }
  };

  /**
   * Renderizar opción del modal
   */
  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        selectedFilter === item.id && styles.selectedOption
      ]}
      onPress={() => {
        onFilterChange(item.id);
        setModalVisible(false);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.optionLeft}>
        <View style={[
          styles.optionIcon,
          selectedFilter === item.id && styles.selectedOptionIcon,
          { backgroundColor: selectedFilter === item.id ? `${getEstadoColor(item.id)}15` : '#F8F9FA' }
        ]}>
          <Ionicons 
            name={item.icon} 
            size={18} 
            color={selectedFilter === item.id ? getEstadoColor(item.id) : '#666666'} 
          />
        </View>
        <Text style={[
          styles.optionText,
          selectedFilter === item.id && styles.selectedOptionText,
          selectedFilter === item.id && { color: getEstadoColor(item.id) }
        ]}>
          {item.label}
        </Text>
      </View>
      {selectedFilter === item.id && (
        <Ionicons name="checkmark-circle" size={20} color={getEstadoColor(item.id)} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.filterButtonContent}>
          <View style={[
            styles.filterIcon,
            { backgroundColor: `${getEstadoColor(selectedFilter)}15` }
          ]}>
            <Ionicons 
              name={getSelectedIcon()} 
              size={18} 
              color={getEstadoColor(selectedFilter)} 
            />
          </View>
          <Text style={[
            styles.filterButtonText,
            { color: getEstadoColor(selectedFilter) }
          ]}>
            {getSelectedLabel()}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={getEstadoColor(selectedFilter)} 
          />
        </View>
      </TouchableOpacity>

      {/* Modal de selección */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar Personalizados</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={filtroOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderOption}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  filterIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: '#F8F9FA',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOptionIcon: {
    backgroundColor: '#00BCD425',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#1A1A1A',
    flex: 1,
  },
  selectedOptionText: {
    fontFamily: 'Lato-Bold',
  },
});

export default PersonalizadosFilter;