import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAddLente } from '../../hooks/useLente/UseAddLente.js';


/**
 * Componente AddLenteModal (Actualizado con Hook)
 * 
 * Modal para agregar nuevos lentes utilizando el hook useAddLente
 * para manejar toda la lógica de estado y validación.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onSuccess - Función que se ejecuta al crear exitosamente el lente
 */
const AddLenteModal = ({ visible, onClose, onSuccess }) => {
    const {
        // Estados del formulario - Información Básica
        nombre, setNombre,
        descripcion, setDescripcion,
        
        // Estados del formulario - Categorización
        categoriaId, setCategoriaId,
        marcaId, setMarcaId,
        linea, setLinea,
        
        // Estados del formulario - Características Físicas
        material, setMaterial,
        color, setColor,
        tipoLente, setTipoLente,
        
        // Estados del formulario - Medidas del Lente
        anchoPuente, setAnchoPuente,
        altura, setAltura,
        ancho, setAncho,
        
        // Estados del formulario - Información de Precios
        precioBase, setPrecioBase,
        precioActual, setPrecioActual,
        enPromocion, setEnPromocion,
        
        // Estados del formulario - Información Adicional
        fechaCreacion, setFechaCreacion,
        
        // Estados del formulario - Sucursales
        sucursales, updateSucursalStock,
        
        // Estados de datos externos
        categorias, marcas,
        
        // Estados de control
        loading, errors,
        
        // Funciones
        loadInitialData,
        clearForm,
        createLente,
        validateField
    } = useAddLente();

    /**
     * Cargar datos iniciales cuando se abre el modal
     */
    useEffect(() => {
        if (visible) {
            loadInitialData();
            setFechaCreacion(new Date().toISOString().split('T')[0]);
        }
    }, [visible]);

    /**
     * Manejar el guardado del lente
     */
    const handleSave = async () => {
        const success = await createLente((newLente) => {
            if (onSuccess) onSuccess(newLente);
        });
        if (success) {
            onClose();
        }
    };

    /**
     * Cerrar modal y limpiar formulario
     */
    const handleClose = () => {
        clearForm();
        onClose();
    };

    /**
     * Renderizar campo de entrada de texto con validación
     */
    const renderTextInput = (label, value, onChangeText, placeholder, required = false, keyboardType = 'default', multiline = false, field = null) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
                style={[
                    styles.textInput, 
                    multiline && styles.multilineInput,
                    errors[field] && styles.inputError
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                onBlur={field ? () => validateField(field, value) : undefined}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    /**
     * Renderizar selector con opciones
     */
    const renderPicker = (label, selectedValue, onValueChange, options, placeholder, required = false, field = null) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={[styles.pickerContainer, errors[field] && styles.inputError]}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={(value) => {
                        onValueChange(value);
                        if (field && value) {
                            validateField(field, value);
                        }
                    }}
                    style={styles.picker}
                >
                    <Picker.Item label={placeholder} value="" />
                    {options.map((option) => (
                        <Picker.Item 
                            key={typeof option === 'object' ? option._id : option} 
                            label={typeof option === 'object' ? option.nombre : option} 
                            value={typeof option === 'object' ? option._id : option} 
                        />
                    ))}
                </Picker>
            </View>
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    /**
     * Renderizar selector de promoción
     */
    const renderPromocionSelector = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>¿Está en promoción?</Text>
            <View style={styles.promocionContainer}>
                <TouchableOpacity
                    style={[
                        styles.promocionOption,
                        !enPromocion && styles.promocionOptionSelected
                    ]}
                    onPress={() => setEnPromocion(false)}
                >
                    <Text style={[
                        styles.promocionText,
                        !enPromocion && styles.promocionTextSelected
                    ]}>
                        No
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.promocionOption,
                        enPromocion && styles.promocionOptionSelected
                    ]}
                    onPress={() => setEnPromocion(true)}
                >
                    <Text style={[
                        styles.promocionText,
                        enPromocion && styles.promocionTextSelected
                    ]}>
                        Sí
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    /**
     * Renderizar sucursales con stock
     */
    const renderSucursales = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Stock por Sucursal</Text>
            <Text style={styles.inputHint}>Ingresa la cantidad disponible en cada sucursal</Text>
            {sucursales.map((sucursal, index) => (
                <View key={sucursal.sucursalId || index} style={styles.sucursalItem}>
                    <Text style={styles.sucursalNombre}>{sucursal.nombreSucursal}</Text>
                    <TextInput
                        style={styles.stockInput}
                        value={sucursal.stock.toString()}
                        onChangeText={(value) => updateSucursalStock(sucursal.sucursalId, value)}
                        placeholder="0"
                        keyboardType="numeric"
                    />
                </View>
            ))}
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header del modal */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Agregar Nuevo Lente</Text>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Contenido del formulario */}
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Sección: Información Básica */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="information-circle" size={20} color="#009BBF" />
                            <Text style={styles.sectionTitle}>Información Básica</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {renderTextInput('Nombre del Lente', nombre, setNombre, 'Ej: Lente Focal Premium', true, 'default', false, 'nombre')}
                            {renderTextInput('Descripción', descripcion, setDescripcion, 'Describe las características del lente', true, 'default', true, 'descripcion')}
                        </View>
                    </View>

                    {/* Sección: Categorización */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="folder" size={20} color="#49AA4C" />
                            <Text style={styles.sectionTitle}>Categorización</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderPicker('Categoría', categoriaId, setCategoriaId, categorias, 'Selecciona una categoría', true, 'categoriaId')}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderPicker('Marca', marcaId, setMarcaId, marcas, 'Selecciona una marca', true, 'marcaId')}
                                </View>
                            </View>
                            {renderPicker('Línea de Producto', linea, setLinea, LINEAS_PRODUCTO, 'Selecciona una línea', true, 'linea')}
                        </View>
                    </View>

                    {/* Sección: Características Físicas */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="glasses" size={20} color="#D0155F" />
                            <Text style={styles.sectionTitle}>Características Físicas</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderPicker('Material', material, setMaterial, MATERIALES_LENTE, 'Selecciona el material', true, 'material')}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderPicker('Color', color, setColor, COLORES_LENTE, 'Selecciona el color', true, 'color')}
                                </View>
                            </View>
                            {renderPicker('Tipo de Lente', tipoLente, setTipoLente, TIPOS_LENTE, 'Selecciona el tipo', true, 'tipoLente')}
                        </View>
                    </View>

                    {/* Sección: Medidas del Lente */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="resize" size={20} color="#FF8C00" />
                            <Text style={styles.sectionTitle}>Medidas del Lente</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.thirdWidth}>
                                    {renderTextInput('Ancho Puente', anchoPuente, setAnchoPuente, '18', true, 'numeric', false, 'anchoPuente')}
                                    <Text style={styles.inputHint}>mm</Text>
                                </View>
                                <View style={styles.thirdWidth}>
                                    {renderTextInput('Altura', altura, setAltura, '48', true, 'numeric', false, 'altura')}
                                    <Text style={styles.inputHint}>mm</Text>
                                </View>
                                <View style={styles.thirdWidth}>
                                    {renderTextInput('Ancho Total', ancho, setAncho, '135', true, 'numeric', false, 'ancho')}
                                    <Text style={styles.inputHint}>mm</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Sección: Información de Precios */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="cash" size={20} color="#6366F1" />
                            <Text style={styles.sectionTitle}>Información de Precios</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Precio Base', precioBase, setPrecioBase, '80.00', true, 'numeric', false, 'precioBase')}
                                    <Text style={styles.inputHint}>Precio original sin descuentos</Text>
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Precio Actual', precioActual, setPrecioActual, '68.00', true, 'numeric', false, 'precioActual')}
                                    <Text style={styles.inputHint}>Precio de venta actual</Text>
                                </View>
                            </View>
                            {renderPromocionSelector()}
                        </View>
                    </View>

                    {/* Sección: Información Adicional */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="calendar" size={20} color="#10B981" />
                            <Text style={styles.sectionTitle}>Información Adicional</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {renderTextInput('Fecha de Creación', fechaCreacion, setFechaCreacion, '2024-01-15', true, 'default', false, 'fechaCreacion')}
                        </View>
                    </View>

                    {/* Sección: Sucursales Disponibles */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="business" size={20} color="#8B5CF6" />
                            <Text style={styles.sectionTitle}>Sucursales Disponibles</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {renderSucursales()}
                        </View>
                    </View>

                    {/* Espaciador */}
                    <View style={styles.spacer} />
                </ScrollView>

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Ionicons name="save" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Guardando...' : 'Guardar Lente'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#009BBF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        flex: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    section: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    sectionContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    thirdWidth: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    required: {
        color: '#D0155F',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: '#DC2626',
        borderWidth: 2,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    inputHint: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#DC2626',
        marginTop: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        fontSize: 14,
    },
    promocionContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    promocionOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
    },
    promocionOptionSelected: {
        borderColor: '#009BBF',
        backgroundColor: '#009BBF',
    },
    promocionText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    promocionTextSelected: {
        color: '#FFFFFF',
    },
    sucursalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sucursalNombre: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        flex: 1,
    },
    stockInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
        width: 80,
        textAlign: 'center',
    },
    spacer: {
        height: 40,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default AddLenteModal;