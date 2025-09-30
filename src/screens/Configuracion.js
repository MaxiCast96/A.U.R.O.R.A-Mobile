import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';

const Row = ({ icon, color, title, subtitle, right }) => (
  <View style={styles.row}>
    <View style={[styles.rowIconWrap, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.rowTextWrap}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
    </View>
    <View>{right}</View>
  </View>
);

const Chip = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const Configuracion = () => {
  const navigation = useNavigation();
  const {
    theme, setTheme,
    language, setLanguage,
    notifications, setNotifications,
    currency, setCurrency,
    dateFormat, setDateFormat,
  } = useSettings();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configuración</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSubtitle}>Preferencias de la aplicación</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
        {/* Tema */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apariencia</Text>
          <View style={styles.chipsRow}>
            {[
              { key: 'light', label: 'Claro' },
              { key: 'dark', label: 'Oscuro' },
              { key: 'system', label: 'Sistema' },
            ].map(opt => (
              <Chip key={opt.key} label={opt.label} active={theme===opt.key} onPress={() => setTheme(opt.key)} />
            ))}
          </View>
        </View>

        {/* Idioma */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Idioma</Text>
          <View style={styles.chipsRow}>
            {[
              { key: 'es', label: 'Español' },
              { key: 'en', label: 'English' },
            ].map(opt => (
              <Chip key={opt.key} label={opt.label} active={language===opt.key} onPress={() => setLanguage(opt.key)} />
            ))}
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notificaciones</Text>
          <Row
            icon="notifications-outline"
            color="#F59E0B"
            title="Notificaciones push"
            subtitle="Recibe alertas y recordatorios"
            right={<Switch value={notifications} onValueChange={setNotifications} />}
          />
        </View>

        {/* Moneda */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Moneda</Text>
          <View style={styles.chipsRow}>
            {[
              { key: 'USD', label: 'USD' },
              { key: 'SVC', label: 'SVC' },
              { key: 'EUR', label: 'EUR' },
            ].map(opt => (
              <Chip key={opt.key} label={opt.label} active={currency===opt.key} onPress={() => setCurrency(opt.key)} />
            ))}
          </View>
        </View>

        {/* Formato de fecha */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Formato de fecha</Text>
          <View style={styles.chipsRow}>
            {[
              { key: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
              { key: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            ].map(opt => (
              <Chip key={opt.key} label={opt.label} active={dateFormat===opt.key} onPress={() => setDateFormat(opt.key)} />
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#009BBF', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 24, fontFamily: 'Lato-Bold', color: '#FFFFFF', flex: 1, textAlign: 'center', marginHorizontal: 16 },
  headerSubtitle: { fontSize: 16, fontFamily: 'Lato-Regular', color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  content: { flex: 1 },

  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', padding: 16, marginBottom: 16 },
  cardTitle: { fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 12, fontSize: 14 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowTextWrap: { flex: 1 },
  rowTitle: { fontFamily: 'Lato-Bold', color: '#1A1A1A' },
  rowSubtitle: { fontFamily: 'Lato-Regular', color: '#666' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#009BBF', borderColor: '#009BBF' },
  chipText: { fontFamily: 'Lato-Bold', color: '#1A1A1A' },
  chipTextActive: { color: '#FFFFFF' },
});

export default Configuracion;
