import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente LenteDetailModal
 * 
 * Modal que muestra toda la información detallada de un lente
 * con un diseño moderno siguiendo el patrón de EmpleadoDetailModal.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Object} lente - Objeto con la información del lente
 * @param {number} index - Índice del lente en la lista
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onEdit - Función que se ejecuta al editar lente
 */
const LenteDetailModal = ({ visible, onClose, lente, index, onEdit }) => {
  if (!lente) return null;

  /**
   * Obtener stock total del lente
   */
  const getTotalStock = (lente) => {
    return Array.isArray(lente.sucursales)
      ? lente.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0)
      : (lente.stock || 0);
  };

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
   * Obtener color del tipo de lente
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
   * Renderizar campo de detalle
   */
  const renderDetailField = (icon, label, value, color = '#00BCD4') => {
    if (!value) return null;
    
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

  /**
   * Renderizar galería de imágenes
   */
  const renderImageGallery = () => {
    if (!lente.imagenes || lente.imagenes.length === 0) {
      return (
        <View style={styles.noImageContainer}>
          <Ionicons name="glasses-outline" size={64} color="#CCCCCC" />
          <Text style={styles.noImageText}>Sin imágenes disponibles</Text>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
        {lente.imagenes.map((imagen, index) => (
          <Image 
            key={index}
            source={{ uri: imagen }} 
            style={styles.galleryImage}
            onError={() => console.log('Error cargando imagen')}
          />
        ))}
      </ScrollView>
    );
  };

  const totalStock = getTotalStock(lente);

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
            <Text style={styles.headerTitle}>Detalle de Lente</Text>
            <Text style={styles.headerSubtitle}>Lente #{(index || 0) + 1}</Text>
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
          {/* Galería de imágenes y nombre */}
          <View style={styles.productSection}>
            {renderImageGallery()}
            
            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {lente.nombre}
              </Text>
              
              {/* Badge del tipo de lente */}
              <View style={[
                styles.tipoBadge,
                { backgroundColor: getTipoLenteColor(lente.tipoLente) }
              ]}>
                <Text style={styles.tipoText}>
                  {lente.tipoLente || 'Sin tipo'}
                </Text>
              </View>
              
              {/* Descripción */}
              {lente.descripcion && (
                <Text style={styles.productDescription}>
                  {lente.descripcion}
                </Text>
              )}
            </View>
          </View>

          {/* Estado del producto */}
          <View style={styles.statusSection}>
            <View style={styles.statusRow}>
              <View style={[
                styles.statusContainer,
                { backgroundColor: lente.enPromocion ? '#FF9800' : '#E0E0E0' }
              ]}>
                <Ionicons 
                  name={lente.enPromocion ? 'pricetag' : 'pricetag-outline'} 
                  size={20} 
                  color={lente.enPromocion ? '#FFFFFF' : '#666666'} 
                />
                <Text style={[
                  styles.statusTitle,
                  { color: lente.enPromocion ? '#FFFFFF' : '#666666' }
                ]}>
                  {lente.enPromocion ? 'EN PROMOCIÓN' : 'PRECIO NORMAL'}
                </Text>
              </View>

              <View style={[
                styles.statusContainer,
                { backgroundColor: totalStock > 0 ? '#4CAF50' : '#F44336' }
              ]}>
                <Ionicons 
                  name={totalStock > 0 ? 'layers' : 'layers-outline'} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.statusTitle}>
                  {totalStock > 0 ? 'DISPONIBLE' : 'SIN STOCK'}
                </Text>
              </View>
            </View>
          </View>

          {/* Información del Producto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL PRODUCTO</Text>
            <View style={styles.sectionContent}>
              {renderDetailField(
                'business', 
                'Marca', 
                lente.marcaId?.nombre || 'Sin marca',
                '#00BCD4'
              )}
              {renderDetailField(
                'pricetags', 
                'Categoría', 
                lente.categoriaId?.nombre || 'Sin categoría',
                '#00BCD4'
              )}
              {lente.linea && renderDetailField(
                'bookmark', 
                'Línea de producto', 
                lente.linea,
                '#00BCD4'
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
                lente.material,
                '#9C27B0'
              )}
              {renderDetailField(
                'color-palette', 
                'Color', 
                lente.color,
                '#9C27B0'
              )}
              {lente.medidas && renderDetailField(
                'resize', 
                'Medidas (Ancho × Altura × Puente)', 
                `${lente.medidas.ancho || 0} × ${lente.medidas.altura || 0} × ${lente.medidas.anchoPuente || 0} mm`,
                '#9C27B0'
              )}
            </View>
          </View>

          {/* Información de Precios */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DE PRECIOS</Text>
            <View style={styles.sectionContent}>
              {renderDetailField(
                'cash', 
                'Precio base', 
                formatPrice(lente.precioBase),
                '#4CAF50'
              )}
              {renderDetailField(
                'card', 
                'Precio actual', 
                formatPrice(lente.precioActual || lente.precioBase),
                lente.enPromocion ? '#FF9800' : '#4CAF50'
              )}
              {lente.enPromocion && lente.promocionId && renderDetailField(
                'pricetag', 
                'Promoción aplicada', 
                lente.promocionId?.nombre || 'Promoción activa',
                '#FF9800'
              )}
            </View>
          </View>

          {/* Inventario y Disponibilidad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INVENTARIO Y DISPONIBILIDAD</Text>
            <View style={styles.sectionContent}>
              {renderDetailField(
                'layers', 
                'Stock total', 
                `${totalStock} unidades`,
                totalStock > 0 ? '#4CAF50' : '#F44336'
              )}
              {renderDetailField(
                'business', 
                'Disponible en sucursales', 
                `${Array.isArray(lente.sucursales) ? lente.sucursales.length : 0} sucursal(es)`,
                '#6B46C1'
              )}
              
              {/* Detalle por sucursal */}
              {Array.isArray(lente.sucursales) && lente.sucursales.length > 0 && (
                <View style={styles.sucursalesDetail}>
                  <Text style={styles.sucursalesTitle}>Stock por sucursal:</Text>
                  {lente.sucursales.map((sucursal, index) => (
                    <View key={index} style={styles.sucursalItem}>
                      <Text style={styles.sucursalName}>
                        {sucursal.nombreSucursal || sucursal.sucursalId?.nombre || 'Sucursal'}
                      </Text>
                      <Text style={[
                        styles.sucursalStock,
                        { color: (sucursal.stock || 0) > 0 ? '#4CAF50' : '#F44336' }
                      ]}>
                        {sucursal.stock || 0} unidades
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Información del Sistema */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL SISTEMA</Text>
            <View style={styles.systemInfo}>
              <View style={styles.systemInfoRow}>
                <Text style={styles.systemInfoLabel}>ID del lente:</Text>
                <Text style={styles.systemInfoValue}>
                  {lente._id ? lente._id.slice(-8) : 'N/A'}
                </Text>
              </View>
              <View style={styles.systemInfoDivider} />
              <View style={styles.systemInfoRow}>
                <Text style={styles.systemInfoLabel}>Fecha de creación:</Text>
                <Text style={styles.systemInfoValue}>
                  {formatDate(lente.fechaCreacion)}
                </Text>
              </View>
              <View style={styles.systemInfoDivider} />
              <View style={styles.systemInfoRow}>
                <Text style={styles.systemInfoLabel}>Imágenes disponibles:</Text>
                <Text style={styles.systemInfoValue}>
                  {lente.imagenes?.length || 0} imagen(es)
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
            onPress={() => onEdit(lente)}
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

  // Galería de imágenes
  imageGallery: {
    marginBottom: 16,
  },

  // Imagen de la galería
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },

  // Contenedor sin imágenes
  noImageContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginBottom: 16,
  },

  // Texto sin imágenes
  noImageText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#999999',
    marginTop: 8,
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

  // Badge del tipo
  tipoBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },

  // Texto del tipo
  tipoText: {
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
  
  // Sección de estado
  statusSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Fila de estados
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Contenedor del estado
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  
  // Título del estado
  statusTitle: {
    fontSize: 12,
    fontFamily: 'Lato-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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

  // Detalle de sucursales
  sucursalesDetail: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },

  // Título de sucursales
  sucursalesTitle: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#666666',
    marginBottom: 8,
  },

  // Item de sucursal
  sucursalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 4,
  },

  // Nombre de sucursal
  sucursalName: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#1A1A1A',
    flex: 1,
  },

  // Stock de sucursal
  sucursalStock: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
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

export default LenteDetailModal;