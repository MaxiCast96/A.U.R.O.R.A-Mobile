import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    ScrollView,
    SafeAreaView,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente LenteDetailModal
 * 
 * Modal que muestra toda la información detallada de un lente
 * con un diseño moderno y organizado siguiendo la estética de la app.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Object} lente - Objeto con la información del lente
 * @param {number} index - Índice del lente en la lista
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onEdit - Función para editar el lente
 * @param {Function} onDelete - Función para eliminar el lente
 */
const LenteDetailModal = ({ visible, lente, index, onClose, onEdit, onDelete }) => {
    if (!lente) return null;

    /**
     * Formatear fecha para mostrar completa
     */
    const formatFullDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Obtener el nombre de la marca
     */
    const getMarcaNombre = () => {
        if (typeof lente.marcaId === 'object' && lente.marcaId?.nombre) {
            return lente.marcaId.nombre;
        }
        return lente.marca || 'Marca no especificada';
    };

    /**
     * Obtener el nombre de la categoría
     */
    const getCategoriaNombre = () => {
        if (typeof lente.categoriaId === 'object' && lente.categoriaId?.nombre) {
            return lente.categoriaId.nombre;
        }
        return lente.categoria || 'Categoría no especificada';
    };

    /**
     * Formatear precio
     */
    const formatPrice = (price) => {
        return `$${(price || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
    };

    /**
     * Formatear medidas del lente
     */
    const formatMedidas = () => {
        if (!lente.medidas) return 'Medidas no especificadas';
        const { anchoPuente, altura, ancho } = lente.medidas;
        return `${ancho || 0} × ${altura || 0} × ${anchoPuente || 0} mm`;
    };

    /**
     * Calcular stock total
     */
    const getStockTotal = () => {
        if (!lente.sucursales || lente.sucursales.length === 0) return 0;
        return lente.sucursales.reduce((total, sucursal) => total + (sucursal.stock || 0), 0);
    };

    /**
     * Obtener el color del estado de stock
     */
    const getStockColor = (stock) => {
        if (stock === 0) return '#D0155F';
        if (stock <= 5) return '#FF8C00';
        return '#49AA4C';
    };

    /**
     * Obtener el ícono del estado de stock
     */
    const getStockIcon = (stock) => {
        if (stock === 0) return 'close-circle';
        if (stock <= 5) return 'warning';
        return 'checkmark-circle';
    };

    /**
     * Renderizar campo de detalle
     */
    const renderDetailField = (icon, label, value, color = '#009BBF') => {
        if (!value && value !== 0) return null;
        
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
     * Renderizar información de sucursal
     */
    const renderSucursalInfo = () => {
        if (!lente.sucursales || lente.sucursales.length === 0) {
            return (
                <View style={styles.sucursalItem}>
                    <Text style={styles.sucursalNombre}>Sin stock en sucursales</Text>
                    <Text style={styles.sucursalStock}>0 unidades</Text>
                </View>
            );
        }

        return lente.sucursales.map((sucursal, index) => (
            <View key={index} style={styles.sucursalItem}>
                <View style={styles.sucursalInfo}>
                    <Text style={styles.sucursalNombre}>{sucursal.nombreSucursal}</Text>
                    <View style={[
                        styles.stockBadge, 
                        { backgroundColor: `${getStockColor(sucursal.stock)}15` }
                    ]}>
                        <Text style={[styles.stockText, { color: getStockColor(sucursal.stock) }]}>
                            {sucursal.stock} unidades
                        </Text>
                    </View>
                </View>
            </View>
        ));
    };

    const stockTotal = getStockTotal();
    const hasDiscount = lente.precioBase > lente.precioActual;

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
                        <Text style={styles.headerSubtitle}>Producto #{index + 1}</Text>
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
                    {/* Imagen y información principal del lente */}
                    <View style={styles.lenteHeader}>
                        <View style={styles.imageContainer}>
                            {lente.imagenes && lente.imagenes.length > 0 ? (
                                <Image 
                                    source={{ uri: lente.imagenes[0] }} 
                                    style={styles.lenteImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="glasses-outline" size={48} color="#CCCCCC" />
                                </View>
                            )}
                        </View>
                        <View style={styles.lenteInfo}>
                            <Text style={styles.lenteNombre}>
                                {lente.nombre || 'Nombre no disponible'}
                            </Text>
                            <Text style={styles.lenteMarcaCategoria}>
                                {getMarcaNombre()} • {getCategoriaNombre()}
                            </Text>
                            <Text style={styles.lenteLinea}>{lente.linea || 'Línea no especificada'}</Text>
                            
                            {/* Badges de estado */}
                            <View style={styles.badgesContainer}>
                                <View style={[
                                    styles.stockBadgeMain,
                                    { backgroundColor: getStockColor(stockTotal) }
                                ]}>
                                    <Ionicons 
                                        name={getStockIcon(stockTotal)} 
                                        size={16} 
                                        color="#FFFFFF" 
                                    />
                                    <Text style={styles.stockBadgeText}>
                                        {stockTotal} en stock
                                    </Text>
                                </View>
                                
                                {lente.enPromocion && (
                                    <View style={styles.promocionBadgeMain}>
                                        <Ionicons name="pricetag" size={16} color="#FFFFFF" />
                                        <Text style={styles.promocionBadgeText}>EN OFERTA</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Información básica */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN BÁSICA</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'information-circle', 
                                'Descripción', 
                                lente.descripcion,
                                '#009BBF'
                            )}
                            {renderDetailField(
                                'glasses', 
                                'Tipo de lente', 
                                lente.tipoLente,
                                '#009BBF'
                            )}
                            {renderDetailField(
                                'resize', 
                                'Medidas', 
                                formatMedidas(),
                                '#009BBF'
                            )}
                        </View>
                    </View>

                    {/* Características físicas */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>CARACTERÍSTICAS FÍSICAS</Text>
                        <View style={styles.sectionContent}>
                            {renderDetailField(
                                'diamond', 
                                'Material', 
                                lente.material,
                                '#49AA4C'
                            )}
                            {renderDetailField(
                                'color-palette', 
                                'Color', 
                                lente.color,
                                '#49AA4C'
                            )}
                        </View>
                    </View>

                    {/* Información de precios */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DE PRECIOS</Text>
                        <View style={styles.priceSection}>
                            <View style={styles.priceItem}>
                                <Text style={styles.priceLabel}>Precio Base:</Text>
                                <Text style={[styles.priceValue, hasDiscount && styles.priceStrikethrough]}>
                                    {formatPrice(lente.precioBase)}
                                </Text>
                            </View>
                            <View style={styles.priceItem}>
                                <Text style={styles.priceLabel}>Precio Actual:</Text>
                                <Text style={[styles.priceValue, styles.priceActual]}>
                                    {formatPrice(lente.precioActual)}
                                </Text>
                            </View>
                            {hasDiscount && (
                                <View style={styles.discountContainer}>
                                    <Text style={styles.discountText}>
                                        ¡Ahorro de {formatPrice(lente.precioBase - lente.precioActual)}!
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Stock por sucursales */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>STOCK POR SUCURSALES</Text>
                        <View style={styles.sectionContent}>
                            {renderSucursalInfo()}
                        </View>
                    </View>

                    {/* Información del sistema */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN DEL SISTEMA</Text>
                        <View style={styles.systemInfo}>
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>ID del producto:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {lente._id ? lente._id.slice(-8) : 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Fecha de creación:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {formatFullDate(lente.fechaCreacion)}
                                </Text>
                            </View>
                            <View style={styles.systemInfoDivider} />
                            <View style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>Última actualización:</Text>
                                <Text style={styles.systemInfoValue}>
                                    {formatFullDate(lente.updatedAt)}
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
                        style={styles.editButton}
                        onPress={() => onEdit(lente)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create" size={20} color="#49AA4C" />
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => onDelete(lente)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash" size={20} color="#D0155F" />
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.closeButtonAction}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.closeButtonActionText}>Cerrar</Text>
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
    
    // Header del lente
    lenteHeader: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    // Contenedor de imagen
    imageContainer: {
        marginRight: 16,
    },
    
    // Imagen del lente
    lenteImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
    },
    
    // Imagen placeholder
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E5E5',
        borderStyle: 'dashed',
    },
    
    // Información del lente
    lenteInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    
    // Nombre del lente
    lenteNombre: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    
    // Marca y categoría
    lenteMarcaCategoria: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginBottom: 4,
    },
    
    // Línea del lente
    lenteLinea: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#999999',
        marginBottom: 12,
    },
    
    // Contenedor de badges
    badgesContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    
    // Badge principal de stock
    stockBadgeMain: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    
    // Texto del badge de stock
    stockBadgeText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    
    // Badge de promoción
    promocionBadgeMain: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF8C00',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    
    // Texto del badge de promoción
    promocionBadgeText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    
    // Sección
    section: {
        marginHorizontal: 20,
        marginTop: 20,
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
    
    // Sección de precios
    priceSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    // Item de precio
    priceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    
    // Etiqueta de precio
    priceLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    
    // Valor de precio
    priceValue: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    
    // Precio con descuento
    priceStrikethrough: {
        textDecorationLine: 'line-through',
        color: '#999999',
    },
    
    // Precio actual destacado
    priceActual: {
        color: '#49AA4C',
        fontSize: 18,
    },
    
    // Contenedor de descuento
    discountContainer: {
        backgroundColor: '#49AA4C15',
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
        alignItems: 'center',
    },
    
    // Texto de descuento
    discountText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#49AA4C',
    },
    
    // Item de sucursal
    sucursalItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    
    // Información de sucursal
    sucursalInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    
    // Nombre de sucursal
    sucursalNombre: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        flex: 1,
    },
    
    // Badge de stock
    stockBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    
    // Texto de stock
    stockText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        textTransform: 'uppercase',
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
    
    // Divisor de información del sistema
    systemInfoDivider: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginVertical: 4,
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
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
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
    
    // Botón de editar
    editButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#49AA4C15',
        borderWidth: 1,
        borderColor: '#49AA4C30',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    
    // Texto del botón de editar
    editButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#49AA4C',
    },
    
    // Botón de eliminar
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#D0155F15',
        borderWidth: 1,
        borderColor: '#D0155F30',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    
    // Texto del botón de eliminar
    deleteButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#D0155F',
    },
    
    // Botón de cerrar en acciones
    closeButtonAction: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Texto del botón de cerrar en acciones
    closeButtonActionText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default LenteDetailModal;