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
 * Componente LentesFilter
 * 
 * Filtros horizontales en forma de chips scrollables
 * Diseño moderno y limpio debajo del buscador
 * 
 * Props:
 * @param {string} selectedFilter - Filtro seleccionado actualmente
 * @param {Function} onFilterChange - Callback para cambio de filtro
 */
const LentesFilter = ({ selectedFilter, onFilterChange }) => {
  // Opciones de filtro optimizadas para chips
  const filtroOptions = [
    { id: 'Todos', label: 'Todos', icon: 'apps' },
    { id: 'En Promoción', label: 'En Promoción', icon: 'pricetag' },
    { id: 'Sin Promoción', label: 'Sin Promo', icon: 'pricetag-outline' },
    { id: 'Con Stock', label: 'Con Stock', icon: 'checkmark-circle' },
    { id: 'Sin Stock', label: 'Sin Stock', icon: 'close-circle-outline' },
    { id: 'Monofocal', label: 'Monofocal', icon: 'ellipse-outline' },
    { id: 'Bifocal', label: 'Bifocal', icon: 'ellipse' },
    { id: 'Progresivo', label: 'Progresivo', icon: 'radio-button-on' },
    { id: 'Ocupacional', label: 'Ocupacional', icon: 'briefcase-outline' }
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
          isSelected && styles.chipSelected
        ]}
        onPress={() => onFilterChange(option.id)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={option.icon} 
          size={16} 
          color={isSelected ? '#FFFFFF' : '#00BCD4'} 
          style={styles.chipIcon}
        />
        <Text style={[
          styles.chipText,
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
    borderColor: '#00BCD4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#00BCD4',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
  },
});

export default LentesFilter;