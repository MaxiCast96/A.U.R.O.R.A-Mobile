import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditSucursalModal = ({ visible, onClose, sucursal, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);

  // Formateo de teléfono a +503########
  const formatPhone503 = (value) => {
    const digits = (value || '').replace(/\D/g, '');
    const local = digits.startsWith('503') ? digits.slice(3) : digits;
    const local8 = local.slice(0, 8);
    return local8.length ? `+503${local8}` : '';
  };
  const handleTelefonoChange = (value) => setTelefono(formatPhone503(value));

  useEffect(() => {
    if (sucursal) {
      setNombre(sucursal.nombre || '');
      setTelefono(formatPhone503(sucursal.telefono || ''));
      setCorreo(sucursal.correo || '');
      // Prefill with calle text if object
      const d = sucursal.direccion;
      if (typeof d === 'string') setDireccion(d || '');
      else if (typeof d === 'object') {
        setDireccion(d.calle || '');
        setCiudad(d.ciudad || d.municipio || '');
        setDepartamento(d.departamento || '');
      }
      else setDireccion('');
      setActivo(!!sucursal.activo);
    }
  }, [sucursal, visible]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const validate = () => {
    if (!nombre.trim()) {
      Alert.alert('Validación', 'El nombre es requerido');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!sucursal?._id) return;

    setLoading(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        direccion: {
          calle: direccion.trim(),
          ciudad: ciudad.trim(),
          departamento: departamento.trim(),
        },
        activo,
      };
      const ok = await onSave(sucursal._id, payload);
      if (ok) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Editar Sucursal</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.section}>
            {/* Información básica */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Sucursal Centro"
                value={nombre}
                onChangeText={setNombre}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: 2222-3333"
                value={telefono}
                onChangeText={handleTelefonoChange}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: escalon@optica.com"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            {/* Dirección */}
            <Text style={[styles.inputLabel, { marginTop: 8 }]}>Dirección (calle)</Text>
            <TextInput
              style={[styles.textInput, styles.multiline]}
              placeholder="Dirección completa"
              value={direccion}
              onChangeText={setDireccion}
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ciudad</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: San Salvador"
                    value={ciudad}
                    onChangeText={setCiudad}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Departamento</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: San Salvador"
                    value={departamento}
                    onChangeText={setDepartamento}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            {/* Horarios eliminados según solicitud */}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estado</Text>
              <View style={styles.estadoRow}>
                <TouchableOpacity style={[styles.estadoChip, activo && styles.estadoChipActive]} onPress={() => setActivo(true)}>
                  <Text style={[styles.estadoText, activo && styles.estadoTextActive]}>Activa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.estadoChip, !activo && styles.estadoChipInactive]} onPress={() => setActivo(false)}>
                  <Text style={[styles.estadoText, !activo && styles.estadoTextInactive]}>Inactiva</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveButton, loading && styles.saveDisabled]} onPress={handleSave} disabled={loading}>
            <Ionicons name="save" size={20} color="#FFF" />
            <Text style={styles.saveText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#009BBF', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#FFF', fontFamily: 'Lato-Bold', fontSize: 18 },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  section: { margin: 20, backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E5E5' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontFamily: 'Lato-Bold', fontSize: 14, color: '#1A1A1A', marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFF', fontFamily: 'Lato-Regular', fontSize: 14, color: '#1A1A1A' },
  multiline: { height: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  estadoRow: { flexDirection: 'row', gap: 12 },
  estadoChip: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#F8F9FA' },
  estadoChipActive: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  estadoChipInactive: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  estadoText: { fontFamily: 'Lato-Bold', color: '#374151' },
  estadoTextActive: { color: '#065F46' },
  estadoTextInactive: { color: '#991B1B' },
  footer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E5E5' },
  cancelButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#F8F9FA' },
  cancelText: { fontFamily: 'Lato-Bold', color: '#666', fontSize: 16 },
  saveButton: { flex: 2, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, backgroundColor: '#009BBF' },
  saveDisabled: { backgroundColor: '#BDBDBD' },
  saveText: { fontFamily: 'Lato-Bold', color: '#FFF', fontSize: 16 },
});

export default EditSucursalModal;
