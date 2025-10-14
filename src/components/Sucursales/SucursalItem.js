import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SucursalItem = ({ sucursal, onViewMore, onEdit, onDelete, onToggleEstado, onViewMap }) => {
  const estadoActivo = !!sucursal.activo;

  // Convertir direccion a texto legible si viene como objeto
  const direccionText = (() => {
    const d = sucursal.direccion;
    if (!d) return 'Sin dirección';
    if (typeof d === 'string') return d;
    if (typeof d === 'object') {
      const calle = d.calle || d.direccionDetallada || '';
      const ciudad = d.ciudad || d.municipio || '';
      const depto = d.departamento || '';
      return [calle, ciudad, depto].filter(Boolean).join(', ') || 'Sin dirección';
    }
    return 'Sin dirección';
  })();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{sucursal.nombre}</Text>
        <View style={[styles.badge, { backgroundColor: estadoActivo ? '#D1FAE5' : '#FEE2E2' }]}>
          <Text style={[styles.badgeText, { color: estadoActivo ? '#065F46' : '#991B1B' }]}>
            {estadoActivo ? 'Activa' : 'Inactiva'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={16} color="#666" />
        <Text style={styles.infoText}>{sucursal.telefono || 'Sin teléfono'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.infoText} numberOfLines={2}>{direccionText}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onViewMore}>
          <Ionicons name="eye-outline" size={18} color="#009BBF" />
          <Text style={styles.actionText}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onViewMap}>
          <Ionicons name="map-outline" size={18} color="#10B981" />
          <Text style={[styles.actionText, { color: '#10B981' }]}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onToggleEstado(sucursal)}>
          <Ionicons name={estadoActivo ? 'close-circle-outline' : 'checkmark-circle-outline'} size={18} color={estadoActivo ? '#991B1B' : '#065F46'} />
          <Text style={[styles.actionText, { color: estadoActivo ? '#991B1B' : '#065F46' }]}>
            {estadoActivo ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsRowSecondary}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(sucursal)}>
          <Ionicons name="create-outline" size={18} color="#6B46C1" />
          <Text style={[styles.actionText, { color: '#6B46C1' }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(sucursal)}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
          <Text style={[styles.actionText, { color: '#DC2626' }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Lato-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#333',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionsRowSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'Lato-Bold',
    color: '#009BBF',
  },
});

export default SucursalItem;