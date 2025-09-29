import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente PersonalizadoDetailModal
 * 
 * Modal que muestra toda la información detallada de un producto personalizado
 * con un diseño moderno siguiendo el patrón de LenteDetailModal.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Object} personalizado - Objeto con la información del producto personalizado
 * @param {number} index - Índice del personalizado en la lista
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onEdit - Función que se ejecuta al editar personalizado
 */
const PersonalizadoDetailModal = ({ visible, onClose, personalizado, index, onEdit }) => {
  if (!personalizado) return null;

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
        month: 'long',
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
   * Obtener información del cliente
   */
  const getClienteInfo = () => {
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
   * Obtener información de la marca
   */
  const getMarcaInfo = () => {
    if (typeof personalizado.marcaId === 'object' && personalizado.marcaId !== null) {
      return personalizado.marcaId.nombre || 
             personalizado.marcaId.descripcion || 
             'Marca sin nombre';
    }
    return personalizado.marcaId || 'Sin marca';
  };

  /**
   * Obtener información del producto base
   */
  const getProductoBaseInfo = () => {
    if (typeof personalizado.productoBaseId === 'object' && personalizado.productoBaseId !== null) {
      return personalizado.productoBaseId.nombre || 
             personalizado.productoBaseId.modelo || 
             'Producto base sin nombre';
    }
    return personalizado.productoBaseId || 'Sin producto base';
  };

  /**
   * Renderizar campo de detalle
   */
  const renderDetailField = (icon, label, value, color = '#00BCD4') => {
    if (!value || value === 'N/A') return null;
    
    return (
      <View style={styles.detailField}>
        <View style={styles.fieldHeader}>
          <View style={[styles.fieldIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <Text style={styles.fieldLabel}>{label}</Text>
        </View>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    );
  };

  const precio = personalizado.precioCalculado || personalizado.cotizacion?.total || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header del modal */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Detalle del Personalizado</Text>
            <Text style={styles.headerSubtitle}>Personalizado #{(index || 0) + 1}</Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Contenido del modal */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Información del producto y estado */}
          <View style={styles.productSection}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {personalizado.nombre}
              </Text>
              
              {/* Badge del estado */}
              <View style={[
                styles.estadoBadge,
                { backgroundColor: getEstadoColor(personalizado.estado) }
              ]}>
                <Text style={styles.estadoText}>
                  {getEstadoLabel(personalizado.estado)}
                </Text>
              </View>
              
              {/* Descripción */}
              {personalizado.descripcion && (
                <Text style={styles.productDescription}>
                  {personalizado.descripcion}
                </Text>
              )}
            </View>
          </View>

          {/* Información del Cliente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>
            <View style={styles.sectionContent}>
              {renderDetailField(
                'person', 
                'Cliente', 
                getClienteInfo(),
                '#00BCD4'
              )}
            </View>
          </View>

          {/* Información del Producto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL PRODUCTO</Text>
            <View style={styles.sectionContent}>
              {renderDetailField(
                'cube', 
                'Producto Base', 
                getProductoBaseInfo(),
                '#9C27B0'
              )}
              {renderDetailField(
                'business', 
                'Marca', 
                getMarcaInfo(),
                '#9C27B0'
              )}
              {renderDetailField(
                'pricetags', 
                'Categoría', 
                personalizado.categoria,
                '#9C27B0'
              )}
            </View>
          </View>

          {/* Características Físicas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CARACTERÍSTICAS FÍSICAS</Text>
            <View style={styles.sectionContent}>
              {renderDetailField(
                'layers', 
                'Material', 
                personalizado.material,
                '#FF9800'
              )}
              {renderDetailField(
                'color-palette', 
                'Color', 
                personalizado.color,
                '#FF9800'
              )}
              {renderDetailField(
                'eye', 
                'Tipo de Lente', 
                personalizado.tipoLente,
                '#FF9800'
              )}
            </View>
          </View>

          {/* Información de Precios */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DE PRECIOS</Text>
            <View style={styles.sectionContent}>
              {renderDetailField(
                'cash', 
                'Precio Calculado', 
                formatPrice(personalizado.precioCalculado),
                '#4CAF50'
              )}
              {personalizado.cotizacion?.total && renderDetailField(
                'document-text', 
                'Total Cotización', 
                formatPrice(personalizado.cotizacion.total),
                '#4CAF50'
              )}
            </View>
          </View>

          {/* Fechas Importantes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FECHAS IMPORTANTES</Text>
            <View style={styles.sectionContent}>
              {renderDetailField(
                'calendar', 
                'Fecha de Solicitud', 
                formatDate(personalizado.fechaSolicitud || personalizado.createdAt),
                '#6B46C1'
              )}
              {renderDetailField(
                'time', 
                'Fecha de Entrega Estimada', 
                formatDate(personalizado.fechaEntregaEstimada),
                '#6B46C1'
              )}
              {personalizado.cotizacion?.validaHasta && renderDetailField(
                'hourglass', 
                'Cotización Válida Hasta', 
                formatDate(personalizado.cotizacion.validaHasta),
                '#6B46C1'
              )}
            </View>
          </View>

          {/* Información del Sistema */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL SISTEMA</Text>
            <View style={styles.systemInfo}>
              <View style={styles.systemInfoRow}>
                <Text style={styles.systemInfoLabel}>ID del personalizado:</Text>
                <Text style={styles.systemInfoValue}>
                  {personalizado._id ? personalizado._id.slice(-8) : 'N/A'}
                </Text>
              </View>
              <View style={styles.systemInfoDivider} />
              <View style={styles.systemInfoRow}>
                <Text style={styles.systemInfoLabel}>Fecha de creación:</Text>
                <Text style={styles.systemInfoValue}>
                  {formatDate(personalizado.createdAt || personalizado.fechaSolicitud)}
                </Text>
              </View>
              <View style={styles.systemInfoDivider} />
              <View style={styles.systemInfoRow}>
                <Text style={styles.systemInfoLabel}>Última actualización:</Text>
                <Text style={styles.systemInfoValue}>
                  {formatDate(personalizado.updatedAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Espaciador */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Cerrar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => onEdit(personalizado)}
            activeOpacity={0.8}
          >
            <Ionicons name="create" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header del modal
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  
  // Lado izquierdo del header
  headerLeft: {
    flex: 1,
  },
  
  // Título del header
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
  },
  
  // Subtítulo del header
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    marginTop: 2,
  },
  
  // Botón de cerrar
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Contenido del modal
  content: {
    flex: 1,
  },
  
  // Contenido del scroll
  scrollContent: {
    paddingBottom: 20,
  },

  // Sección del producto
  productSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },

  // Información del producto
  productInfo: {
    alignItems: 'center',
  },

  // Nombre del producto
  productName: {
    fontSize: 24,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },

  // Badge del estado
  estadoBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },

  // Texto del estado
  estadoText: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },

  // Descripción del producto
  productDescription: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Sección
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  
  // Título de sección
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Lato-Bold',
    color: '#666666',
    marginBottom: 12,
    letterSpacing: 1,
  },
  
  // Contenido de sección
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Campo de detalle
  detailField: {
    gap: 8,
  },
  
  // Header del campo
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  // Ícono del campo
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Etiqueta del campo
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
    flex: 1,
  },
  
  // Valor del campo
  fieldValue: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    color: '#1A1A1A',
    lineHeight: 22,
    marginLeft: 48,
  },
  
  // Información del sistema
  systemInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Fila de información del sistema
  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  // Divisor del sistema
  systemInfoDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  
  // Etiqueta de información del sistema
  systemInfoLabel: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#666666',
  },
  
  // Valor de información del sistema
  systemInfoValue: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
  },
  
  // Espaciador
  spacer: {
    height: 40,
  },
  
  // Botones de acción
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  
  // Botón secundario
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
  },
  
  // Texto del botón secundario
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#666666',
  },

  // Botón primario
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  // Texto del botón primario
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },
});

export default PersonalizadoDetailModal;