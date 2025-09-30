import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Row = ({ icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.rowLabel}>
      <Ionicons name={icon} size={18} color="#666" style={{ marginRight: 8 }} />
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <Text style={styles.valueText}>{value || '—'}</Text>
  </View>
);

const SucursalDetailModal = ({ visible, onClose, sucursal }) => {
  const direccionText = (() => {
    const d = sucursal?.direccion;
    if (!d) return '—';
    if (typeof d === 'string') return d;
    const calle = d.calle || d.direccionDetallada || '';
    const ciudad = d.ciudad || d.municipio || '';
    const departamento = d.departamento || '';
    return [calle, ciudad, departamento].filter(Boolean).join(', ') || '—';
  })();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Detalle de Sucursal</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{sucursal?.nombre || '—'}</Text>

          <View style={styles.card}>
            <Row icon="call-outline" label="Teléfono" value={sucursal?.telefono} />
            <Row icon="mail-outline" label="Correo" value={sucursal?.correo} />
            <Row icon="location-outline" label="Dirección" value={direccionText} />
            <Row icon={sucursal?.activo ? 'checkmark-circle-outline' : 'close-circle-outline'} label="Estado" value={sucursal?.activo ? 'Activa' : 'Inactiva'} />
          </View>

          {/* Horarios de atención eliminados según solicitud */}
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
  content: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowLabel: { flexDirection: 'row', alignItems: 'center' },
  labelText: { fontFamily: 'Lato-Bold', color: '#1A1A1A' },
  valueText: { fontFamily: 'Lato-Regular', color: '#333', maxWidth: '60%', textAlign: 'right' },
});

export default SucursalDetailModal;
