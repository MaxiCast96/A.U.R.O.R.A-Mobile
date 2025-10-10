import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente PersonalizadosFilter
 * 
 * Filtros horizontales en forma de chips scrollables
 * Diseño moderno y limpio debajo del buscador
 * 
 * Props:
 * @param {string} selectedFilter - Filtro seleccionado actualmente
 * @param {Function} onFilterChange - Callback para cambio de filtro
 */
const PersonalizadosFilter = ({ selectedFilter, onFilterChange }) => {
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

  // Opciones de filtro optimizadas para chips
  const filtroOptions = [
    { 
      id: 'Todos', 
      label: 'Todos', 
      icon: 'apps',
      color: '#00BCD4'
    },
    { 
      id: 'Pendiente', 
      label: 'Pendientes', 
      icon: 'time',
      color: '#F44336'
    },
    { 
      id: 'En Proceso', 
      label: 'En Proceso', 
      icon: 'sync',
      color: '#FF9800'
    },
    { 
      id: 'Completado', 
      label: 'Completados', 
      icon: 'checkmark-circle',
      color: '#4CAF50'
    },
    { 
      id: 'Cancelado', 
      label: 'Cancelados', 
      icon: 'close-circle',
      color: '#757575'
    },
    { 
      id: 'Entregado', 
      label: 'Entregados', 
      icon: 'checkmark-done',
      color: '#2196F3'
    }
  ];

  /**
   * Renderizar chip de filtro
   */
  const renderChip = (option) => {
    const isSelected = selectedFilter === option.id;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.chip,
          { borderColor: option.color },
          isSelected && { 
            backgroundColor: option.color,
            borderColor: option.color 
          }
        ]}
        onPress={() => onFilterChange(option.id)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={option.icon} 
          size={16} 
          color={isSelected ? '#FFFFFF' : option.color} 
          style={styles.chipIcon}
        />
        <Text style={[
          styles.chipText,
          { color: option.color },
          isSelected && styles.chipTextSelected
        ]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filtroOptions.map(option => renderChip(option))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
  },
});

export default PersonalizadosFilter;