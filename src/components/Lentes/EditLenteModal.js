import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente EditLenteModal
 * 
 * Modal para editar lentes existentes con formulario organizado por secciones
 * siguiendo el diseño del sitio web de escritorio pero diferenciándose visualmente
 * del modal de agregar lente.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Object} lente - Datos del lente a editar
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onSuccess - Función que se ejecuta al actualizar exitosamente el lente
 */
const EditLenteModal = ({ visible, lente, onClose, onSuccess }) => {
    const { getAuthHeaders } = useAuth();
    
    // Estados del formulario - Información Básica
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    // Estados del formulario - Categorización
    const [categoriaId, setCategoriaId] = useState('');
    const [marcaId, setMarcaId] = useState('');
    const [linea, setLinea] = useState('');

    // Estados del formulario - Características Físicas
    const [material, setMaterial] = useState('');
    const [color, setColor] = useState('');
    const [tipoLente, setTipoLente] = useState('');

    // Estados del formulario - Medidas del Lente
    const [anchoPuente, setAnchoPuente] = useState('');
    const [altura, setAltura] = useState('');
    const [ancho, setAncho] = useState('');

    // Estados del formulario - Información de Precios
    const [precioBase, setPrecioBase] = useState('');
    const [precioActual, setPrecioActual] = useState('');
    const [enPromocion, setEnPromocion] = useState(false);

    // Estados del formulario - Información Adicional
    const [fechaCreacion, setFechaCreacion] = useState('');

    // Estados del formulario - Sucursales
    const [sucursales, setSucursales] = useState([]);

    // Estados de datos externos
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [initialData, setInitialData] = useState(null);

    // Opciones predefinidas
    const tiposLente = ['Monofocal', 'Bifocal', 'Progresivo', 'Ocupacional'];
    const materiales = ['Acetato', 'Metal', 'TR90', 'Titanio', 'Orgánico', 'Policarbonato'];
    const lineas = ['Premium', 'Económica', 'Estándar', 'Lujo'];
    const colores = ['Negro', 'Marrón', 'Azul', 'Gris', 'Transparente', 'Dorado', 'Plateado', 'Rojo', 'Verde'];

    /**
     * Cargar datos del lente cuando se abre el modal
     */
    useEffect(() => {
        if (visible && lente) {
            loadLenteData(lente);
            loadInitialData();
        }
    }, [visible, lente]);

    /**
     * Cargar categorías, marcas y sucursales desde el servidor
     */
    const loadInitialData = async () => {
        try {
            const headers = getAuthHeaders();
            
            // Cargar categorías, marcas y sucursales en paralelo
            const [categoriasRes, marcasRes, sucursalesRes] = await Promise.all([
                fetch('https://a-u-r-o-r-a.onrender.com/api/categorias', { headers }),
                fetch('https://a-u-r-o-r-a.onrender.com/api/marcas', { headers }),
                fetch('https://a-u-r-o-r-a.onrender.com/api/sucursales', { headers })
            ]);

            if (categoriasRes.ok) {
                const categoriasData = await categoriasRes.json();
                setCategorias(categoriasData);
            }

            if (marcasRes.ok) {
                const marcasData = await marcasRes.json();
                setMarcas(marcasData);
            }

            if (sucursalesRes.ok) {
                const sucursalesData = await sucursalesRes.json();
                setSucursalesDisponibles(sucursalesData);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    /**
     * Cargar datos del lente existente en el formulario
     */
    const loadLenteData = (lenteData) => {
        if (!lenteData) return;
        
        setNombre(lenteData.nombre || '');
        setDescripcion(lenteData.descripcion || '');
        
        // Manejar IDs de categoría y marca
        setCategoriaId(typeof lenteData.categoriaId === 'object' ? lenteData.categoriaId._id : lenteData.categoriaId || '');
        setMarcaId(typeof lenteData.marcaId === 'object' ? lenteData.marcaId._id : lenteData.marcaId || '');
        
        setLinea(lenteData.linea || '');
        setMaterial(lenteData.material || '');
        setColor(lenteData.color || '');
        setTipoLente(lenteData.tipoLente || '');
        
        // Cargar medidas
        if (lenteData.medidas) {
            setAnchoPuente(lenteData.medidas.anchoPuente?.toString() || '');
            setAltura(lenteData.medidas.altura?.toString() || '');
            setAncho(lenteData.medidas.ancho?.toString() || '');
        } else {
            setAnchoPuente('');
            setAltura('');
            setAncho('');
        }
        
        setPrecioBase(lenteData.precioBase?.toString() || '');
        setPrecioActual(lenteData.precioActual?.toString() || '');
        setEnPromocion(lenteData.enPromocion || false);
        
        // Formatear fecha
        if (lenteData.fechaCreacion) {
            const fecha = new Date(lenteData.fechaCreacion);
            setFechaCreacion(fecha.toISOString().split('T')[0]);
        } else {
            setFechaCreacion('');
        }
        
        // Cargar sucursales
        setSucursales(lenteData.sucursales || []);
        
        setErrors({});
        
        // Guardar datos iniciales para comparación
        setInitialData(lenteData);
    };

    /**
     * Limpiar todos los campos del formulario
     */
    const clearForm = () => {
        setNombre('');
        setDescripcion('');
        setCategoriaId('');
        setMarcaId('');
        setLinea('');
        setMaterial('');
        setColor('');
        setTipoLente('');
        setAnchoPuente('');
        setAltura('');
        setAncho('');
        setPrecioBase('');
        setPrecioActual('');
        setEnPromocion(false);
        setFechaCreacion('');
        setSucursales([]);
        setErrors({});
        setInitialData(null);
    };

    /**
     * Verificar si hay cambios en los datos
     */
    const hasChanges = () => {
        if (!initialData) return false;
        
        const currentData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoriaId,
            marcaId,
            linea,
            material,
            color,
            tipoLente,
            precioBase: parseFloat(precioBase) || 0,
            precioActual: parseFloat(precioActual) || 0,
            enPromocion,
            fechaCreacion: new Date(fechaCreacion),
            medidas: {
                anchoPuente: parseFloat(anchoPuente) || 0,
                altura: parseFloat(altura) || 0,
                ancho: parseFloat(ancho) || 0
            }
        };
        
        // Comparar datos básicos
        const initialCategoriaId = typeof initialData.categoriaId === 'object' ? initialData.categoriaId._id : initialData.categoriaId;
        const initialMarcaId = typeof initialData.marcaId === 'object' ? initialData.marcaId._id : initialData.marcaId;
        
        if (currentData.nombre !== (initialData.nombre || '') ||
            currentData.descripcion !== (initialData.descripcion || '') ||
            currentData.categoriaId !== initialCategoriaId ||
            currentData.marcaId !== initialMarcaId ||
            currentData.linea !== (initialData.linea || '') ||
            currentData.material !== (initialData.material || '') ||
            currentData.color !== (initialData.color || '') ||
            currentData.tipoLente !== (initialData.tipoLente || '') ||
            currentData.precioBase !== (initialData.precioBase || 0) ||
            currentData.precioActual !== (initialData.precioActual || 0) ||
            currentData.enPromocion !== (initialData.enPromocion || false)) {
            return true;
        }
        
        // Comparar medidas
        const initialMedidas = initialData.medidas || {};
        if (currentData.medidas.anchoPuente !== (initialMedidas.anchoPuente || 0) ||
            currentData.medidas.altura !== (initialMedidas.altura || 0) ||
            currentData.medidas.ancho !== (initialMedidas.ancho || 0)) {
            return true;
        }
        
        // Comparar fecha
        const initialFecha = initialData.fechaCreacion ? new Date(initialData.fechaCreacion).toISOString().split('T')[0] : '';
        if (fechaCreacion !== initialFecha) {
            return true;
        }
        
        return false;
    };

    /**
     * Validar formulario completo antes de enviar
     */
    const validateForm = () => {
        const newErrors = {};

        if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
        if (!categoriaId) newErrors.categoriaId = 'La categoría es requerida';
        if (!marcaId) newErrors.marcaId = 'La marca es requerida';
        if (!material) newErrors.material = 'El material es requerido';
        if (!color) newErrors.color = 'El color es requerido';
        if (!tipoLente) newErrors.tipoLente = 'El tipo de lente es requerido';
        if (!linea) newErrors.linea = 'La línea es requerida';
        
        // Validar medidas
        if (!anchoPuente || isNaN(anchoPuente) || anchoPuente <= 0) {
            newErrors.anchoPuente = 'El ancho del puente debe ser un número positivo';
        }
        if (!altura || isNaN(altura) || altura <= 0) {
            newErrors.altura = 'La altura debe ser un número positivo';
        }
        if (!ancho || isNaN(ancho) || ancho <= 0) {
            newErrors.ancho = 'El ancho debe ser un número positivo';
        }

        // Validar precios
        if (!precioBase || isNaN(precioBase) || precioBase <= 0) {
            newErrors.precioBase = 'El precio base debe ser un número positivo';
        }
        if (!precioActual || isNaN(precioActual) || precioActual <= 0) {
            newErrors.precioActual = 'El precio actual debe ser un número positivo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Actualizar stock de una sucursal específica
     */
    const updateSucursalStock = (sucursalId, stock) => {
        setSucursales(prev => 
            prev.map(s => 
                s.sucursalId === sucursalId 
                    ? { ...s, stock: parseInt(stock) || 0 }
                    : s
            )
        );
    };

    /**
     * Actualizar lente en el servidor
     */
    const updateLente = async () => {
        if (!lente?._id) {
            Alert.alert('Error', 'No se puede actualizar el lente');
            return false;
        }

        if (!validateForm()) return false;

        // Verificar si hay cambios
        if (!hasChanges()) {
            Alert.alert('Sin cambios', 'No se han detectado cambios en los datos del lente');
            return false;
        }

        setLoading(true);
        
        const lenteData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoriaId,
            marcaId,
            material,
            color,
            tipoLente,
            precioBase: parseFloat(precioBase),
            precioActual: parseFloat(precioActual),
            linea,
            medidas: {
                anchoPuente: parseFloat(anchoPuente),
                altura: parseFloat(altura),
                ancho: parseFloat(ancho)
            },
            enPromocion,
            fechaCreacion: new Date(fechaCreacion),
            sucursales: sucursales.filter(s => s.stock > 0) // Solo incluir sucursales con stock
        };

        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/lentes/${lente._id}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lenteData),
            });

            const responseData = await response.json();

            if (response.ok) {
                clearForm();
                if (onSuccess) {
                    onSuccess(responseData);
                }
                return true;
            } else {
                Alert.alert(
                    'Error al actualizar lente', 
                    responseData.message || 'No se pudo actualizar el lente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar lente:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Manejar el guardado del lente
     */
    const handleSave = async () => {
        await updateLente();
    };

    /**
     * Cerrar modal con confirmación si hay cambios
     */
    const handleClose = () => {
        if (hasChanges()) {
            Alert.alert(
                'Cambios sin guardar',
                '¿Estás seguro de que deseas cerrar sin guardar los cambios?',
                [
                    { text: 'Continuar editando', style: 'cancel' },
                    { 
                        text: 'Cerrar sin guardar', 
                        style: 'destructive',
                        onPress: () => {
                            clearForm();
                            onClose();
                        }
                    }
                ]
            );
        } else {
            clearForm();
            onClose();
        }
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
                    onValueChange={onValueChange}
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
            <Text style={styles.inputHint}>Actualiza la cantidad disponible en cada sucursal</Text>
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
                    <View style={styles.headerContent}>
                        <Ionicons name="create" size={24} color="#FFFFFF" />
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Editar Lente</Text>
                            {lente && (
                                <Text style={styles.headerSubtitle}>
                                    {lente.nombre}
                                </Text>
                            )}
                        </View>
                    </View>
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
                            <Ionicons name="information-circle" size={20} color="#49AA4C" />
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
                            <Ionicons name="folder" size={20} color="#FF8C00" />
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
                            {renderPicker('Línea de Producto', linea, setLinea, lineas, 'Selecciona una línea', true, 'linea')}
                        </View>
                    </View>

                    {/* Sección: Características Físicas */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="glasses" size={20} color="#6366F1" />
                            <Text style={styles.sectionTitle}>Características Físicas</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderPicker('Material', material, setMaterial, materiales, 'Selecciona el material', true, 'material')}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderPicker('Color', color, setColor, colores, 'Selecciona el color', true, 'color')}
                                </View>
                            </View>
                            {renderPicker('Tipo de Lente', tipoLente, setTipoLente, tiposLente, 'Selecciona el tipo', true, 'tipoLente')}
                        </View>
                    </View>

                    {/* Sección: Medidas del Lente */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="resize" size={20} color="#10B981" />
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
                            <Ionicons name="cash" size={20} color="#8B5CF6" />
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
                            <Ionicons name="calendar" size={20} color="#F59E0B" />
                            <Text style={styles.sectionTitle}>Información Adicional</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {renderTextInput('Fecha de Creación', fechaCreacion, setFechaCreacion, '2024-01-15', true, 'default', false, 'fechaCreacion')}
                        </View>
                    </View>

                    {/* Sección: Sucursales Disponibles */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="business" size={20} color="#EF4444" />
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
                        <Ionicons name="close-circle-outline" size={20} color="#666666" />
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.updateButtonText}>
                            {loading ? 'Actualizando...' : 'Actualizar Lente'}
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
        backgroundColor: '#49AA4C',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
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
        borderLeftWidth: 3,
        borderLeftColor: '#49AA4C',
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
        color: '#49AA4C',
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
        borderColor: '#49AA4C',
        backgroundColor: '#49AA4C',
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
        height: 20,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    updateButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#49AA4C',
        borderRadius: 10,
        gap: 8,
        shadowColor: '#49AA4C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    updateButtonDisabled: {
        backgroundColor: '#999999',
        shadowColor: 'transparent',
    },
    updateButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default EditLenteModal;