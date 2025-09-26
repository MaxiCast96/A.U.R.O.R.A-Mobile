import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const EditLenteModal = ({
  visible,
  onClose,
  onSave,
  lente,
  categorias = [],
  marcas = [],
  promociones = [],
  sucursales = [],
  materiales = [],
  colores = [],
  tiposLente = [],
}) => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    marcaId: '',
    material: '',
    color: '',
    tipoLente: '',
    precioBase: '',
    precioActual: '',
    linea: '',
    medidas: { anchoPuente: '', altura: '', ancho: '' },
    imagenes: [],
    enPromocion: false,
    promocionId: '',
    fechaCreacion: '',
    sucursales: [],
  });

  // Cargar datos del lente cuando se abre el modal
  useEffect(() => {
    if (lente && visible) {
      console.log('🔄 Cargando datos para edición:', lente);
      
      // Normalizar imágenes
      const normalizeImages = (images) => {
        if (!images || !Array.isArray(images)) return [];
        return images.map(img => {
          if (typeof img === 'string') {
            return img.startsWith('http') ? img : `https://res.cloudinary.com/tu-cloud-name/image/upload/${img}`;
          }
          if (typeof img === 'object' && img !== null) {
            return img.secure_url || img.url || (img.public_id ? `https://res.cloudinary.com/tu-cloud-name/image/upload/${img.public_id}` : '');
          }
          return '';
        }).filter(url => url && url.length > 0);
      };

      // Normalizar sucursales
      const normalizeSucursales = (sucursales) => {
        if (!sucursales || !Array.isArray(sucursales)) return [];
        return sucursales.map(s => ({
          sucursalId: s.sucursalId?._id || s.sucursalId || s._id || '',
          nombreSucursal: s.nombreSucursal || s.sucursalId?.nombre || s.nombre || '',
          stock: parseInt(s.stock) || 0
        }));
      };

      const editData = {
        nombre: lente.nombre || '',
        descripcion: lente.descripcion || '',
        categoriaId: lente.categoriaId?._id || lente.categoriaId || '',
        marcaId: lente.marcaId?._id || lente.marcaId || '',
        material: lente.material || '',
        color: lente.color || '',
        tipoLente: lente.tipoLente || '',
        precioBase: lente.precioBase?.toString() || '',
        precioActual: (lente.precioActual || lente.precioBase)?.toString() || '',
        linea: lente.linea || '',
        medidas: {
          anchoPuente: lente.medidas?.anchoPuente?.toString() || '',
          altura: lente.medidas?.altura?.toString() || '',
          ancho: lente.medidas?.ancho?.toString() || '',
        },
        imagenes: normalizeImages(lente.imagenes),
        enPromocion: Boolean(lente.enPromocion),
        promocionId: lente.promocionId?._id || lente.promocionId || '',
        fechaCreacion: lente.fechaCreacion ? new Date(lente.fechaCreacion).toISOString().split('T')[0] : '',
        sucursales: normalizeSucursales(lente.sucursales)
      };

      console.log('📝 Datos normalizados para edición:', editData);
      setForm(editData);
    }
  }, [lente, visible]);

  // Obtiene las líneas de producto de la marca seleccionada
  const lineasMarca = useMemo(() => {
    if (!form.marcaId) return [];
    const marca = marcas.find(m => m._id === form.marcaId);
    return Array.isArray(marca?.lineas) ? marca.lineas : [];
  }, [form.marcaId, marcas]);

  // VALIDACIÓN COMPLETA
  const validate = () => {
    const errors = [];
    
    if (!form.nombre.trim()) errors.push('El nombre es requerido');
    if (!form.descripcion.trim()) errors.push('La descripción es requerida');
    if (!form.categoriaId) errors.push('La categoría es requerida');
    if (!form.marcaId) errors.push('La marca es requerida');
    if (!form.material) errors.push('El material es requerido');
    if (!form.color) errors.push('El color es requerido');
    if (!form.tipoLente) errors.push('El tipo de lente es requerido');
    if (!form.linea) errors.push('La línea es requerida');
    
    // Validación de precios
    const precioBase = Number(form.precioBase);
    if (!form.precioBase || isNaN(precioBase) || precioBase <= 0) {
      errors.push('El precio base debe ser mayor a 0');
    }
    
    if (form.enPromocion) {
      if (!form.promocionId) errors.push('Debe seleccionar una promoción');
      
      const precioActual = Number(form.precioActual);
      if (!form.precioActual || isNaN(precioActual) || precioActual <= 0) {
        errors.push('El precio promocional debe ser mayor a 0');
      } else if (precioActual >= precioBase) {
        errors.push('El precio promocional debe ser menor al precio base');
      }
    }
    
    // Validación de medidas
    const { anchoPuente, altura, ancho } = form.medidas;
    if (!anchoPuente || Number(anchoPuente) <= 0) errors.push('Ancho de puente inválido');
    if (!altura || Number(altura) <= 0) errors.push('Altura inválida');
    if (!ancho || Number(ancho) <= 0) errors.push('Ancho inválido');
    
    // Validación de imágenes y sucursales
    if (!form.imagenes || form.imagenes.length === 0) {
      errors.push('Se requiere al menos una imagen');
    }
    
    if (!form.sucursales || form.sucursales.length === 0) {
      errors.push('Debe seleccionar al menos una sucursal');
    }
    
    const hasNegativeStock = form.sucursales.some(s => Number(s.stock) < 0);
    if (hasNegativeStock) {
      errors.push('El stock no puede ser negativo');
    }

    return errors.length > 0 ? errors.join('\n') : null;
  };

  // Selector de imágenes
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });
      
      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setForm(prev => ({ 
          ...prev, 
          imagenes: [...prev.imagenes, ...newImages] 
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
      alert('Error al seleccionar imágenes');
    }
  };

  // Eliminar imagen
  const handleRemoveImage = (index) => {
    setForm(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  // Manejo de sucursales
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

  // GUARDAR CAMBIOS - Solo envía lo que se modificó
  const handleSave = () => {
    if (!lente) {
      alert('Error: No hay lente seleccionado para editar');
      return;
    }

    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    console.log('💾 Guardando cambios del lente:', lente._id);
    console.log('📋 Datos del formulario ANTES de transformar:', form);

    // TRANSFORMAR LOS DATOS IGUAL QUE EN CREAR
    const medidas = form.medidas || {};
    const dataToSend = {
      nombre: form.nombre?.trim(),
      descripcion: form.descripcion?.trim(),
      categoriaId: form.categoriaId,
      marcaId: form.marcaId,
      material: form.material?.trim(),
      color: form.color?.trim(),
      tipoLente: form.tipoLente?.trim(),
      precioBase: Number(form.precioBase),
      precioActual: form.enPromocion ? Number(form.precioActual) : Number(form.precioBase),
      linea: form.linea?.trim(),
      medidas: {
        anchoPuente: Number(medidas.anchoPuente),
        altura: Number(medidas.altura),
        ancho: Number(medidas.ancho),
      },
      imagenes: Array.isArray(form.imagenes) ? form.imagenes : [],
      enPromocion: !!form.enPromocion,
      promocionId: form.enPromocion ? form.promocionId : undefined,
      fechaCreacion: form.fechaCreacion,
      sucursales: Array.isArray(form.sucursales) ? form.sucursales
        .map(s => ({
          sucursalId: s.sucursalId,
          nombreSucursal: s.nombreSucursal,
          stock: Number(s.stock ?? 0),
        }))
        .filter(s => s.sucursalId) // Solo sucursales válidas
        : [],
    };

    console.log('🚀 Datos TRANSFORMADOS para actualizar:', JSON.stringify(dataToSend, null, 2));

    // Verificar que los datos críticos están presentes
    if (!dataToSend.categoriaId || !dataToSend.marcaId) {
      alert('Error: Faltan datos críticos (categoría o marca)');
      return;
    }

    onSave(dataToSend);
  };

  const handleClose = () => {
    onClose();
  };

  if (!lente) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Editar Lente</Text>
            
            {/* Información Básica */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Básica</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del lente"
                value={form.nombre}
                onChangeText={v => setForm(prev => ({ ...prev, nombre: v }))}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción del producto"
                value={form.descripcion}
                onChangeText={v => setForm(prev => ({ ...prev, descripcion: v }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Categorización */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categorización</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.categoriaId}
                  onValueChange={v => setForm(prev => ({ ...prev, categoriaId: v }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona una categoría" value="" />
                  {categorias.map(cat => (
                    <Picker.Item key={cat._id} label={cat.nombre} value={cat._id} />
                  ))}
                </Picker>
              </View>
              
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.marcaId}
                  onValueChange={v => setForm(prev => ({ ...prev, marcaId: v, linea: '' }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona una marca" value="" />
                  {marcas.map(m => (
                    <Picker.Item key={m._id} label={m.nombre} value={m._id} />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Picker
                  enabled={!!form.marcaId && lineasMarca.length > 0}
                  selectedValue={form.linea}
                  onValueChange={v => setForm(prev => ({ ...prev, linea: v }))}
                  style={[styles.picker, (!form.marcaId || lineasMarca.length === 0) && styles.pickerDisabled]}
                >
                  <Picker.Item 
                    label={
                      !form.marcaId 
                        ? "Primero selecciona una marca" 
                        : lineasMarca.length === 0 
                          ? "No hay líneas disponibles" 
                          : "Selecciona una línea"
                    } 
                    value="" 
                  />
                  {lineasMarca.map(linea => (
                    <Picker.Item key={linea} label={linea} value={linea} />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.tipoLente}
                  onValueChange={v => setForm(prev => ({ ...prev, tipoLente: v }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona el tipo de lente" value="" />
                  {tiposLente.map(tipo => (
                    <Picker.Item 
                      key={tipo}
                      label={tipo} 
                      value={tipo.toLowerCase()} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Características Físicas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Características Físicas</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.material}
                  onValueChange={v => setForm(prev => ({ ...prev, material: v }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione el material" value="" />
                  {materiales.map(material => (
                    <Picker.Item 
                      key={material}
                      label={material}
                      value={material}
                    />
                  ))}
                </Picker>
              </View>
              
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.color}
                  onValueChange={v => setForm(prev => ({ ...prev, color: v }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione el color" value="" />
                  {colores.map(color => (
                    <Picker.Item 
                      key={color}
                      label={color}
                      value={color}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Medidas del Lente */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medidas del Lente (mm)</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.inputSmall]}
                  placeholder="Puente"
                  value={form.medidas.anchoPuente}
                  keyboardType="numeric"
                  onChangeText={v => setForm(prev => ({ 
                    ...prev, 
                    medidas: { ...prev.medidas, anchoPuente: v } 
                  }))}
                />
                <TextInput
                  style={[styles.input, styles.inputSmall]}
                  placeholder="Altura"
                  value={form.medidas.altura}
                  keyboardType="numeric"
                  onChangeText={v => setForm(prev => ({ 
                    ...prev, 
                    medidas: { ...prev.medidas, altura: v } 
                  }))}
                />
                <TextInput
                  style={[styles.input, styles.inputSmall]}
                  placeholder="Ancho"
                  value={form.medidas.ancho}
                  keyboardType="numeric"
                  onChangeText={v => setForm(prev => ({ 
                    ...prev, 
                    medidas: { ...prev.medidas, ancho: v } 
                  }))}
                />
              </View>
            </View>

            {/* Imágenes del Lente */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Imágenes del Lente</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                <Text style={styles.imagePickerText}>📷 Agregar más imágenes</Text>
              </TouchableOpacity>
              {form.imagenes.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                  {form.imagenes.map((img, idx) => (
                    <View key={idx} style={styles.imageWrapper}>
                      <Image source={{ uri: img }} style={styles.imagePreview} />
                      <TouchableOpacity 
                        style={styles.removeImageButton} 
                        onPress={() => handleRemoveImage(idx)}
                      >
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Información de Precios */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de Precios</Text>
              <TextInput
                style={styles.input}
                placeholder="Precio Base ($)"
                value={form.precioBase}
                keyboardType="numeric"
                onChangeText={v => setForm(prev => ({ ...prev, precioBase: v }))}
              />
              
              <View style={styles.row}>
                <Text style={styles.toggleLabel}>¿Lente en promoción?</Text>
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
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={form.promocionId}
                      onValueChange={v => setForm(prev => ({ ...prev, promocionId: v }))}
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecciona una promoción" value="" />
                      {promociones.map(p => (
                        <Picker.Item key={p._id} label={p.nombre} value={p._id} />
                      ))}
                    </Picker>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Precio Promocional ($)"
                    value={form.precioActual}
                    keyboardType="numeric"
                    onChangeText={v => setForm(prev => ({ ...prev, precioActual: v }))}
                  />
                </>
              )}
            </View>

            {/* Disponibilidad por Sucursal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Disponibilidad por Sucursal</Text>
              {sucursales.map(s => {
                const selected = form.sucursales.find(x => x.sucursalId === s._id);
                return (
                  <View key={s._id} style={styles.sucursalRow}>
                    <TouchableOpacity
                      onPress={() => handleToggleSucursal(s)}
                      style={styles.sucursalCheckbox}
                    >
                      <Text style={styles.checkboxText}>
                        {selected ? '☑️' : '⬜'}
                      </Text>
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
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Guardar Cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modal: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 16, 
    width: '95%', 
    maxHeight: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a'
  },
  section: { 
    marginBottom: 20, 
    backgroundColor: '#f8f9fa', 
    borderRadius: 12, 
    padding: 16 
  },
  sectionTitle: { 
    fontWeight: 'bold', 
    marginBottom: 12, 
    fontSize: 16, 
    color: '#00bcd4' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e1e5e9', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12, 
    backgroundColor: '#fff',
    fontSize: 16
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  inputSmall: {
    flex: 1,
    marginRight: 8
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12
  },
  picker: {
    height: 50
  },
  pickerDisabled: {
    opacity: 0.5
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  toggleLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  toggle: {
    backgroundColor: '#e1e5e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center'
  },
  toggleActive: {
    backgroundColor: '#00bcd4'
  },
  toggleText: {
    color: '#666',
    fontWeight: '600'
  },
  toggleTextActive: {
    color: '#fff'
  },
  imagePicker: { 
    backgroundColor: '#e0f7fa', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 12, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00bcd4',
    borderStyle: 'dashed'
  },
  imagePickerText: { 
    color: '#00bcd4', 
    fontWeight: 'bold',
    fontSize: 16 
  },
  imageContainer: {
    marginBottom: 8
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8
  },
  imagePreview: { 
    width: 80, 
    height: 80, 
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e1e5e9'
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  removeImageText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  sucursalRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8
  },
  sucursalCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkboxText: {
    marginRight: 8,
    fontSize: 18
  },
  sucursalName: { 
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  stockInput: { 
    width: 80, 
    borderWidth: 1, 
    borderColor: '#e1e5e9', 
    borderRadius: 6, 
    padding: 8, 
    backgroundColor: '#fff',
    textAlign: 'center'
  },
  actions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9'
  },
  saveButton: { 
    backgroundColor: '#00bcd4', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center'
  },
  saveText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16
  },
  closeButton: { 
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  closeText: { 
    color: '#666', 
    fontWeight: 'bold',
    fontSize: 16
  },
});

export default EditLenteModal;