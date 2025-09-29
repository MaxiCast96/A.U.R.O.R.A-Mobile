import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente AccesorioItem
 * 
 * Representa un item individual de accesorio en la lista siguiendo
 * el diseño del LenteItem pero adaptado para accesorios.
 * 
 * Props:
 * @param {Object} accesorio - Objeto con datos del accesorio
 * @param {Function} onViewDetail - Callback para ver más detalles
 * @param {Function} onEdit - Callback para editar accesorio
 * @param {Function} onDelete - Callback para eliminar accesorio
 */
const AccesorioItem = ({ accesorio, onViewDetail, onEdit, onDelete }) => {
  /**
   * Obtener stock total del accesorio
   */
  const getTotalStock = (accesorio) => {
    return Array.isArray(accesorio.sucursales)
      ? accesorio.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0)
      : (accesorio.stock || 0);
  };

  /**
   * Obtener el color del material
   */
  const getMaterialColor = (material) => {
    switch (material?.toLowerCase()) {
      case 'acetato':
        return '#4CAF50';
      case 'metal':
        return '#607D8B';
      case 'titanio':
        return '#9C27B0';
      case 'acero inoxidable':
        return '#2196F3';
      case 'aluminio':
        return '#FF9800';
      case 'plástico':
        return '#FF5722';
      case 'silicona':
        return '#E91E63';
      case 'cuero':
        return '#795548';
      case 'tela':
        return '#673AB7';
      case 'goma':
        return '#009688';
      default:
        return '#666666';
    }
  };

  /**
   * Formatear precio
   */
  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  /**
   * Obtener nombre de marca
   */
  const getMarcaName = (accesorio) => {
    return accesorio.marcaId?.nombre || accesorio.marcaId || 'Sin marca';
  };

  /**
   * Obtener nombre de categoría
   */
  const getCategoriaName = (accesorio) => {
    return accesorio.tipo?.nombre || accesorio.tipo || 'Sin categoría';
  };

  const totalStock = getTotalStock(accesorio);

  return (
    <View style={styles.container}>
      {/* Información principal del accesorio */}
      <TouchableOpacity 
        style={styles.mainContent}
        onPress={onViewDetail}
        activeOpacity={0.7}
      >
        {/* Imagen y información básica */}
        <View style={styles.accesorioInfo}>
          {/* Imagen del accesorio */}
          <View style={styles.imageContainer}>
            {accesorio.imagenes?.[0] || accesorio.imagen ? (
              <Image 
                source={{ uri: accesorio.imagenes?.[0] || accesorio.imagen }}
                style={styles.accesorioImage}
                onError={(error) => {
                  console.log('Error cargando imagen accesorio:', error.nativeEvent.error);
                }}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="bag" size={24} color="#CCCCCC" />
              </View>
            )}
          </View>

          {/* Información del accesorio */}
          <View style={styles.accesorioDetails}>
            {/* Nombre */}
            <Text style={styles.accesorioName} numberOfLines={2}>
              {accesorio.nombre}
            </Text>

            {/* Marca y categoría */}
            <View style={styles.brandCategoryInfo}>
              <Text style={styles.brandText} numberOfLines={1}>
                {getMarcaName(accesorio)}
              </Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.categoryText} numberOfLines={1}>
                {getCategoriaName(accesorio)}
              </Text>
            </View>

            {/* Línea del producto */}
            {accesorio.linea && (
              <View style={styles.lineaInfo}>
                <Ionicons name="bookmark-outline" size={14} color="#00BCD4" />
                <Text style={styles.lineaText} numberOfLines={1}>
                  {accesorio.linea}
                </Text>
              </View>
            )}

            {/* Características físicas */}
            <View style={styles.characteristicsRow}>
              <View style={styles.characteristicItem}>
                <Text style={styles.characteristicLabel}>Material:</Text>
                <Text style={[styles.characteristicValue, { color: getMaterialColor(accesorio.material) }]}>
                  {accesorio.material || 'N/A'}
                </Text>
              </View>
              <View style={styles.characteristicItem}>
                <Text style={styles.characteristicLabel}>Color:</Text>
                <Text style={styles.characteristicValue}>
                  {accesorio.color || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.additionalInfo}>
          {/* Stock */}
          <View style={styles.stockInfo}>
            <Ionicons name="cube-outline" size={14} color="#666666" />
            <Text style={[
              styles.stockText,
              { color: totalStock > 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {totalStock} unidades
            </Text>
          </View>

          {/* Sucursales */}
          <View style={styles.sucursalesInfo}>
            <Ionicons name="business-outline" size={14} color="#666666" />
            <Text style={styles.sucursalesText}>
              {Array.isArray(accesorio.sucursales) ? accesorio.sucursales.length : 0} sucursal(es)
            </Text>
          </View>

          {/* Precios */}
          <View style={styles.pricesRow}>
            {accesorio.enPromocion ? (
              <View style={styles.promocionContainer}>
                <Text style={styles.precioPromo}>
                  {formatPrice(accesorio.precioActual)}
                </Text>
                <Text style={styles.precioOriginal}>
                  {formatPrice(accesorio.precioBase)}
                </Text>
                <View style={styles.promoTag}>
                  <Text style={styles.promoText}>OFERTA</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.precioNormal}>
                {formatPrice(accesorio.precioBase)}
              </Text>
            )}
          </View>

          {/* Estados */}
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: accesorio.enPromocion ? '#FF9800' : '#E0E0E0' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: accesorio.enPromocion ? '#FFFFFF' : '#666666' }
              ]}>
                {accesorio.enPromocion ? 'Promoción' : 'Precio normal'}
              </Text>
            </View>

            <View style={[
              styles.statusBadge,
              { backgroundColor: totalStock > 0 ? '#4CAF50' : '#F44336' }
            ]}>
              <Text style={styles.statusText}>
                {totalStock > 0 ? 'Disponible' : 'Sin stock'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color="#F44336" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={onViewDetail} 
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={16} color="#00BCD4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={16} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  mainContent: {
    marginBottom: 12,
  },
  accesorioInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  imageContainer: {
    marginRight: 12,
  },
  accesorioImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  accesorioDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  accesorioName: {
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 22,
  },
  brandCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#00BCD4',
    maxWidth: '40%',
  },
  separator: {
    fontSize: 14,
    color: '#CCCCCC',
    marginHorizontal: 8,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    flex: 1,
  },
  lineaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lineaText: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: '#00BCD4',
    marginLeft: 4,
    flex: 1,
  },
  characteristicsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  characteristicLabel: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    marginRight: 4,
  },
  characteristicValue: {
    fontSize: 12,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
    flex: 1,
  },
  additionalInfo: {
    gap: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'Lato-Bold',
    marginLeft: 6,
  },
  sucursalesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sucursalesText: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    marginLeft: 6,
  },
  pricesRow: {
    alignItems: 'flex-start',
  },
  promocionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  precioPromo: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#4CAF50',
  },
  precioOriginal: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  promoTag: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoText: {
    fontSize: 10,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },
  precioNormal: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#00BCD4',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: '#F4433615',
    borderColor: '#F4433630',
  },
  viewButton: {
    backgroundColor: '#00BCD415',
    borderColor: '#00BCD430',
  },
  editButton: {
    backgroundColor: '#4CAF5015',
    borderColor: '#4CAF5030',
  },
});

export default AccesorioItem;