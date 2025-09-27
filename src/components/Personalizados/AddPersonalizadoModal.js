import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddPersonalizadoModal = ({
  visible,
  onClose,
  onSave,
  categorias = [],
  marcas = [],
  clientes = [],
  lentes = [],
  materiales = [],
  colores = [],
  tiposLente = [],
}) => {
  const [form, setForm] = useState({
    clienteId: '',
    productoBaseId: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    marcaId: '',
    material: '',              // Campo de texto libre
    color: '',                 // Campo de texto libre
    tipoLente: '',            // Campo de texto libre
    precioCalculado: '',
    fechaEntregaEstimada: '',
    cotizacion: {
      total: '',
      validaHasta: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(null);

  // Función helper para procesar datos de manera segura
  const processDataArray = (data, label) => {
    console.log(`=== ${label} DEBUG ===`);
    console.log('Datos recibidos:', data);
    console.log('Tipo:', typeof data);
    console.log('Es array:', Array.isArray(data));
    
    if (!data) {
      console.log(`${label}: datos nulos o undefined`);
      return [];
    }

    if (Array.isArray(data)) {
      console.log(`${label}: es array con ${data.length} elementos`);
      if (data.length > 0) {
        console.log(`Primer elemento:`, data[0]);
        console.log(`Estructura:`, Object.keys(data[0]));
      }
      return data;
    }

    if (typeof data === 'object' && Array.isArray(data.data)) {
      console.log(`${label}: objeto con propiedad data`);
      return data.data;
    }

    const arrayProps = ['items', 'results', 'list', 'records', 'lentes'];
    for (const prop of arrayProps) {
      if (Array.isArray(data[prop])) {
        console.log(`${label}: encontrado en propiedad ${prop}`);
        return data[prop];
      }
    }

    console.warn(`${label}: estructura desconocida`, data);
    return [];
  };

  // Procesar opciones
  const clienteOptions = useMemo(() => {
    const processed = processDataArray(clientes, 'CLIENTES');
    return processed.map(c => ({
      value: c._id || c.id,
      label: c.nombre || c.fullName || c.razonSocial || c.email || `Cliente ${(c._id || c.id || '').slice(-8)}` || 'Cliente sin nombre'
    }));
  }, [clientes]);

  const lenteOptions = useMemo(() => {
    const processed = processDataArray(lentes, 'LENTES/PRODUCTOS BASE');
    
    if (processed.length === 0) {
      console.error('🚨 CRÍTICO: No hay lentes disponibles');
      console.error('🚨 Datos originales de lentes:', lentes);
      return [
        { value: 'debug-1', label: '🚨 DEBUG: No hay lentes - Contacta soporte' }
      ];
    }
    
    console.log(`✅ ÉXITO: ${processed.length} lentes procesados`);
    const options = processed.map(l => ({
      value: l._id || l.id,
      label: l.nombre || l.modelo || l.descripcion || `Lente ${(l._id || l.id || '').slice(-8)}` || 'Lente sin nombre'
    }));
    
    console.log('Opciones finales de lentes:', options);
    return options;
  }, [lentes]);

  const categoriaOptions = useMemo(() => {
    const processed = processDataArray(categorias, 'CATEGORÍAS');
    return processed.map(cat => ({
      value: cat.nombre || cat._id || cat.id,
      label: cat.nombre || cat.descripcion || `Categoría ${(cat._id || cat.id || '').slice(-8)}` || 'Categoría sin nombre'
    }));
  }, [categorias]);

  const marcaOptions = useMemo(() => {
    const processed = processDataArray(marcas, 'MARCAS');
    return processed.map(m => ({
      value: m._id || m.id,
      label: m.nombre || m.descripcion || `Marca ${(m._id || m.id || '').slice(-8)}` || 'Marca sin nombre'
    }));
  }, [marcas]);

  // Debug cuando se abra el modal
  useEffect(() => {
    if (visible) {
      console.log('🔍 === MODAL ABIERTO - DEBUG COMPLETO ===');
      console.log('Props recibidas directamente:');
      console.log('- lentes (raw):', lentes);
      console.log('- clientes (raw):', clientes);
      console.log('- marcas (raw):', marcas);
      console.log('- categorias (raw):', categorias);
      
      console.log('Opciones procesadas:');
      console.log('- lenteOptions:', lenteOptions);
      console.log('- clienteOptions:', clienteOptions);
      console.log('- marcaOptions:', marcaOptions);
      console.log('- categoriaOptions:', categoriaOptions);
      
      if (lenteOptions.length === 0) {
        console.error('🚨 PROBLEMA CRÍTICO: Sin lentes disponibles');
        Alert.alert(
          'Problema de datos',
          'No se encontraron lentes disponibles. Verifica la conexión o contacta soporte.',
          [{ text: 'OK' }]
        );
      }
      console.log('=== FIN DEBUG ===');
    }
  }, [visible, lentes, clientes, marcas, categorias, lenteOptions, clienteOptions, marcaOptions, categoriaOptions]);

  const validate = () => {
    const newErrors = {};
    
    if (!form.clienteId) newErrors.clienteId = 'El cliente es requerido';
    if (!form.productoBaseId) newErrors.productoBaseId = 'El producto base es requerido';
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!form.categoria) newErrors.categoria = 'La categoría es requerida';
    if (!form.marcaId) newErrors.marcaId = 'La marca es requerida';
    if (!form.material.trim()) newErrors.material = 'El material es requerido';
    if (!form.color.trim()) newErrors.color = 'El color es requerido';
    if (!form.tipoLente.trim()) newErrors.tipoLente = 'El tipo de lente es requerido';
    
    const precio = Number(form.precioCalculado);
    if (!form.precioCalculado || isNaN(precio) || precio <= 0) {
      newErrors.precioCalculado = 'El precio calculado debe ser mayor a 0';
    }
    
    const cotizacion = Number(form.cotizacion.total);
    if (!form.cotizacion.total || isNaN(cotizacion) || cotizacion <= 0) {
      newErrors.cotizacionTotal = 'El total de la cotización debe ser mayor a 0';
    }
    
    if (!form.fechaEntregaEstimada) {
      newErrors.fechaEntregaEstimada = 'La fecha de entrega estimada es requerida';
    }
    
    if (!form.cotizacion.validaHasta) {
      newErrors.cotizacionValidaHasta = 'La fecha de validez de la cotización es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      clienteId: '',
      productoBaseId: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      marcaId: '',
      material: '',
      color: '',
      tipoLente: '',
      precioCalculado: '',
      fechaEntregaEstimada: '',
      cotizacion: {
        total: '',
        validaHasta: ''
      }
    });
    setErrors({});
    setShowDatePicker(null);
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const dataToSend = {
      clienteId: form.clienteId,
      productoBaseId: form.productoBaseId,
      nombre: form.nombre?.trim(),
      descripcion: form.descripcion?.trim(),
      categoria: form.categoria,
      marcaId: form.marcaId,
      material: form.material?.trim(),
      color: form.color?.trim(),
      tipoLente: form.tipoLente?.trim(),
      precioCalculado: Number(form.precioCalculado),
      fechaEntregaEstimada: form.fechaEntregaEstimada,
      cotizacion: {
        total: Number(form.cotizacion.total),
        validaHasta: form.cotizacion.validaHasta
      }
    };

    console.log('Enviando datos:', dataToSend);
    onSave(dataToSend);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDateChange = (event, selectedDate, type) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(null);
    }
    
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      if (type === 'entrega') {
        setForm(prev => ({ ...prev, fechaEntregaEstimada: dateString }));
      } else if (type === 'cotizacion') {
        setForm(prev => ({ 
          ...prev, 
          cotizacion: { ...prev.cotizacion, validaHasta: dateString } 
        }));
      }
    }
    
    if (Platform.OS === 'ios') {
      setShowDatePicker(null);
    }
  };

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

  const renderDateInput = (label, value, onPress, placeholder, required = false, field = null) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[
          styles.dateInput,
          errors[field] && styles.inputError
        ]}
        onPress={onPress}
      >
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="calendar" size={20} color="#00BCD4" />
      </TouchableOpacity>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderPicker = (label, selectedValue, onValueChange, options, placeholder, required = false, field = null) => {
    const hasOptions = options.length > 0;
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={[
          styles.pickerContainer, 
          errors[field] && styles.inputError,
          !hasOptions && styles.disabledInput
        ]}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            enabled={hasOptions}
          >
            <Picker.Item 
              label={hasOptions ? placeholder : `No hay ${label.toLowerCase()} disponibles`} 
              value="" 
            />
            {options.map((option, index) => (
              <Picker.Item 
                key={option.value || index} 
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
        </View>
        {errors[field] && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
        {!hasOptions && (
          <Text style={[styles.errorText, {color: '#FF9800'}]}>
            Sin {label.toLowerCase()} disponibles
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Agregar Producto Personalizado</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Información Básica */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#00BCD4" />
              <Text style={styles.sectionTitle}>Información Básica</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderPicker(
                'Cliente',
                form.clienteId,
                (v) => setForm(prev => ({ ...prev, clienteId: v })),
                clienteOptions,
                'Selecciona un cliente',
                true,
                'clienteId'
              )}
              
              {renderPicker(
                'Producto Base (Lente)',
                form.productoBaseId,
                (v) => setForm(prev => ({ ...prev, productoBaseId: v })),
                lenteOptions,
                'Selecciona un lente base',
                true,
                'productoBaseId'
              )}

              {renderTextInput(
                'Nombre del producto personalizado', 
                form.nombre, 
                (v) => setForm(prev => ({ ...prev, nombre: v })), 
                'Ej: Lente Progresivo Personalizado Juan',
                true,
                'default',
                false,
                'nombre'
              )}
              
              {renderTextInput(
                'Descripción de la personalización', 
                form.descripcion, 
                (v) => setForm(prev => ({ ...prev, descripcion: v })), 
                'Describe las características específicas...',
                true,
                'default',
                true,
                'descripcion'
              )}
            </View>
          </View>

          {/* Categorización */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetags" size={20} color="#9C27B0" />
              <Text style={styles.sectionTitle}>Categorización</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderPicker(
                'Categoría',
                form.categoria,
                (v) => setForm(prev => ({ ...prev, categoria: v })),
                categoriaOptions,
                'Selecciona una categoría',
                true,
                'categoria'
              )}
              
              {renderPicker(
                'Marca',
                form.marcaId,
                (v) => setForm(prev => ({ ...prev, marcaId: v })),
                marcaOptions,
                'Selecciona una marca',
                true,
                'marcaId'
              )}
            </View>
          </View>

          {/* Características Personalizadas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="layers" size={20} color="#FF9800" />
              <Text style={styles.sectionTitle}>Características Personalizadas</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderTextInput(
                'Material', 
                form.material, 
                (v) => setForm(prev => ({ ...prev, material: v })), 
                'Ej: Policarbonato especial, CR-39, Cristal...',
                true,
                'default',
                false,
                'material'
              )}
              
              {renderTextInput(
                'Color', 
                form.color, 
                (v) => setForm(prev => ({ ...prev, color: v })), 
                'Ej: Azul degradado, Transparente, Fotocromático...',
                true,
                'default',
                false,
                'color'
              )}

              {renderTextInput(
                'Tipo de Lente', 
                form.tipoLente, 
                (v) => setForm(prev => ({ ...prev, tipoLente: v })), 
                'Ej: Progresivo personalizado, Monofocal, Bifocal...',
                true,
                'default',
                false,
                'tipoLente'
              )}
            </View>
          </View>

          {/* Precios */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Información de Precios</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderTextInput(
                'Precio Calculado ($)', 
                form.precioCalculado, 
                (v) => setForm(prev => ({ ...prev, precioCalculado: v })), 
                '150.00',
                true,
                'numeric',
                false,
                'precioCalculado'
              )}
              
              {renderTextInput(
                'Total de Cotización ($)', 
                form.cotizacion.total, 
                (v) => setForm(prev => ({ 
                  ...prev, 
                  cotizacion: { ...prev.cotizacion, total: v } 
                })), 
                '150.00',
                true,
                'numeric',
                false,
                'cotizacionTotal'
              )}
            </View>
          </View>

          {/* Fechas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#6B46C1" />
              <Text style={styles.sectionTitle}>Fechas</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderDateInput(
                'Fecha de Entrega Estimada',
                form.fechaEntregaEstimada,
                () => setShowDatePicker('entrega'),
                'Seleccionar fecha de entrega',
                true,
                'fechaEntregaEstimada'
              )}
              
              {renderDateInput(
                'Cotización Válida Hasta',
                form.cotizacion.validaHasta,
                () => setShowDatePicker('cotizacion'),
                'Seleccionar fecha de validez',
                true,
                'cotizacionValidaHasta'
              )}
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

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
            <Text style={styles.saveButtonText}>Crear Personalizado</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, showDatePicker)}
            minimumDate={new Date()}
          />
        )}
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
  dateInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  placeholderText: {
    color: '#999999',
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

export default AddPersonalizadoModal;