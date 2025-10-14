import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, Linking, Platform, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

// IMPORTANTE: Reemplaza con tu Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyD_2RUYz1Zigc6G2hD2KcG7muiPrfm8aHU';

// Función helper para geocodificar con Google Maps (MUY PRECISO)
const geocodeWithGoogle = async (address) => {
  if (!address) return null;
  
  try {
    console.log('🔍 Google Maps: Geocodificando:', address);
    
    const encodedAddress = encodeURIComponent(address);
    // ✅ CORREGIDO: Usar la variable GOOGLE_MAPS_API_KEY
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('🌐 URL de la petición:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📡 Google Maps respuesta status:', data.status);
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log('✅ Google Maps: Coordenadas encontradas:', location);
      console.log('📍 Lugar:', data.results[0].formatted_address);
      
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn('⚠️ Google Maps: No se encontraron resultados para esta dirección');
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('❌ Google Maps: API Key inválida o no configurada correctamente');
      console.error('❌ Mensaje de error:', data.error_message);
      console.error('💡 Verifica que tu API Key tenga habilitada la Geocoding API');
      Alert.alert(
        'Error de API Key',
        'La API Key de Google Maps no está configurada correctamente. Verifica que tengas habilitada la Geocoding API en Google Cloud Console.'
      );
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('❌ Se excedió el límite de consultas de la API');
      Alert.alert('Error', 'Se excedió el límite de consultas. Intenta más tarde.');
    } else {
      console.warn('⚠️ Google Maps error:', data.status);
      if (data.error_message) {
        console.warn('Mensaje:', data.error_message);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error en geocodificación con Google:', error);
    return null;
  }
};

// Coordenadas aproximadas de ciudades principales de El Salvador (fallback)
const COORDENADAS_CIUDADES = {
  'quezaltepeque': { latitude: 13.8344, longitude: -89.2722, name: 'Quezaltepeque' },
  'san salvador': { latitude: 13.6929, longitude: -89.2182, name: 'San Salvador' },
  'santa tecla': { latitude: 13.6769, longitude: -89.2797, name: 'Santa Tecla' },
  'soyapango': { latitude: 13.7098, longitude: -89.1398, name: 'Soyapango' },
  'mejicanos': { latitude: 13.7408, longitude: -89.2122, name: 'Mejicanos' },
  'apopa': { latitude: 13.8072, longitude: -89.1794, name: 'Apopa' },
  'delgado': { latitude: 13.7267, longitude: -89.1828, name: 'Delgado' },
  'ilopango': { latitude: 13.7017, longitude: -89.1031, name: 'Ilopango' },
  'antiguo cuscatlan': { latitude: 13.6653, longitude: -89.2500, name: 'Antiguo Cuscatlán' },
  'cuscatancingo': { latitude: 13.7356, longitude: -89.1872, name: 'Cuscatancingo' },
  'la libertad': { latitude: 13.4883, longitude: -89.3222, name: 'La Libertad' },
  'santa ana': { latitude: 13.9942, longitude: -89.5597, name: 'Santa Ana' },
  'san miguel': { latitude: 13.4833, longitude: -88.1833, name: 'San Miguel' },
  'sonsonate': { latitude: 13.7189, longitude: -89.7239, name: 'Sonsonate' },
  'la union': { latitude: 13.3333, longitude: -87.8500, name: 'La Unión' },
  'usulutan': { latitude: 13.3500, longitude: -88.4333, name: 'Usulután' },
  'ahuachapan': { latitude: 13.9214, longitude: -89.8450, name: 'Ahuachapán' },
  'escalon': { latitude: 13.6989, longitude: -89.2394, name: 'Escalón' },
  'colonia medica': { latitude: 13.7050, longitude: -89.2250, name: 'Colonia Médica' },
  'colonia escalon': { latitude: 13.6989, longitude: -89.2394, name: 'Colonia Escalón' },
};

// Función helper para buscar coordenadas por ciudad
const buscarPorCiudad = (ciudad) => {
  if (!ciudad) return null;
  
  const ciudadNormalizada = ciudad.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  
  console.log('🔍 Buscando ciudad en base local:', ciudadNormalizada);
  
  // Búsqueda exacta
  if (COORDENADAS_CIUDADES[ciudadNormalizada]) {
    console.log('✅ Ciudad encontrada en base local');
    return COORDENADAS_CIUDADES[ciudadNormalizada];
  }
  
  // Búsqueda parcial
  for (const [key, value] of Object.entries(COORDENADAS_CIUDADES)) {
    if (key.includes(ciudadNormalizada) || ciudadNormalizada.includes(key)) {
      console.log('✅ Ciudad encontrada (coincidencia parcial):', key);
      return value;
    }
  }
  
  return null;
};

const MapaSucursalModal = ({ visible, onClose, sucursal }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);

  // Coordenadas por defecto (San Salvador centro)
  const defaultCoords = {
    latitude: 13.6929,
    longitude: -89.2182,
  };

  // Convertir direccion a texto legible y completo
  const direccionInfo = (() => {
    const d = sucursal?.direccion;
    if (!d) return { texto: '', ciudad: '', departamento: '' };
    
    if (typeof d === 'string') return { texto: d, ciudad: '', departamento: '' };
    
    if (typeof d === 'object') {
      const calle = d.calle || d.direccionDetallada || '';
      const ciudad = d.ciudad || d.municipio || '';
      const depto = d.departamento || '';
      
      const parts = [];
      if (calle) parts.push(calle);
      if (ciudad) parts.push(ciudad);
      if (depto) parts.push(depto);
      
      return {
        texto: parts.join(', '),
        ciudad: ciudad,
        departamento: depto
      };
    }
    
    return { texto: '', ciudad: '', departamento: '' };
  })();

  const direccionText = direccionInfo.texto;
  const direccionCompleta = direccionText ? `${direccionText}, El Salvador` : '';

  useEffect(() => {
    if (!visible || !sucursal) {
      setLoading(true);
      return;
    }

    const loadCoordinates = async () => {
      setLoading(true);

      console.log('🗺️ Datos de sucursal:', sucursal.nombre);
      console.log('📍 Dirección completa:', direccionCompleta);
      console.log('📍 Ciudad extraída:', direccionInfo.ciudad);

      // Verificar si la dirección está vacía
      if (!direccionCompleta || direccionCompleta === ', El Salvador') {
        console.log('❌ No hay dirección válida para geocodificar');
        setCoordinates(defaultCoords);
        Alert.alert(
          'Dirección incompleta',
          'Esta sucursal no tiene una dirección registrada. Se muestra San Salvador centro.'
        );
        setLoading(false);
        return;
      }

      // ESTRATEGIA 1: Google Maps con dirección completa (MÁS PRECISO)
      console.log('🔍 Estrategia 1: Google Maps con dirección completa');
      let geocoded = await geocodeWithGoogle(direccionCompleta);
      
      if (geocoded) {
        console.log('✅ Éxito con Google Maps - dirección completa');
        setCoordinates(geocoded);
        setLoading(false);
        return;
      }
      
      // ESTRATEGIA 2: Google Maps solo con ciudad
      if (direccionInfo.ciudad) {
        console.log('🔍 Estrategia 2: Google Maps con ciudad:', direccionInfo.ciudad);
        geocoded = await geocodeWithGoogle(`${direccionInfo.ciudad}, El Salvador`);
        
        if (geocoded) {
          console.log('✅ Éxito con Google Maps - ciudad');
          setCoordinates(geocoded);
          setLoading(false);
          return;
        }
      }
      
      // ESTRATEGIA 3: Base de datos local
      if (direccionInfo.ciudad) {
        console.log('🔍 Estrategia 3: Buscando en base local');
        const coordsLocal = buscarPorCiudad(direccionInfo.ciudad);
        
        if (coordsLocal) {
          console.log('✅ Éxito con base local');
          setCoordinates({
            latitude: coordsLocal.latitude,
            longitude: coordsLocal.longitude,
          });
          Alert.alert(
            'Ubicación aproximada',
            `Se muestra la ubicación aproximada de ${coordsLocal.name}.`
          );
          setLoading(false);
          return;
        }
      }
      
      // ESTRATEGIA 4: San Salvador centro (fallback final)
      console.log('❌ Todas las estrategias fallaron, usando San Salvador centro');
      setCoordinates(defaultCoords);
      Alert.alert(
        'Ubicación no encontrada',
        'No se pudo determinar la ubicación exacta. Se muestra San Salvador centro.'
      );
      setLoading(false);
    };

    loadCoordinates();
  }, [sucursal, visible, direccionCompleta]);

  // Abrir en Google Maps o Apple Maps
  const handleOpenInMaps = () => {
    if (!coordinates) return;

    const { latitude, longitude } = coordinates;
    const label = encodeURIComponent(sucursal?.nombre || 'Sucursal');
    
    const scheme = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });
    
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${label}&ll=${latitude},${longitude}`,
      android: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.canOpenURL(scheme)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(scheme);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(() => {
        Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
      });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ubicación</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Mapa */}
        <View style={styles.mapContainer}>
          {loading || !coordinates ? (
            <View style={styles.loadingMap}>
              <ActivityIndicator size="large" color="#009BBF" />
              <Text style={styles.loadingText}>Cargando ubicación...</Text>
            </View>
          ) : (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                ...coordinates,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={coordinates}
                title={sucursal?.nombre}
                description={direccionText}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.markerCircle}>
                    <Ionicons name="business" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.markerArrow} />
                </View>
              </Marker>
            </MapView>
          )}
        </View>

        {/* Card de información */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="business" size={24} color="#009BBF" />
            <Text style={styles.sucursalName}>{sucursal?.nombre || 'Sucursal'}</Text>
          </View>

          {direccionText && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={18} color="#666" />
              <Text style={styles.infoText}>{direccionText || 'Dirección no disponible'}</Text>
            </View>
          )}

          {sucursal?.telefono && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={18} color="#666" />
              <Text style={styles.infoText}>{sucursal.telefono}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.openMapButton, loading && styles.openMapButtonDisabled]} 
            onPress={handleOpenInMaps}
            disabled={loading}
          >
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.openMapButtonText}>Ver en Mapas</Text>
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
    backgroundColor: '#009BBF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingMap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E5E5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#666',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#009BBF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#009BBF',
    marginTop: -1,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sucursalName: {
    fontSize: 20,
    fontFamily: 'Lato-Bold',
    color: '#1A1A1A',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  openMapButton: {
    backgroundColor: '#009BBF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    shadowColor: '#009BBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  openMapButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  openMapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
  },
});

export default MapaSucursalModal;