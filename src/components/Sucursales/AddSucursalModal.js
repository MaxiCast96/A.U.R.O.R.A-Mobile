import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddSucursalModal = ({ visible, onClose, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);
  // Se eliminan horarios de atención según solicitud

  // Formatear a +503 y limitar a 8 dígitos locales
  const formatPhone503 = (value) => {
    const digits = (value || '').replace(/\D/g, '');
    // quitar prefijo si lo incluyeron como 503 al inicio
    const local = digits.startsWith('503') ? digits.slice(3) : digits;
    const local8 = local.slice(0, 8);
    return local8.length ? `+503${local8}` : '';
  };

  const handleTelefonoChange = (value) => {
    setTelefono(formatPhone503(value));
  };

  const clear = () => {
    setNombre('');
    setTelefono('');
    setCorreo('');
    setDireccion('');
    setActivo(true);
    setCiudad('');
    setDepartamento('');
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      clear();
      onClose();
    }
  };

  const validate = () => {
    if (!nombre.trim()) {
      Alert.alert('Validación', 'El nombre es requerido');
      return false;
    }
    // validar teléfono: debe ser +503 y 8 dígitos locales
    const phoneDigits = telefono.replace(/\D/g, '');
    if (telefono && !(phoneDigits.startsWith('503') && phoneDigits.length === 11)) {
      Alert.alert('Validación', 'El teléfono debe tener formato +503 y 8 dígitos.');
      return false;
    }
    // validar correo si se ingresó
    if (correo.trim()) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
      if (!emailOk) {
        Alert.alert('Validación', 'Ingresa un correo válido');
        return false;
      }
    }
    return true;
  };

  // Handlers de horarios eliminados

  const handleSave = async () => {
    if (!validate()) return;
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
      const ok = await onSave(payload);
      if (ok) {
        clear();
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
          <Text style={styles.headerTitle}>Agregar Sucursal</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.section}>
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
              placeholder="Ej: +503 22223333"
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
              placeholder="Ej: sucursal@optica.com"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dirección (calle)</Text>
            <TextInput
              style={[styles.textInput, styles.multiline]}
              placeholder="Dirección completa"
              value={direccion}
              onChangeText={setDireccion}
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
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

          {/* Se eliminaron los horarios según solicitud */}

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
            <Text style={styles.saveText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
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

export default AddSucursalModal;
