import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente PersonalizadoItem
 * 
 * Representa un item individual de producto personalizado en la lista siguiendo
 * el diseño del LenteItem pero adaptado para personalizados.
 * 
 * Props:
 * @param {Object} personalizado - Objeto con datos del producto personalizado
 * @param {Function} onViewDetail - Callback para ver más detalles
 * @param {Function} onEdit - Callback para editar producto personalizado
 * @param {Function} onDelete - Callback para eliminar producto personalizado
 * @param {Function} onEstadoChange - Callback para cambiar estado
 */
const PersonalizadoItem = ({ 
  personalizado, 
  onViewDetail, 
  onEdit, 
  onDelete, 
  onEstadoChange 
}) => {
  /**
   * Formatear precio
   */
  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  /**
   * Obtener color del estado
   */
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return '#F44336';
      case 'en_proceso':
        return '#FF9800';
      case 'completado':
        return '#4CAF50';
      case 'cancelado':
        return '#757575';
      case 'entregado':
        return '#2196F3';
      default:
        return '#666666';
    }
  };

  /**
   * Obtener label del estado
   */
  const getEstadoLabel = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_proceso':
        return 'En Proceso';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      case 'entregado':
        return 'Entregado';
      default:
        return 'Pendiente';
    }
  };

  /**
   * Obtener icono del estado
   */
  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'time-outline';
      case 'en_proceso':
        return 'sync-outline';
      case 'completado':
        return 'checkmark-circle-outline';
      case 'cancelado':
        return 'close-circle-outline';
      case 'entregado':
        return 'checkmark-done-outline';
      default:
        return 'time-outline';
    }
  };

  /**
   * Obtener nombre del cliente
   */
  const getClienteName = (personalizado) => {
    if (typeof personalizado.clienteId === 'object' && personalizado.clienteId !== null) {
      return personalizado.clienteId.nombre || 
             personalizado.clienteId.fullName || 
             personalizado.clienteId.razonSocial || 
             personalizado.clienteId.email || 
             'Cliente sin nombre';
    }
    return personalizado.clienteId || 'Sin cliente';
  };

  /**
   * Obtener nombre de la marca
   */
  const getMarcaName = (personalizado) => {
    if (typeof personalizado.marcaId === 'object' && personalizado.marcaId !== null) {
      return personalizado.marcaId.nombre || 
             personalizado.marcaId.descripcion || 
             'Marca sin nombre';
    }
    return personalizado.marcaId || 'Sin marca';
  };

  /**
   * Verificar si es reciente (últimas 24 horas)
   */
  const isRecent = () => {
    const createdAt = personalizado.fechaSolicitud || personalizado.createdAt;
    if (!createdAt) return false;
    
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffHours = (now - createdDate) / (1000 * 60 * 60);
    
    return diffHours <= 24;
  };

  /**
   * Estados disponibles para el selector
   */
  const estadoOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'entregado', label: 'Entregado' },
  ];

  const precio = personalizado.precioCalculado || personalizado.cotizacion?.total || 0;

  return (
    <View style={styles.container}>
      {/* Información principal del personalizado */}
      <TouchableOpacity 
        style={styles.mainContent}
        onPress={onViewDetail}
        activeOpacity={0.7}
      >
        {/* Información del producto */}
        <View style={styles.productInfo}>
          {/* Nombre y badge de nuevo */}
          <View style={styles.nameRow}>
            <Text style={styles.productName} numberOfLines={2}>
              {personalizado.nombre}
            </Text>
            {isRecent() && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Nuevo</Text>
              </View>
            )}
          </View>

          {/* Descripción */}
          <Text style={styles.productDescription} numberOfLines={2}>
            {personalizado.descripcion || 'Sin descripción'}
          </Text>

          {/* Cliente y categoría */}
          <View style={styles.clienteCategoryInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={14} color="#666666" />
              <Text style={styles.infoText} numberOfLines={1}>
                {getClienteName(personalizado)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="pricetags-outline" size={14} color="#666666" />
              <Text style={styles.infoText} numberOfLines={1}>
                {personalizado.categoria || 'Sin categoría'}
              </Text>
            </View>
          </View>

          {/* Marca y material */}
          <View style={styles.caracteristicasRow}>
            <View style={styles.caracteristicaItem}>
              <Text style={styles.caracteristicaLabel}>Marca:</Text>
              <Text style={styles.caracteristicaValue}>
                {getMarcaName(personalizado)}
              </Text>
            </View>
            <View style={styles.caracteristicaItem}>
              <Text style={styles.caracteristicaLabel}>Material:</Text>
              <Text style={styles.caracteristicaValue}>
                {personalizado.material || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Color y tipo de lente */}
          <View style={styles.caracteristicasRow}>
            <View style={styles.caracteristicaItem}>
              <Text style={styles.caracteristicaLabel}>Color:</Text>
              <Text style={styles.caracteristicaValue}>
                {personalizado.color || 'N/A'}
              </Text>
            </View>
            <View style={styles.caracteristicaItem}>
              <Text style={styles.caracteristicaLabel}>Tipo:</Text>
              <Text style={styles.caracteristicaValue}>
                {personalizado.tipoLente || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.additionalInfo}>
          {/* Precio */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Precio:</Text>
            <Text style={styles.priceValue}>
              {formatPrice(precio)}
            </Text>
          </View>

          {/* Fechas */}
          <View style={styles.fechasInfo}>
            <View style={styles.fechaItem}>
              <Ionicons name="calendar-outline" size={14} color="#666666" />
              <Text style={styles.fechaText}>
                Solicitud: {formatDate(personalizado.fechaSolicitud || personalizado.createdAt)}
              </Text>
            </View>
            <View style={styles.fechaItem}>
              <Ionicons name="time-outline" size={14} color="#666666" />
              <Text style={styles.fechaText}>
                Entrega: {formatDate(personalizado.fechaEntregaEstimada)}
              </Text>
            </View>
          </View>

          {/* Estado actual */}
          <View style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoColor(personalizado.estado) }
          ]}>
            <Ionicons 
              name={getEstadoIcon(personalizado.estado)} 
              size={14} 
              color="#FFFFFF" 
            />
            <Text style={styles.estadoText}>
              {getEstadoLabel(personalizado.estado)}
            </Text>
          </View>

          {/* IDs de vinculación */}
          <View style={styles.vinculosInfo}>
            {personalizado.cotizacionId && (
              <View style={styles.vinculoItem}>
                <Ionicons name="document-text-outline" size={12} color="#666666" />
                <Text style={styles.vinculoText}>Cotización</Text>
              </View>
            )}
            {personalizado.pedidoId && (
              <View style={styles.vinculoItem}>
                <Ionicons name="bag-outline" size={12} color="#666666" />
                <Text style={styles.vinculoText}>Pedido</Text>
              </View>
            )}
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
  productInfo: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  productName: {
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },
  productDescription: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    marginBottom: 8,
    lineHeight: 18,
  },
  clienteCategoryInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#1A1A1A',
    marginLeft: 6,
    flex: 1,
  },
  caracteristicasRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  caracteristicaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  caracteristicaLabel: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    marginRight: 4,
  },
  caracteristicaValue: {
    fontSize: 12,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
    flex: 1,
  },
  additionalInfo: {
    gap: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#666666',
  },
  priceValue: {
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    color: '#00BCD4',
  },
  fechasInfo: {
    gap: 4,
  },
  fechaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fechaText: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    marginLeft: 6,
  },
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  estadoText: {
    fontSize: 12,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },
  vinculosInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  vinculoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vinculoText: {
    fontSize: 10,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    marginLeft: 4,
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

export default PersonalizadoItem;