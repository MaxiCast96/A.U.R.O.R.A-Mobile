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
 * Componente AccesoriosFilter
 * 
 * Filtros horizontales en forma de chips scrollables
 * Diseño moderno y limpio debajo del buscador
 * 
 * Props:
 * @param {string} selectedFilter - Filtro seleccionado actualmente
 * @param {Function} onFilterChange - Callback para cambio de filtro
 */
const AccesoriosFilter = ({ selectedFilter, onFilterChange }) => {
  // Opciones de filtro optimizadas para chips
  const filtroOptions = [
    { 
      id: 'Todos', 
      label: 'Todos', 
      icon: 'apps',
      color: '#00BCD4'
    },
    { 
      id: 'En Promoción', 
      label: 'En Promoción', 
      icon: 'pricetag',
      color: '#FF6B6B'
    },
    { 
      id: 'Sin Promoción', 
      label: 'Sin Promo', 
      icon: 'pricetag-outline',
      color: '#95A5A6'
    },
    { 
      id: 'Con Stock', 
      label: 'Con Stock', 
      icon: 'checkmark-circle',
      color: '#49AA4C'
    },
    { 
      id: 'Sin Stock', 
      label: 'Sin Stock', 
      icon: 'close-circle',
      color: '#D0155F'
    },
    { 
      id: 'Precio Alto', 
      label: 'Precio Alto', 
      icon: 'trending-up',
      color: '#9B59B6'
    },
    { 
      id: 'Precio Bajo', 
      label: 'Precio Bajo', 
      icon: 'trending-down',
      color: '#3498DB'
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

export default AccesoriosFilter;