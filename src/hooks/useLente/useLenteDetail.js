import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';

const LenteDetailModal = ({ visible, onClose, lente }) => {
  if (!lente) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            {lente.imagenes && lente.imagenes.length > 0 && (
              <Image source={{ uri: lente.imagenes[0] }} style={styles.image} />
            )}
            <Text style={styles.title}>{lente.nombre}</Text>
            <Text style={styles.label}>Descripción: <Text style={styles.value}>{lente.descripcion}</Text></Text>
            <Text style={styles.label}>Marca: <Text style={styles.value}>{lente.marcaId?.nombre || lente.marcaId}</Text></Text>
            <Text style={styles.label}>Categoría: <Text style={styles.value}>{lente.categoriaId?.nombre || lente.categoriaId}</Text></Text>
            <Text style={styles.label}>Material: <Text style={styles.value}>{lente.material}</Text></Text>
            <Text style={styles.label}>Color: <Text style={styles.value}>{lente.color}</Text></Text>
            <Text style={styles.label}>Tipo de Lente: <Text style={styles.value}>{lente.tipoLente}</Text></Text>
            <Text style={styles.label}>Línea: <Text style={styles.value}>{lente.linea}</Text></Text>
            <Text style={styles.label}>Precio Base: <Text style={styles.value}>${lente.precioBase?.toFixed(2)}</Text></Text>
            <Text style={styles.label}>Precio Actual: <Text style={styles.value}>${(lente.precioActual || lente.precioBase)?.toFixed(2)}</Text></Text>
            <Text style={styles.label}>En Promoción: <Text style={styles.value}>{lente.enPromocion ? 'Sí' : 'No'}</Text></Text>
            {lente.promocionId && (
              <Text style={styles.label}>Promoción: <Text style={styles.value}>{lente.promocionId?.nombre || lente.promocionId}</Text></Text>
            )}
            <Text style={styles.label}>Medidas:</Text>
            <Text style={styles.value}>
              {lente.medidas
                ? `${lente.medidas.ancho}×${lente.medidas.altura}×${lente.medidas.anchoPuente} mm`
                : 'N/A'}
            </Text>
            <Text style={styles.label}>Stock por sucursal:</Text>
            {Array.isArray(lente.sucursales) && lente.sucursales.length > 0 ? (
              lente.sucursales.map((s, idx) => (
                <Text key={idx} style={styles.value}>
                  {s.nombreSucursal || s.sucursalId?.nombre}: {s.stock} unidades
                </Text>
              ))
            ) : (
              <Text style={styles.value}>Sin stock</Text>
            )}
            <Text style={styles.label}>Fecha de creación: <Text style={styles.value}>{lente.fechaCreacion ? new Date(lente.fechaCreacion).toLocaleDateString() : 'N/A'}</Text></Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '90%', maxHeight: '80%' },
  image: { width: 120, height: 120, borderRadius: 12, marginBottom: 12, backgroundColor: '#f0f0f0', alignSelf: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  label: { fontSize: 15, color: '#888', marginTop: 8 },
  value: { color: '#333', fontWeight: 'bold' },
  closeButton: { marginTop: 24, alignSelf: 'center' },
  closeText: { color: '#00bcd4', fontWeight: 'bold', fontSize: 16 },
});

export default LenteDetailModal;