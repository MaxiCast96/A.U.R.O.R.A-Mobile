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
 * Componente LenteItem
 * 
 * Representa un item individual de lente en la lista siguiendo
 * el diseño del EmpleadoItem pero adaptado para lentes.
 * 
 * Props:
 * @param {Object} lente - Objeto con datos del lente
 * @param {Function} onViewDetail - Callback para ver más detalles
 * @param {Function} onEdit - Callback para editar lente
 * @param {Function} onDelete - Callback para eliminar lente
 */
const LenteItem = ({ lente, onViewDetail, onEdit, onDelete }) => {
  /**
   * Obtener stock total del lente
   */
  const getTotalStock = (lente) => {
    return Array.isArray(lente.sucursales)
      ? lente.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0)
      : (lente.stock || 0);
  };

  /**
   * Obtener el color del tipo de lente
   */
  const getTipoLenteColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'monofocal':
        return '#00BCD4';
      case 'bifocal':
        return '#9C27B0';
      case 'progresivo':
        return '#FF9800';
      case 'ocupacional':
        return '#4CAF50';
      default:
        return '#009BBF';
    }
  };

  /**
   * Obtener el color del material
   */
  const getMaterialColor = (material) => {
    switch (material?.toLowerCase()) {
      case 'orgánico':
        return '#4CAF50';
      case 'policarbonato':
        return '#2196F3';
      case 'trivex':
        return '#9C27B0';
      case 'alto índice':
        return '#FF5722';
      case 'cristal mineral':
        return '#607D8B';
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
  const getMarcaName = (lente) => {
    return lente.marcaId?.nombre || lente.marcaId || 'Sin marca';
  };

  /**
   * Obtener nombre de categoría
   */
  const getCategoriaName = (lente) => {
    return lente.categoriaId?.nombre || lente.categoriaId || 'Sin categoría';
  };

  const totalStock = getTotalStock(lente);

  return (
    <View style={styles.container}>
      {/* Información principal del lente */}
      <TouchableOpacity 
        style={styles.mainContent}
        onPress={onViewDetail}
        activeOpacity={0.7}
      >
        {/* Imagen y información básica */}
        <View style={styles.lenteInfo}>
          {/* Imagen del lente */}
          <View style={styles.imageContainer}>
            {lente.imagenes?.[0] ? (
              <Image 
                source={{ uri: lente.imagenes[0] }}
                style={styles.lenteImage}
                onError={() => console.log('Error cargando imagen lente')}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="glasses" size={24} color="#CCCCCC" />
              </View>
            )}
          </View>

          {/* Información del lente */}
          <View style={styles.lenteDetails}>
            {/* Nombre */}
            <Text style={styles.lenteName} numberOfLines={2}>
              {lente.nombre}
            </Text>

            {/* Marca y categoría */}
            <View style={styles.brandCategoryInfo}>
              <Text style={styles.brandText} numberOfLines={1}>
                {getMarcaName(lente)}
              </Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.categoryText} numberOfLines={1}>
                {getCategoriaName(lente)}
              </Text>
            </View>

            {/* Línea del producto */}
            {lente.linea && (
              <View style={styles.lineaInfo}>
                <Ionicons name="bookmark-outline" size={14} color="#00BCD4" />
                <Text style={styles.lineaText} numberOfLines={1}>
                  {lente.linea}
                </Text>
              </View>
            )}

            {/* Características físicas */}
            <View style={styles.characteristicsRow}>
              <View style={styles.characteristicItem}>
                <Text style={styles.characteristicLabel}>Material:</Text>
                <Text style={[styles.characteristicValue, { color: getMaterialColor(lente.material) }]}>
                  {lente.material || 'N/A'}
                </Text>
              </View>
              <View style={styles.characteristicItem}>
                <Text style={styles.characteristicLabel}>Color:</Text>
                <Text style={styles.characteristicValue}>
                  {lente.color || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.additionalInfo}>
          {/* Tipo de lente */}
          <View style={[styles.tipoBadge, { backgroundColor: getTipoLenteColor(lente.tipoLente) }]}>
            <Text style={styles.tipoText}>
              {lente.tipoLente || 'Sin tipo'}
            </Text>
          </View>

          {/* Medidas */}
          {lente.medidas && (
            <View style={styles.medidasInfo}>
              <Ionicons name="resize-outline" size={14} color="#666666" />
              <Text style={styles.medidasText}>
                {lente.medidas.ancho}×{lente.medidas.altura}×{lente.medidas.anchoPuente}mm
              </Text>
            </View>
          )}

          {/* Stock */}
          <View style={styles.stockInfo}>
            <Ionicons name="layers-outline" size={14} color="#666666" />
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
              {Array.isArray(lente.sucursales) ? lente.sucursales.length : 0} sucursal(es)
            </Text>
          </View>

          {/* Precios */}
          <View style={styles.pricesRow}>
            {lente.enPromocion ? (
              <View style={styles.promocionContainer}>
                <Text style={styles.precioPromo}>
                  {formatPrice(lente.precioActual)}
                </Text>
                <Text style={styles.precioOriginal}>
                  {formatPrice(lente.precioBase)}
                </Text>
                <View style={styles.promoTag}>
                  <Text style={styles.promoText}>OFERTA</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.precioNormal}>
                {formatPrice(lente.precioBase)}
              </Text>
            )}
          </View>

          {/* Estados */}
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: lente.enPromocion ? '#FF9800' : '#E0E0E0' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: lente.enPromocion ? '#FFFFFF' : '#666666' }
              ]}>
                {lente.enPromocion ? 'Promoción' : 'Precio normal'}
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
  lenteInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  imageContainer: {
    marginRight: 12,
  },
  lenteImage: {
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
  lenteDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  lenteName: {
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
  tipoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tipoText: {
    fontSize: 12,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },
  medidasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medidasText: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    marginLeft: 6,
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

export default LenteItem;