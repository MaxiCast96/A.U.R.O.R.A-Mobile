import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente LentesStatsCard
 * 
 * Muestra estadísticas resumidas de lentes en formato de cards
 * dentro del header de la pantalla siguiendo el diseño de Empleados.
 * 
 * Props:
 * @param {Object} stats - Objeto con estadísticas: { total, promocion, stock, valorInventario }
 */
const LentesStatsCard = ({ stats }) => {
  /**
   * Formatear valores numéricos
   */
  const formatNumber = (value) => {
    if (!value) return '0';
    return value.toString();
  };

  /**
   * Formatear moneda
   */
  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {/* Total de Lentes */}
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Ionicons name="glasses" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.statNumber}>{formatNumber(stats.total)}</Text>
        <Text style={styles.statLabel}>Total Lentes</Text>
      </View>

      <View style={styles.statDivider} />

      {/* En Promoción */}
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Ionicons name="pricetag" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.statNumber}>{formatNumber(stats.promocion)}</Text>
        <Text style={styles.statLabel}>En Promoción</Text>
      </View>

      <View style={styles.statDivider} />

      {/* Stock Total */}
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Ionicons name="layers" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.statNumber}>{formatNumber(stats.stock)}</Text>
        <Text style={styles.statLabel}>Stock Total</Text>
      </View>

      <View style={styles.statDivider} />

      {/* Valor Inventario */}
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Ionicons name="cash" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.statNumber}>{formatCurrency(stats.valorInventario)}</Text>
        <Text style={styles.statLabel}>Valor Inventario</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  statIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Lato-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
});

export default LentesStatsCard;