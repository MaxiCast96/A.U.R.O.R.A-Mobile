import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

/**
 * Componente AddAccesorioModal
 * 
 * Modal para agregar nuevos accesorios con formulario organizado por secciones
 * y subida de imágenes a Cloudinary.
 */
const AddAccesorioModal = ({
  visible,
  onClose,
  onSave,
  categorias = [],
  marcas = [],
  promociones = [],
  sucursales = [],
  materiales = [],
  colores = [],
}) => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    marcaId: '',
    linea: '',
    material: '',
    color: '',
    precioBase: '',
    precioActual: '',
    imagenes: [],
    enPromocion: false,
    promocionId: '',
    sucursales: [],
  });

  const [errors, setErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // Obtiene las líneas de producto de la marca seleccionada
  const lineasMarca = useMemo(() => {
    if (!form.marcaId) return [];
    const marca = marcas.find(m => m._id === form.marcaId);
    return Array.isArray(marca?.lineas) ? marca.lineas : [];
  }, [form.marcaId, marcas]);

  /**
   * Función para subir imagen a Cloudinary (específica para accesorios)
   */
  const uploadImageToCloudinary = async (imageUri) => {
    if (!imageUri) return null;

    try {
      console.log('Subiendo imagen de accesorio a Cloudinary...');
      
      const formData = new FormData();
      
      const filename = imageUri.split('/').pop() || `accesorio_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      // Usar el preset específico para accesorios
      formData.append('upload_preset', 'accesorios_unsigned');

      const response = await fetch(`https://api.cloudinary.com/v1_1/dv6zckgk4/image/upload`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok && responseData.secure_url) {
        console.log('Imagen de accesorio subida exitosamente:', responseData.secure_url);
        return responseData.secure_url;
      } else {
        console.error('Error de Cloudinary para accesorios:', responseData);
        throw new Error(responseData.error?.message || 'Error al subir imagen');
      }

    } catch (error) {
      console.error('Error subiendo imagen de accesorio:', error);
      throw error;
    }
  };

  /**
   * Validación completa del formulario
   */
  const validate = () => {
    const newErrors = {};
    
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!form.tipo) newErrors.tipo = 'La categoría es requerida';
    if (!form.marcaId) newErrors.marcaId = 'La marca es requerida';
    if (!form.material) newErrors.material = 'El material es requerido';
    if (!form.color) newErrors.color = 'El color es requerido';
    if (!form.linea) newErrors.linea = 'La línea es requerida';
    
    // Validación de precios
    const precioBase = Number(form.precioBase);
    if (!form.precioBase || isNaN(precioBase) || precioBase <= 0) {
      newErrors.precioBase = 'El precio base debe ser mayor a 0';
    }
    
    if (form.enPromocion) {
      if (!form.promocionId) newErrors.promocionId = 'Debe seleccionar una promoción';
      
      const precioActual = Number(form.precioActual);
      if (!form.precioActual || isNaN(precioActual) || precioActual <= 0) {
        newErrors.precioActual = 'El precio promocional debe ser mayor a 0';
      } else if (precioActual >= precioBase) {
        newErrors.precioActual = 'El precio promocional debe ser menor al precio base';
      }
    }
    
    // Validación de imágenes y sucursales
    if (!form.imagenes || form.imagenes.length === 0) {
      newErrors.imagenes = 'Se requiere al menos una imagen';
    }
    
    if (!form.sucursales || form.sucursales.length === 0) {
      newErrors.sucursales = 'Debe seleccionar al menos una sucursal';
    }
    
    const hasNegativeStock = form.sucursales.some(s => Number(s.stock) < 0);
    if (hasNegativeStock) {
      newErrors.sucursales = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Selector de imágenes con subida a Cloudinary
   */
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos acceso a tu galería para seleccionar imágenes'
      );
      return;
    }

    Alert.alert(
      'Agregar imágenes',
      'Selecciona una opción',
      [
        {
          text: 'Cámara',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Galería',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const pickImage = async (source) => {
    try {
      setUploadingImage(true);
      let result;

      const options = {
        mediaTypes: 'Images',
        allowsMultipleSelection: source === 'gallery',
        quality: 0.8,
        allowsEditing: false,
      };

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Error', 'Se necesitan permisos de cámara');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets) {
        console.log('Subiendo imágenes de accesorios a Cloudinary...');
        
        try {
          // Subir cada imagen a Cloudinary
          const uploadPromises = result.assets.map(asset => 
            uploadImageToCloudinary(asset.uri)
          );
          
          // Esperar a que todas se suban
          const cloudinaryUrls = await Promise.all(uploadPromises);
          
          // Filtrar URLs válidas
          const validUrls = cloudinaryUrls.filter(url => url !== null);
          
          if (validUrls.length > 0) {
            // Actualizar formulario con URLs de Cloudinary
            setForm(prev => ({ 
              ...prev, 
              imagenes: [...prev.imagenes, ...validUrls] 
            }));
            
            if (errors.imagenes) {
              setErrors(prev => ({ ...prev, imagenes: null }));
            }
            
            console.log(`${validUrls.length} imágenes de accesorios subidas exitosamente`);
          } else {
            Alert.alert('Error', 'No se pudieron subir las imágenes');
          }
          
        } catch (error) {
          console.error('Error subiendo imágenes de accesorios:', error);
          Alert.alert('Error', 'Error al subir imágenes a Cloudinary');
        }
      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
      Alert.alert('Error', 'No se pudieron seleccionar las imágenes');
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Eliminar imagen
   */
  const handleRemoveImage = (index) => {
    setForm(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  /**
   * Manejo de sucursales
   */
  const handleToggleSucursal = (sucursal) => {
    const exists = form.sucursales.find(x => x.sucursalId === sucursal._id);
    if (exists) {
      setForm(prev => ({
        ...prev,
        sucursales: prev.sucursales.filter(x => x.sucursalId !== sucursal._id)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        sucursales: [...prev.sucursales, { 
          sucursalId: sucursal._id, 
          nombreSucursal: sucursal.nombre, 
          stock: 0 
        }]
      }));
    }
    
    if (errors.sucursales) {
      setErrors(prev => ({ ...prev, sucursales: null }));
    }
  };

  const handleStockChange = (sucursalId, value) => {
    const numValue = parseInt(value) || 0;
    setForm(prev => ({
      ...prev,
      sucursales: prev.sucursales.map(x =>
        x.sucursalId === sucursalId ? { ...x, stock: numValue } : x
      )
    }));
  };

  /**
   * Resetear formulario
   */
  const resetForm = () => {
    setForm({
      nombre: '',
      descripcion: '',
      tipo: '',
      marcaId: '',
      linea: '',
      material: '',
      color: '',
      precioBase: '',
      precioActual: '',
      imagenes: [],
      enPromocion: false,
      promocionId: '',
      sucursales: [],
    });
    setErrors({});
  };

  /**
   * Guardar accesorio - Las imágenes ya son URLs de Cloudinary
   */
  const handleSave = () => {
    if (!validate()) {
      return;
    }

    console.log('📋 Datos del formulario ANTES de transformar:', form);

    // Las imágenes ya son URLs de Cloudinary válidas
    const dataToSend = {
      nombre: form.nombre?.trim(),
      descripcion: form.descripcion?.trim(),
      tipo: form.tipo,
      marcaId: form.marcaId,
      linea: form.linea?.trim(),
      material: form.material?.trim(),
      color: form.color?.trim(),
      precioBase: Number(form.precioBase),
      precioActual: form.enPromocion ? Number(form.precioActual) : Number(form.precioBase),
      // Las imágenes ya son URLs de Cloudinary
      imagenes: Array.isArray(form.imagenes) ? form.imagenes : [],
      enPromocion: !!form.enPromocion,
      promocionId: form.enPromocion ? form.promocionId : undefined,
      sucursales: Array.isArray(form.sucursales) ? form.sucursales
        .map(s => ({
          sucursalId: s.sucursalId,
          nombreSucursal: s.nombreSucursal,
          stock: Number(s.stock ?? 0),
        }))
        .filter(s => s.sucursalId)
        : [],
    };

    console.log('🚀 Datos TRANSFORMADOS para enviar:', JSON.stringify(dataToSend, null, 2));

    onSave(dataToSend);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
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
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  /**
   * Renderizar selector
   */
  const renderPicker = (label, selectedValue, onValueChange, options, placeholder, required = false, field = null, disabled = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={[
        styles.pickerContainer, 
        errors[field] && styles.inputError,
        disabled && styles.disabledInput
      ]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          enabled={!disabled}
        >
          <Picker.Item label={placeholder} value="" />
          {options.map((option) => (
            <Picker.Item 
              key={option.value || option._id || option} 
              label={option.label || option.nombre || option} 
              value={option.value || option._id || option} 
            />
          ))}
        </Picker>
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
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
          <Text style={styles.headerTitle}>Agregar Nuevo Accesorio</Text>
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
              <Ionicons name="information-circle" size={20} color="#00BCD4" />
              <Text style={styles.sectionTitle}>Información Básica</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderTextInput(
                'Nombre del accesorio', 
                form.nombre, 
                (v) => setForm(prev => ({ ...prev, nombre: v })), 
                'Ej: Estuche Premium',
                true,
                'default',
                false,
                'nombre'
              )}
              {renderTextInput(
                'Descripción del producto', 
                form.descripcion, 
                (v) => setForm(prev => ({ ...prev, descripcion: v })), 
                'Describe las características del accesorio...',
                true,
                'default',
                true,
                'descripcion'
              )}
            </View>
          </View>

          {/* Sección: Categorización */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetags" size={20} color="#9C27B0" />
              <Text style={styles.sectionTitle}>Categorización</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderPicker(
                'Categoría',
                form.tipo,
                (v) => setForm(prev => ({ ...prev, tipo: v })),
                categorias,
                'Selecciona una categoría',
                true,
                'tipo'
              )}
              
              {renderPicker(
                'Marca',
                form.marcaId,
                (v) => setForm(prev => ({ ...prev, marcaId: v, linea: '' })),
                marcas,
                'Selecciona una marca',
                true,
                'marcaId'
              )}

              {renderPicker(
                'Línea de producto',
                form.linea,
                (v) => setForm(prev => ({ ...prev, linea: v })),
                lineasMarca,
                !form.marcaId 
                  ? "Primero selecciona una marca" 
                  : lineasMarca.length === 0 
                    ? "No hay líneas disponibles" 
                    : "Selecciona una línea",
                true,
                'linea',
                !form.marcaId || lineasMarca.length === 0
              )}
            </View>
          </View>

          {/* Sección: Características Físicas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="layers" size={20} color="#FF9800" />
              <Text style={styles.sectionTitle}>Características Físicas</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderPicker(
                'Material',
                form.material,
                (v) => setForm(prev => ({ ...prev, material: v })),
                materiales.map(material => ({ label: material, value: material })),
                'Seleccione el material',
                true,
                'material'
              )}
              
              {renderPicker(
                'Color',
                form.color,
                (v) => setForm(prev => ({ ...prev, color: v })),
                colores.map(color => ({ label: color, value: color })),
                'Seleccione el color',
                true,
                'color'
              )}
            </View>
          </View>

          {/* Sección: Imágenes del Accesorio */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Imágenes del Accesorio</Text>
            </View>
            <View style={styles.sectionContent}>
              <TouchableOpacity 
                style={[styles.imagePicker, errors.imagenes && styles.imagePickerError]} 
                onPress={handlePickImage}
                disabled={uploadingImage}
              >
                <Ionicons name="camera" size={32} color="#00BCD4" />
                <Text style={styles.imagePickerText}>
                  {uploadingImage ? 'Subiendo imágenes...' : '📷 Subir Imágenes'}
                </Text>
              </TouchableOpacity>
              {errors.imagenes && (
                <Text style={styles.errorText}>{errors.imagenes}</Text>
              )}
              
              {form.imagenes.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                  {form.imagenes.map((img, idx) => (
                    <View key={idx} style={styles.imageWrapper}>
                      <Image source={{ uri: img }} style={styles.imagePreview} />
                      <TouchableOpacity 
                        style={styles.removeImageButton} 
                        onPress={() => handleRemoveImage(idx)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          {/* Sección: Información de Precios */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Información de Precios</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderTextInput(
                'Precio Base ($)', 
                form.precioBase, 
                (v) => setForm(prev => ({ ...prev, precioBase: v })), 
                '25.00',
                true,
                'numeric',
                false,
                'precioBase'
              )}
              
              {/* Toggle promoción */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>¿Accesorio en promoción?</Text>
                <TouchableOpacity 
                  style={[styles.toggle, form.enPromocion && styles.toggleActive]} 
                  onPress={() => setForm(prev => ({ 
                    ...prev, 
                    enPromocion: !prev.enPromocion,
                    promocionId: !prev.enPromocion ? prev.promocionId : '',
                    precioActual: !prev.enPromocion ? prev.precioActual : ''
                  }))}
                >
                  <Text style={[styles.toggleText, form.enPromocion && styles.toggleTextActive]}>
                    {form.enPromocion ? 'SÍ' : 'NO'}
                  </Text>
                </TouchableOpacity>
              </View>

              {form.enPromocion && (
                <>
                  {renderPicker(
                    'Promoción',
                    form.promocionId,
                    (v) => setForm(prev => ({ ...prev, promocionId: v })),
                    promociones,
                    'Selecciona una promoción',
                    true,
                    'promocionId'
                  )}
                  {renderTextInput(
                    'Precio Promocional ($)', 
                    form.precioActual, 
                    (v) => setForm(prev => ({ ...prev, precioActual: v })), 
                    '20.00',
                    true,
                    'numeric',
                    false,
                    'precioActual'
                  )}
                </>
              )}
            </View>
          </View>

          {/* Sección: Disponibilidad por Sucursal */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business" size={20} color="#6B46C1" />
              <Text style={styles.sectionTitle}>Disponibilidad por Sucursal</Text>
            </View>
            <View style={styles.sectionContent}>
              {errors.sucursales && (
                <Text style={styles.errorText}>{errors.sucursales}</Text>
              )}
              {sucursales.map(s => {
                const selected = form.sucursales.find(x => x.sucursalId === s._id);
                return (
                  <View key={s._id} style={styles.sucursalRow}>
                    <TouchableOpacity
                      onPress={() => handleToggleSucursal(s)}
                      style={styles.sucursalCheckbox}
                    >
                      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                        {selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.sucursalName}>{s.nombre}</Text>
                    </TouchableOpacity>
                    {selected && (
                      <TextInput
                        style={styles.stockInput}
                        placeholder="Stock"
                        keyboardType="numeric"
                        value={selected.stock.toString()}
                        onChangeText={v => handleStockChange(s._id, v)}
                      />
                    )}
                  </View>
                );
              })}
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
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Ionicons name="save" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Crear Accesorio</Text>
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
    backgroundColor: '#00BCD4',
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
    color: '#F44336',
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
    borderColor: '#F44336',
    borderWidth: 2,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: '#F44336',
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
  disabledInput: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#1A1A1A',
  },
  toggle: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#00BCD4',
  },
  toggleText: {
    color: '#666666',
    fontFamily: 'Lato-Bold',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  imagePicker: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  imagePickerError: {
    borderColor: '#F44336',
  },
  imagePickerText: {
    color: '#00BCD4',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginTop: 8,
  },
  imageContainer: {
    marginTop: 12,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sucursalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  sucursalCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  sucursalName: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#1A1A1A',
    flex: 1,
  },
  stockInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Lato-Regular',
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
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },
});

export default AddAccesorioModal;