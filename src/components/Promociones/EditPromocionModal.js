import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    Alert,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const EditPromocionModal = ({ visible, promocion, index, onClose, onSuccess }) => {
    const { getAuthHeaders } = useAuth();
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipoDescuento: 'porcentaje',
        valorDescuento: '',
        aplicaA: 'todos',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        codigoPromo: '',
        prioridad: '0',
        limiteUsos: '',
        mostrarEnCarrusel: true,
        activo: true,
        categoriasSeleccionadas: [],
        productosSeleccionados: []
    });

    const [imagen, setImagen] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showDateInicio, setShowDateInicio] = useState(false);
    const [showDateFin, setShowDateFin] = useState(false);
    
    const [categorias, setCategorias] = useState([]);
    const [lentes, setLentes] = useState([]);
    const [accesorios, setAccesorios] = useState([]);
    const [showCategoriasModal, setShowCategoriasModal] = useState(false);
    const [showProductosModal, setShowProductosModal] = useState(false);

    // Cargar datos cuando el modal se abre
    useEffect(() => {
        if (visible) {
            cargarDatos();
        }
    }, [visible]);

    useEffect(() => {
        if (visible && promocion && categorias.length > 0) {
            loadPromocionData();
        }
    }, [visible, promocion, categorias, lentes, accesorios]);

    const cargarDatos = async () => {
        try {
            // Cargar categorías
            const categoriasResponse = await fetch('https://aurora-production-7e57.up.railway.app/api/categoria', {
                headers: getAuthHeaders(),
            });
            if (categoriasResponse.ok) {
                const categoriasData = await categoriasResponse.json();
                setCategorias(categoriasData);
            }

            // Cargar lentes
            const lentesResponse = await fetch('https://a-u-r-o-r-a.onrender.com/api/lentes', {
                headers: getAuthHeaders(),
            });
            if (lentesResponse.ok) {
                const lentesData = await lentesResponse.json();
                setLentes(Array.isArray(lentesData) ? lentesData : []);
            }

            // Cargar accesorios
            const accesoriosResponse = await fetch('https://a-u-r-o-r-a.onrender.com/api/accesorios', {
                headers: getAuthHeaders(),
            });
            if (accesoriosResponse.ok) {
                const accesoriosData = await accesoriosResponse.json();
                setAccesorios(Array.isArray(accesoriosData) ? accesoriosData : []);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    };

    // Combinar lentes y accesorios
    const productos = [...lentes, ...accesorios];

    const loadPromocionData = () => {
        if (!promocion || categorias.length === 0) return;
        
        // Cargar categorías seleccionadas con datos completos
        const categoriasCompletas = promocion.categoriasAplicables 
            ? categorias.filter(cat => 
                Array.isArray(promocion.categoriasAplicables) 
                    ? promocion.categoriasAplicables.includes(cat._id)
                    : false
              )
            : [];

        // Cargar productos seleccionados con datos completos
        const productosCompletos = promocion.productosAplicables 
            ? productos.filter(prod => 
                Array.isArray(promocion.productosAplicables) 
                    ? promocion.productosAplicables.includes(prod._id)
                    : false
              )
            : [];

        setFormData({
            nombre: promocion.nombre || '',
            descripcion: promocion.descripcion || '',
            tipoDescuento: promocion.tipoDescuento || 'porcentaje',
            valorDescuento: promocion.valorDescuento?.toString() || '',
            aplicaA: promocion.aplicaA || 'todos',
            fechaInicio: promocion.fechaInicio ? new Date(promocion.fechaInicio) : new Date(),
            fechaFin: promocion.fechaFin ? new Date(promocion.fechaFin) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            codigoPromo: promocion.codigoPromo || '',
            prioridad: promocion.prioridad?.toString() || '0',
            limiteUsos: promocion.limiteUsos?.toString() || '',
            mostrarEnCarrusel: promocion.mostrarEnCarrusel !== undefined ? promocion.mostrarEnCarrusel : true,
            activo: promocion.activo !== undefined ? promocion.activo : true,
            categoriasSeleccionadas: categoriasCompletas,
            productosSeleccionados: productosCompletos
        });

        setImagen(promocion.imagen || null);
        setErrors({});
    };

    const seleccionarImagen = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una imagen.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImagen(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const onChangeFechaInicio = (event, selectedDate) => {
        setShowDateInicio(false);
        if (selectedDate) {
            setFormData({...formData, fechaInicio: selectedDate});
        }
    };

    const onChangeFechaFin = (event, selectedDate) => {
        setShowDateFin(false);
        if (selectedDate) {
            setFormData({...formData, fechaFin: selectedDate});
        }
    };

    const toggleCategoria = (categoria) => {
        const exists = formData.categoriasSeleccionadas.find(cat => cat._id === categoria._id);
        if (exists) {
            setFormData({
                ...formData, 
                categoriasSeleccionadas: formData.categoriasSeleccionadas.filter(cat => cat._id !== categoria._id)
            });
        } else {
            setFormData({
                ...formData, 
                categoriasSeleccionadas: [...formData.categoriasSeleccionadas, categoria]
            });
        }
    };

    const toggleProducto = (producto) => {
        const exists = formData.productosSeleccionados.find(prod => prod._id === producto._id);
        if (exists) {
            setFormData({
                ...formData, 
                productosSeleccionados: formData.productosSeleccionados.filter(prod => prod._id !== producto._id)
            });
        } else {
            setFormData({
                ...formData, 
                productosSeleccionados: [...formData.productosSeleccionados, producto]
            });
        }
    };

    const validateField = (field, value) => {
        let error = null;
        
        switch (field) {
            case 'nombre':
                if (!value?.trim()) error = 'El nombre es obligatorio';
                break;
            case 'descripcion':
                if (!value?.trim()) error = 'La descripción es obligatoria';
                break;
            case 'valorDescuento':
                if (!value || Number(value) <= 0) error = 'El valor del descuento debe ser mayor a 0';
                if (formData.tipoDescuento === 'porcentaje' && Number(value) > 100) error = 'El descuento por porcentaje no puede ser mayor a 100%';
                break;
            case 'codigoPromo':
                if (!value?.trim()) error = 'El código de promoción es obligatorio';
                break;
            case 'categoriasSeleccionadas':
                if (formData.aplicaA === 'categoria' && (!value || value.length === 0)) {
                    error = 'Debe seleccionar al menos una categoría';
                }
                break;
            case 'productosSeleccionados':
                if (formData.aplicaA === 'producto' && (!value || value.length === 0)) {
                    error = 'Debe seleccionar al menos un producto';
                }
                break;
        }
        
        setErrors(prev => ({ ...prev, [field]: error }));
        return !error;
    };

    const validateForm = () => {
        const fieldsToValidate = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            valorDescuento: formData.valorDescuento,
            codigoPromo: formData.codigoPromo,
            categoriasSeleccionadas: formData.categoriasSeleccionadas,
            productosSeleccionados: formData.productosSeleccionados,
        };

        let isValid = true;

        Object.keys(fieldsToValidate).forEach(field => {
            if (!validateField(field, fieldsToValidate[field])) {
                isValid = false;
            }
        });

        return isValid;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert('Error', 'Por favor completa todos los campos requeridos correctamente');
            return;
        }

        if (!promocion?._id) {
            Alert.alert('Error', 'No se puede actualizar la promoción');
            return;
        }

        // Preparar datos según el tipo de aplicación
        let categoriasAplicables = [];
        let productosAplicables = [];

        if (formData.aplicaA === 'categoria') {
            categoriasAplicables = formData.categoriasSeleccionadas.map(cat => cat._id);
        } else if (formData.aplicaA === 'producto') {
            productosAplicables = formData.productosSeleccionados.map(prod => prod._id);
        }

        const promocionData = {
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            tipoDescuento: formData.tipoDescuento,
            valorDescuento: Number(formData.valorDescuento),
            aplicaA: formData.aplicaA,
            fechaInicio: formData.fechaInicio.toISOString(),
            fechaFin: formData.fechaFin.toISOString(),
            codigoPromo: formData.codigoPromo.trim().toUpperCase(),
            prioridad: Number(formData.prioridad),
            limiteUsos: formData.limiteUsos ? Number(formData.limiteUsos) : null,
            mostrarEnCarrusel: formData.mostrarEnCarrusel,
            activo: formData.activo,
            imagen: imagen,
            categoriasAplicables: categoriasAplicables,
            productosAplicables: productosAplicables
        };

        setLoading(true);
        
        try {
            const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/promociones/${promocion._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(promocionData),
            });

            if (response.ok) {
                const responseData = await response.json();
                onSuccess(responseData.promocion || responseData);
                handleClose();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar promoción');
            }
        } catch (error) {
            console.error('Error updating promocion:', error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            tipoDescuento: 'porcentaje',
            valorDescuento: '',
            aplicaA: 'todos',
            fechaInicio: new Date(),
            fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            codigoPromo: '',
            prioridad: '0',
            limiteUsos: '',
            mostrarEnCarrusel: true,
            activo: true,
            categoriasSeleccionadas: [],
            productosSeleccionados: []
        });
        setImagen(null);
        setErrors({});
        onClose();
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderTextInput = (label, value, field, placeholder, keyboardType = 'default', required = true) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
                style={[
                    styles.textInput,
                    errors[field] && styles.inputError
                ]}
                value={value}
                onChangeText={(text) => setFormData({...formData, [field]: text})}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                keyboardType={keyboardType}
                onBlur={() => validateField(field, value)}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    const renderDateInput = (label, value, field, onPress) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.dateInput} onPress={onPress}>
                <Text style={styles.dateText}>{formatDate(value)}</Text>
                <Ionicons name="calendar" size={20} color="#009BBF" />
            </TouchableOpacity>
        </View>
    );

    const CategoriasModal = () => (
        <Modal
            visible={showCategoriasModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Seleccionar Categorías</Text>
                    <TouchableOpacity onPress={() => setShowCategoriasModal(false)}>
                        <Ionicons name="close" size={24} color="#666666" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                    {categorias.map((categoria) => {
                        const isSelected = formData.categoriasSeleccionadas.find(cat => cat._id === categoria._id);
                        return (
                            <TouchableOpacity
                                key={categoria._id}
                                style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                                onPress={() => toggleCategoria(categoria)}
                            >
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                    {categoria.nombre}
                                </Text>
                                {isSelected && (
                                    <Ionicons name="checkmark" size={20} color="#49AA4C" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <View style={styles.modalActions}>
                    <TouchableOpacity 
                        style={styles.modalConfirmButton}
                        onPress={() => {
                            validateField('categoriasSeleccionadas', formData.categoriasSeleccionadas);
                            setShowCategoriasModal(false);
                        }}
                    >
                        <Text style={styles.modalConfirmText}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );

    const ProductosModal = () => (
        <Modal
            visible={showProductosModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Seleccionar Productos</Text>
                    <TouchableOpacity onPress={() => setShowProductosModal(false)}>
                        <Ionicons name="close" size={24} color="#666666" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                    {productos.map((producto) => {
                        const isSelected = formData.productosSeleccionados.find(prod => prod._id === producto._id);
                        return (
                            <TouchableOpacity
                                key={producto._id}
                                style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                                onPress={() => toggleProducto(producto)}
                            >
                                <View style={styles.productoInfo}>
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {producto.nombre}
                                    </Text>
                                    <Text style={styles.productoPrecio}>
                                        ${producto.precioActual || producto.precioBase || 0}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <Ionicons name="checkmark" size={20} color="#49AA4C" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <View style={styles.modalActions}>
                    <TouchableOpacity 
                        style={styles.modalConfirmButton}
                        onPress={() => {
                            validateField('productosSeleccionados', formData.productosSeleccionados);
                            setShowProductosModal(false);
                        }}
                    >
                        <Text style={styles.modalConfirmText}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Ionicons name="pricetag" size={24} color="#FFFFFF" />
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Editar Promoción</Text>
                            {promocion && (
                                <Text style={styles.headerSubtitle}>
                                    {promocion.codigoPromo}
                                </Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Sección de Imagen */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Imagen de la Promoción</Text>
                        <View style={styles.imageSection}>
                            {imagen ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: imagen }} style={styles.imagePreview} />
                                    <TouchableOpacity 
                                        style={styles.changeImageButton}
                                        onPress={seleccionarImagen}
                                    >
                                        <Ionicons name="camera" size={20} color="#FFFFFF" />
                                        <Text style={styles.changeImageText}>Cambiar Imagen</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    style={styles.uploadImageButton}
                                    onPress={seleccionarImagen}
                                >
                                    <Ionicons name="cloud-upload" size={40} color="#49AA4C" />
                                    <Text style={styles.uploadImageText}>Subir Imagen</Text>
                                    <Text style={styles.imageRecommendation}>
                                        Recomendado: 1200x675px (16:9) para mejor visualización en el carrusel
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Información Básica */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información Básica</Text>
                        
                        {renderTextInput('Nombre de la Promoción', formData.nombre, 'nombre', 'Nombre de la promoción', 'default')}
                        {renderTextInput('Descripción', formData.descripcion, 'descripcion', 'Descripción de la promoción', 'default')}
                    </View>

                    {/* Descuento */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Descuento</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Tipo de Descuento</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.tipoDescuento}
                                    onValueChange={(value) => setFormData({...formData, tipoDescuento: value})}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}
                                >
                                    <Picker.Item label="Porcentaje (%)" value="porcentaje" color="#1A1A1A" />
                                    <Picker.Item label="Monto Fijo" value="monto" color="#1A1A1A" />
                                </Picker>
                            </View>
                        </View>

                        {renderTextInput('Valor del Descuento', formData.valorDescuento, 'valorDescuento', 
                            formData.tipoDescuento === 'porcentaje' ? '0' : '0.00', 
                            'numeric')}
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Aplicar Promoción A</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.aplicaA}
                                    onValueChange={(value) => setFormData({...formData, aplicaA: value})}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}
                                >
                                    <Picker.Item label="Todos los productos" value="todos" color="#1A1A1A" />
                                    <Picker.Item label="Categorías específicas" value="categoria" color="#1A1A1A" />
                                    <Picker.Item label="Productos específicos" value="producto" color="#1A1A1A" />
                                </Picker>
                            </View>
                        </View>

                        {formData.aplicaA === 'categoria' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Categorías Seleccionadas</Text>
                                <TouchableOpacity 
                                    style={styles.selectorButton}
                                    onPress={() => setShowCategoriasModal(true)}
                                >
                                    <Text style={styles.selectorButtonText}>
                                        {formData.categoriasSeleccionadas.length > 0 
                                            ? `${formData.categoriasSeleccionadas.length} categoría(s) seleccionada(s)`
                                            : 'Seleccionar categorías'
                                        }
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#666666" />
                                </TouchableOpacity>
                                {errors.categoriasSeleccionadas && (
                                    <Text style={styles.errorText}>{errors.categoriasSeleccionadas}</Text>
                                )}
                            </View>
                        )}

                        {formData.aplicaA === 'producto' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Productos Seleccionados</Text>
                                <TouchableOpacity 
                                    style={styles.selectorButton}
                                    onPress={() => setShowProductosModal(true)}
                                >
                                    <Text style={styles.selectorButtonText}>
                                        {formData.productosSeleccionados.length > 0 
                                            ? `${formData.productosSeleccionados.length} producto(s) seleccionado(s)`
                                            : 'Seleccionar productos'
                                        }
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#666666" />
                                </TouchableOpacity>
                                {errors.productosSeleccionados && (
                                    <Text style={styles.errorText}>{errors.productosSeleccionados}</Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Vigencia */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Vigencia</Text>
                        
                        {renderDateInput('Fecha de Inicio', formData.fechaInicio, 'fechaInicio', () => setShowDateInicio(true))}
                        {renderDateInput('Fecha de Fin', formData.fechaFin, 'fechaFin', () => setShowDateFin(true))}

                        {showDateInicio && (
                            <DateTimePicker
                                value={formData.fechaInicio}
                                mode="date"
                                display="default"
                                onChange={onChangeFechaInicio}
                                minimumDate={new Date()}
                            />
                        )}
                        {showDateFin && (
                            <DateTimePicker
                                value={formData.fechaFin}
                                mode="date"
                                display="default"
                                onChange={onChangeFechaFin}
                                minimumDate={formData.fechaInicio}
                            />
                        )}
                    </View>

                    {/* Configuración */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Configuración</Text>
                        
                        {renderTextInput('Código de Promoción', formData.codigoPromo, 'codigoPromo', 'Ej: DESCUENTO20, VERANO2024', 'default')}
                        
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                {renderTextInput('Prioridad (0-10)', formData.prioridad, 'prioridad', '0', 'numeric', false)}
                            </View>
                            <View style={styles.halfWidth}>
                                {renderTextInput('Límite de Usos', formData.limiteUsos, 'limiteUsos', 'Vacío = Ilimitado', 'numeric', false)}
                            </View>
                        </View>

                        <View style={styles.switchesContainer}>
                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>Mostrar en Carrusel Principal</Text>
                                <TouchableOpacity
                                    style={[styles.switch, formData.mostrarEnCarrusel && styles.switchActive]}
                                    onPress={() => setFormData({...formData, mostrarEnCarrusel: !formData.mostrarEnCarrusel})}
                                >
                                    <Text style={[styles.switchText, formData.mostrarEnCarrusel && styles.switchTextActive]}>
                                        {formData.mostrarEnCarrusel ? 'Disponible' : 'No disponible'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>Promoción Activa</Text>
                                <TouchableOpacity
                                    style={[styles.switch, formData.activo && styles.switchActive]}
                                    onPress={() => setFormData({...formData, activo: !formData.activo})}
                                >
                                    <Text style={[styles.switchText, formData.activo && styles.switchTextActive]}>
                                        {formData.activo ? 'Disponible' : 'No disponible'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.spacer} />
                </ScrollView>

                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={handleClose}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.updateButtonText}>
                            {loading ? 'Actualizando...' : 'Actualizar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <CategoriasModal />
                <ProductosModal />
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
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    imageSection: {
        alignItems: 'center',
    },
    uploadImageButton: {
        width: '100%',
        height: 150,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        borderStyle: 'dashed',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    uploadImageText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#49AA4C',
        marginTop: 8,
    },
    imageRecommendation: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'center',
        marginTop: 4,
    },
    imagePreviewContainer: {
        width: '100%',
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        marginBottom: 12,
    },
    changeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#49AA4C',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    changeImageText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
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
        paddingVertical: 12,
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    inputError: {
        borderColor: '#DC2626',
    },
    errorText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#DC2626',
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    picker: {
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
    },
    pickerItem: {
        color: '#1A1A1A',
        fontSize: 14,
        fontFamily: 'Lato-Regular',
    },
    selectorButton: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectorButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    switchesContainer: {
        marginTop: 8,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    switchLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        flex: 1,
    },
    switch: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        minWidth: 100,
        alignItems: 'center',
    },
    switchActive: {
        backgroundColor: '#49AA4C',
        borderColor: '#49AA4C',
    },
    switchText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    switchTextActive: {
        color: '#FFFFFF',
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
        paddingVertical: 14,
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    updateButton: {
        flex: 2,
        paddingVertical: 14,
        backgroundColor: '#49AA4C',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateButtonDisabled: {
        backgroundColor: '#999999',
    },
    updateButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    optionItemSelected: {
        borderColor: '#49AA4C',
        backgroundColor: '#49AA4C15',
    },
    optionText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        flex: 1,
    },
    optionTextSelected: {
        color: '#49AA4C',
        fontFamily: 'Lato-Bold',
    },
    productoInfo: {
        flex: 1,
    },
    productoPrecio: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 2,
    },
    modalActions: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    modalConfirmButton: {
        backgroundColor: '#49AA4C',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalConfirmText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default EditPromocionModal;