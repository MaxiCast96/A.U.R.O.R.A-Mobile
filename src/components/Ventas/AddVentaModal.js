import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddVentaModal = ({ visible, onClose, onSave }) => {
  const [clienteNombre, setClienteNombre] = useState('');
  const [total, setTotal] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [sucursalId, setSucursalId] = useState('');
  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!clienteNombre.trim()) { Alert.alert('Validación', 'Ingresa el nombre del cliente'); return false; }
    const totalNum = parseFloat(total);
    if (isNaN(totalNum) || totalNum <= 0) { Alert.alert('Validación', 'Total debe ser un número mayor a 0'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        clienteNombre: clienteNombre.trim(),
        total: parseFloat(total),
        metodoPago,
        sucursalId: sucursalId || undefined,
        fecha: fecha || undefined,
      };
      const ok = await onSave(payload);
      if (ok) onClose();
    } finally { setLoading(false); }
  };

  const handleClose = () => {
    if (loading) return;
    setClienteNombre(''); setTotal(''); setMetodoPago('Efectivo'); setSucursalId(''); setFecha('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Agregar Venta</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cliente</Text>
              <TextInput style={styles.textInput} placeholder="Nombre del cliente" value={clienteNombre} onChangeText={setClienteNombre} placeholderTextColor="#999" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total (USD)</Text>
              <TextInput style={styles.textInput} placeholder="0.00" value={total} onChangeText={setTotal} keyboardType="decimal-pad" placeholderTextColor="#999" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Método de pago</Text>
              <TextInput style={styles.textInput} placeholder="Efectivo/Tarjeta/Transferencia" value={metodoPago} onChangeText={setMetodoPago} placeholderTextColor="#999" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sucursal (opcional)</Text>
              <TextInput style={styles.textInput} placeholder="ID de sucursal" value={sucursalId} onChangeText={setSucursalId} placeholderTextColor="#999" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha (opcional)</Text>
              <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} placeholderTextColor="#999" />
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
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
  footer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E5E5' },
  cancelButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#F8F9FA' },
  cancelText: { fontFamily: 'Lato-Bold', color: '#666', fontSize: 16 },
  saveButton: { flex: 2, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, backgroundColor: '#009BBF' },
  saveDisabled: { backgroundColor: '#BDBDBD' },
  saveText: { fontFamily: 'Lato-Bold', color: '#FFF', fontSize: 16 },
});

export default AddVentaModal;
