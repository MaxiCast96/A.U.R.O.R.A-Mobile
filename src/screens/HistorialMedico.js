import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    StatusBar,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const API_URL = 'https://aurora-production-7e57.up.railway.app/api';

const SORT_OPTIONS = [
    { value: 'cliente-asc', label: 'Cliente A-Z', icon: 'person' },
    { value: 'cliente-desc', label: 'Cliente Z-A', icon: 'person' },
    { value: 'fechaDeteccion-desc', label: 'Detección Más Reciente', icon: 'calendar' },
    { value: 'fechaDeteccion-asc', label: 'Detección Más Antigua', icon: 'calendar' },
];

const toYMD = (val) => {
    if (!val) return '';
    try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    } catch { return ''; }
};

const initialFormState = {
    clienteId: '',
    padecimientos: { tipo: '', descripcion: '', fechaDeteccion: '' },
    historialVisual: {
        fecha: '',
        diagnostico: '',
        receta: {
            ojoDerecho: { esfera: '', cilindro: '', eje: '', adicion: '' },
            ojoIzquierdo: { esfera: '', cilindro: '', eje: '', adicion: '' }
        }
    }
};

const StatsCard = ({ label, value, iconName, color }) => (
    <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
            <Text style={styles.statsLabel}>{label}</Text>
            <View style={[styles.statsIconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={iconName} size={20} color={color} />
            </View>
        </View>
        <Text style={styles.statsValue}>{value}</Text>
    </View>
);

const HistorialCard = ({ historial, onView, onEdit, onDelete }) => {
    const clienteNombre = historial.clienteId
        ? `${historial.clienteId.nombre || ''} ${historial.clienteId.apellido || ''}`.trim()
        : 'N/A';

    return (
        <View style={styles.historialCard}>
            <View style={styles.cardHeader}>
                <View style={styles.clientInfo}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {historial.clienteId?.nombre?.charAt(0) || 'N'}{historial.clienteId?.apellido?.charAt(0) || 'A'}
                        </Text>
                    </View>
                    <View style={styles.clientDetails}>
                        <Text style={styles.clientName}>{clienteNombre}</Text>
                        <Text style={styles.clientAge}>{historial.clienteId?.edad} años</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardInfo}>
                <View style={styles.infoRow}>
                    <Ionicons name="fitness" size={16} color="#D0155F" />
                    <Text style={styles.infoLabel}>Padecimiento:</Text>
                    <Text style={styles.infoValue}>{historial.padecimientos?.tipo || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="eye" size={16} color="#009BBF" />
                    <Text style={styles.infoLabel}>Diagnóstico:</Text>
                    <Text style={styles.infoValue}>{historial.historialVisual?.diagnostico || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={16} color="#49AA4C" />
                    <Text style={styles.infoLabel}>Detección:</Text>
                    <Text style={styles.infoValue}>
                        {historial.padecimientos?.fechaDeteccion 
                            ? new Date(historial.padecimientos.fechaDeteccion).toLocaleDateString('es-ES')
                            : '-'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => onView(historial)} style={styles.actionButtonPrimary}>
                    <Ionicons name="eye" size={16} color="#2563EB" />
                    <Text style={styles.actionButtonPrimaryText}>Ver expediente</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onEdit(historial)} style={styles.actionButtonIcon}>
                    <Ionicons name="create" size={16} color="#49AA4C" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(historial)} style={styles.actionButtonIconRed}>
                    <Ionicons name="trash" size={16} color="#E74C3C" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const DetailModal = ({ visible, onClose, historial }) => {
    if (!historial) return null;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderContent}>
                        <Text style={styles.modalTitle}>Historial Médico</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.modalContent}>
                    <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                            <Ionicons name="person" size={20} color="#009BBF" />
                            <Text style={styles.modalSectionTitle}>Información del Paciente</Text>
                        </View>
                        <View style={styles.modalSectionContent}>
                            <InfoRow 
                                label="Cliente" 
                                value={historial.clienteId 
                                    ? `${historial.clienteId.nombre || ''} ${historial.clienteId.apellido || ''}`.trim()
                                    : 'N/A'} 
                            />
                            <InfoRow label="Edad" value={`${historial.clienteId?.edad || '-'} años`} />
                        </View>
                    </View>

                    <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                            <Ionicons name="fitness" size={20} color="#D0155F" />
                            <Text style={styles.modalSectionTitle}>Padecimientos</Text>
                        </View>
                        <View style={styles.modalSectionContent}>
                            <InfoRow label="Tipo" value={historial.padecimientos?.tipo || '-'} />
                            <InfoRow label="Descripción" value={historial.padecimientos?.descripcion || '-'} />
                            <InfoRow 
                                label="Fecha Detección" 
                                value={historial.padecimientos?.fechaDeteccion 
                                    ? new Date(historial.padecimientos.fechaDeteccion).toLocaleDateString('es-ES')
                                    : '-'} 
                            />
                        </View>
                    </View>

                    <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                            <Ionicons name="eye" size={20} color="#009BBF" />
                            <Text style={styles.modalSectionTitle}>Historial Visual</Text>
                        </View>
                        <View style={styles.modalSectionContent}>
                            <InfoRow label="Diagnóstico" value={historial.historialVisual?.diagnostico || '-'} />
                            <InfoRow 
                                label="Fecha" 
                                value={historial.historialVisual?.fecha 
                                    ? new Date(historial.historialVisual.fecha).toLocaleDateString('es-ES')
                                    : '-'} 
                            />
                        </View>
                    </View>

                    <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                            <Ionicons name="glasses" size={20} color="#49AA4C" />
                            <Text style={styles.modalSectionTitle}>Graduación</Text>
                        </View>
                        <View style={styles.graduacionContainer}>
                            <View style={styles.graduacionCard}>
                                <Text style={styles.graduacionTitle}>Ojo Derecho (OD)</Text>
                                <InfoRow label="Esfera" value={historial.historialVisual?.receta?.ojoDerecho?.esfera || '-'} />
                                <InfoRow label="Cilindro" value={historial.historialVisual?.receta?.ojoDerecho?.cilindro || '-'} />
                                <InfoRow label="Eje" value={historial.historialVisual?.receta?.ojoDerecho?.eje || '-'} />
                                <InfoRow label="Adición" value={historial.historialVisual?.receta?.ojoDerecho?.adicion || '-'} />
                            </View>
                            <View style={styles.graduacionCard}>
                                <Text style={styles.graduacionTitle}>Ojo Izquierdo (OI)</Text>
                                <InfoRow label="Esfera" value={historial.historialVisual?.receta?.ojoIzquierdo?.esfera || '-'} />
                                <InfoRow label="Cilindro" value={historial.historialVisual?.receta?.ojoIzquierdo?.cilindro || '-'} />
                                <InfoRow label="Eje" value={historial.historialVisual?.receta?.ojoIzquierdo?.eje || '-'} />
                                <InfoRow label="Adición" value={historial.historialVisual?.receta?.ojoIzquierdo?.adicion || '-'} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRowContainer}>
        <Text style={styles.infoRowLabel}>{label}:</Text>
        <Text style={styles.infoRowValue}>{value}</Text>
    </View>
);

const FormModal = ({ visible, onClose, title, onSubmit, formData, setFormData, errors, clientes, editMode }) => {
    const handleInputChange = (field, value, subfield = null, subsubfield = null) => {
        if (subfield && subsubfield) {
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [subfield]: {
                        ...prev[field][subfield],
                        [subsubfield]: value
                    }
                }
            }));
        } else if (subfield) {
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [subfield]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderContent}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.formContent}>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Cliente *</Text>
                        <View style={styles.pickerContainer}>
                            <Ionicons name="person" size={20} color="#666666" style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.clienteId}
                                onValueChange={(value) => handleInputChange('clienteId', value)}
                                style={styles.picker}
                                enabled={!editMode}
                            >
                                <Picker.Item label="Seleccione cliente" value="" />
                                {clientes.map(cliente => (
                                    <Picker.Item 
                                        key={cliente._id} 
                                        label={`${cliente.nombre} ${cliente.apellido}`} 
                                        value={cliente._id} 
                                    />
                                ))}
                            </Picker>
                        </View>
                        {errors.clienteId && <Text style={styles.errorText}>{errors.clienteId}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Tipo de Padecimiento *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="fitness" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                value={formData.padecimientos.tipo} 
                                onChangeText={(text) => handleInputChange('padecimientos', text, 'tipo')} 
                                placeholder="Tipo de padecimiento" 
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        {errors.padecimientoTipo && <Text style={styles.errorText}>{errors.padecimientoTipo}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Descripción *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                value={formData.padecimientos.descripcion} 
                                onChangeText={(text) => handleInputChange('padecimientos', text, 'descripcion')} 
                                placeholder="Descripción del padecimiento" 
                                placeholderTextColor="#999999" 
                                multiline 
                                numberOfLines={3} 
                            />
                        </View>
                        {errors.padecimientoDescripcion && <Text style={styles.errorText}>{errors.padecimientoDescripcion}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Fecha de Detección *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                value={formData.padecimientos.fechaDeteccion} 
                                onChangeText={(text) => handleInputChange('padecimientos', text, 'fechaDeteccion')} 
                                placeholder="YYYY-MM-DD" 
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        {errors.fechaDeteccion && <Text style={styles.errorText}>{errors.fechaDeteccion}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Fecha de Diagnóstico *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                value={formData.historialVisual.fecha} 
                                onChangeText={(text) => handleInputChange('historialVisual', text, 'fecha')} 
                                placeholder="YYYY-MM-DD" 
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        {errors.fechaDiagnostico && <Text style={styles.errorText}>{errors.fechaDiagnostico}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Diagnóstico *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="eye" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                value={formData.historialVisual.diagnostico} 
                                onChangeText={(text) => handleInputChange('historialVisual', text, 'diagnostico')} 
                                placeholder="Diagnóstico" 
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        {errors.diagnostico && <Text style={styles.errorText}>{errors.diagnostico}</Text>}
                    </View>

                    <Text style={styles.sectionTitle}>Graduación Ojo Derecho (OD)</Text>
                    <View style={styles.formRow}>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.formLabel}>Esfera</Text>
                            <TextInput 
                                style={styles.inputSmall} 
                                value={formData.historialVisual.receta.ojoDerecho.esfera} 
                                onChangeText={(text) => handleInputChange('historialVisual', text, 'receta', { ojoDerecho: { ...formData.historialVisual.receta.ojoDerecho, esfera: text } })}
                                placeholder="0.00" 
                                keyboardType="numeric"
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.formLabel}>Cilindro</Text>
                            <TextInput 
                                style={styles.inputSmall} 
                                value={formData.historialVisual.receta.ojoDerecho.cilindro} 
                                onChangeText={(text) => {
                                    const newReceta = { ...formData.historialVisual.receta };
                                    newReceta.ojoDerecho.cilindro = text;
                                    handleInputChange('historialVisual', newReceta, 'receta');
                                }}
                                placeholder="0.00" 
                                keyboardType="numeric"
                                placeholderTextColor="#999999" 
                            />
                        </View>
                    </View>
                    <View style={styles.formRow}>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.formLabel}>Eje</Text>
                            <TextInput 
                                style={styles.inputSmall} 
                                value={formData.historialVisual.receta.ojoDerecho.eje} 
                                onChangeText={(text) => {
                                    const newReceta = { ...formData.historialVisual.receta };
                                    newReceta.ojoDerecho.eje = text;
                                    handleInputChange('historialVisual', newReceta, 'receta');
                                }}
                                placeholder="0" 
                                keyboardType="numeric"
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.formLabel}>Adición</Text>
                            <TextInput 
                                style={styles.inputSmall} 
                                value={formData.historialVisual.receta.ojoDerecho.adicion} 
                                onChangeText={(text) => {
                                    const newReceta = { ...formData.historialVisual.receta };
                                    newReceta.ojoDerecho.adicion = text;
                                    handleInputChange('historialVisual', newReceta, 'receta');
                                }}
                                placeholder="0.00" 
                                keyboardType="numeric"
                                placeholderTextColor="#999999" 
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Graduación Ojo Izquierdo (OI)</Text>
                    <View style={styles.formRow}>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.formLabel}>Esfera</Text>
                            <TextInput 
                                style={styles.inputSmall} 
                                value={formData.historialVisual.receta.ojoIzquierdo.esfera} 
                                onChangeText={(text) => {
                                    const newReceta = { ...formData.historialVisual.receta };
                                    newReceta.ojoIzquierdo.esfera = text;
                                    handleInputChange('historialVisual', newReceta, 'receta');
                                }}
                                placeholder="0.00" 
                                keyboardType="numeric"
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.formLabel}>Cilindro</Text>
                            <TextInput 
                                style={styles.inputSmall} 
                                value={formData.historialVisual.receta.ojoIzquierdo.cilindro} 
                                onChangeText={(text) => {
                                    const newReceta = { ...formData.historialVisual.receta };
                                    newReceta.ojoIzquierdo.cilindro = text;
                                    handleInputChange('historialVisual', newReceta, 'receta');
                                }}
                                placeholder="0.00" 
                                keyboardType="numeric"
                                placeholderTextColor="#999999" 
                            />
                        </View>
                    </View>
                    <View style={styles.formRow}>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.formLabel}>Eje</Text>
                            <TextInput 
                                style={styles.inputSmall} 
                                value={formData.historialVisual.receta.ojoIzquierdo.eje} 
                                onChangeText={(text) => {
                                    const newReceta = { ...formData.historialVisual.receta };
                                    newReceta.ojoIzquierdo.eje = text;
                                    handleInputChange('historialVisual', newReceta, 'receta');
                                }}
                                placeholder="0" 
                                keyboardType="numeric"
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.formLabel}>Adición</Text>
                            <TextInput 
                                style={styles.inputSmall} 
                                value={formData.historialVisual.receta.ojoIzquierdo.adicion} 
                                onChangeText={(text) => {
                                    const newReceta = { ...formData.historialVisual.receta };
                                    newReceta.ojoIzquierdo.adicion = text;
                                    handleInputChange('historialVisual', newReceta, 'receta');
                                }}
                                placeholder="0.00" 
                                keyboardType="numeric"
                                placeholderTextColor="#999999" 
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.formActions}>
                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onSubmit} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Guardar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const DeleteModal = ({ visible, onClose, onConfirm, historial }) => {
    if (!historial) return null;
    const clienteNombre = historial.clienteId 
        ? `${historial.clienteId.nombre || ''} ${historial.clienteId.apellido || ''}`.trim()
        : 'este paciente';

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.deleteModalOverlay}>
                <View style={styles.deleteModalContent}>
                    <View style={styles.deleteModalIcon}>
                        <Ionicons name="warning" size={48} color="#E74C3C" />
                    </View>
                    <Text style={styles.deleteModalTitle}>¿Eliminar historial?</Text>
                    <Text style={styles.deleteModalMessage}>
                        ¿Estás seguro de que deseas eliminar el historial médico de {clienteNombre}? Esta acción no se puede deshacer.
                    </Text>
                    <View style={styles.deleteModalActions}>
                        <TouchableOpacity onPress={onClose} style={styles.deleteModalCancelButton}>
                            <Text style={styles.deleteModalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onConfirm} style={styles.deleteModalConfirmButton}>
                            <Text style={styles.deleteModalConfirmText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const EmptyState = () => (
    <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
            <Ionicons name="document-text-outline" size={48} color="#CCCCCC" />
        </View>
        <Text style={styles.emptyTitle}>No hay historiales médicos</Text>
        <Text style={styles.emptySubtitle}>Los historiales aparecerán aquí cuando sean creados</Text>
    </View>
);

const HistorialMedico = () => {
    const navigation = useNavigation();
    const [historiales, setHistoriales] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedHistorial, setSelectedHistorial] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [filters, setFilters] = useState({
        tipoPadecimiento: 'todos',
        fechaDesde: '',
        fechaHasta: ''
    });
    const [sortBy, setSortBy] = useState('fechaDeteccion-desc');

    const fetchHistoriales = useCallback(async () => {
        try {
            setLoading(true);
            const [historialesRes, clientesRes] = await Promise.all([
                axios.get(`${API_URL}/historialMedico`),
                axios.get(`${API_URL}/clientes`)
            ]);
            
            const formattedData = historialesRes.data.map(h => ({
                ...h,
                fechaDeteccionRaw: new Date(h.padecimientos?.fechaDeteccion),
                fechaDiagnosticoRaw: new Date(h.historialVisual?.fecha),
            }));

            setHistoriales(formattedData || []);
            setClientes(clientesRes.data || []);
        } catch (error) {
            console.error('Error al cargar historiales:', error);
            Alert.alert('Error', 'No se pudieron cargar los historiales');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchHistoriales();
    }, [fetchHistoriales]);

    const clientesConHistorial = useMemo(() => 
        new Set(historiales.map(h => (h.clienteId?._id || h.clienteId)).filter(Boolean)),
    [historiales]);

    const uniquePadecimientos = useMemo(() => {
        const padecimientos = historiales
            .map(h => h.padecimientos?.tipo)
            .filter(Boolean)
            .map(p => p.toLowerCase())
            .filter((p, index, arr) => arr.indexOf(p) === index);
        return padecimientos.sort();
    }, [historiales]);

    const filteredAndSortedHistoriales = useMemo(() => {
        let filtered = historiales.filter(historial => {
            const search = searchTerm.toLowerCase();
            const cliente = historial.clienteId;
            const matchesSearch = !searchTerm ||
                (cliente && `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(search)) ||
                historial.padecimientos?.tipo?.toLowerCase().includes(search) ||
                historial.historialVisual?.diagnostico?.toLowerCase().includes(search);

            let matchesPadecimiento = true;
            if (filters.tipoPadecimiento !== 'todos') {
                matchesPadecimiento = historial.padecimientos?.tipo?.toLowerCase() === filters.tipoPadecimiento;
            }

            let matchesFechaDesde = true;
            if (filters.fechaDesde) {
                const fechaDesde = new Date(filters.fechaDesde);
                matchesFechaDesde = historial.fechaDeteccionRaw >= fechaDesde;
            }

            let matchesFechaHasta = true;
            if (filters.fechaHasta) {
                const fechaHasta = new Date(filters.fechaHasta);
                fechaHasta.setHours(23, 59, 59);
                matchesFechaHasta = historial.fechaDeteccionRaw <= fechaHasta;
            }

            return matchesSearch && matchesPadecimiento && matchesFechaDesde && matchesFechaHasta;
        });

        const [field, order] = sortBy.split('-');
        filtered.sort((a, b) => {
            let valueA, valueB;
            if (field === 'cliente') {
                valueA = `${a.clienteId?.nombre || ''} ${a.clienteId?.apellido || ''}`.toLowerCase();
                valueB = `${b.clienteId?.nombre || ''} ${b.clienteId?.apellido || ''}`.toLowerCase();
            } else if (field === 'fechaDeteccion') {
                valueA = a.fechaDeteccionRaw || new Date(0);
                valueB = b.fechaDeteccionRaw || new Date(0);
            }
            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [historiales, searchTerm, filters, sortBy]);

    const stats = useMemo(() => {
        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0];
        
        return {
            total: historiales.length,
            recientes: historiales.filter(h => {
                const fecha = h.fechaDeteccionRaw;
                const diff = (hoy - fecha) / (1000 * 60 * 60 * 24);
                return diff <= 30;
            }).length,
            clientes: new Set(historiales.map(h => h.clienteId?._id).filter(Boolean)).size,
        };
    }, [historiales]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchHistoriales();
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleOpenAddModal = () => {
        setFormData(initialFormState);
        setErrors({});
        setShowAddModal(true);
    };

    const handleOpenEditModal = (historial) => {
        setFormData({
            clienteId: historial.clienteId?._id || '',
            padecimientos: {
                tipo: historial.padecimientos?.tipo || '',
                descripcion: historial.padecimientos?.descripcion || '',
                fechaDeteccion: toYMD(historial.padecimientos?.fechaDeteccion)
            },
            historialVisual: {
                fecha: toYMD(historial.historialVisual?.fecha),
                diagnostico: historial.historialVisual?.diagnostico || '',
                receta: {
                    ojoDerecho: {
                        esfera: historial.historialVisual?.receta?.ojoDerecho?.esfera || '',
                        cilindro: historial.historialVisual?.receta?.ojoDerecho?.cilindro || '',
                        eje: historial.historialVisual?.receta?.ojoDerecho?.eje || '',
                        adicion: historial.historialVisual?.receta?.ojoDerecho?.adicion || ''
                    },
                    ojoIzquierdo: {
                        esfera: historial.historialVisual?.receta?.ojoIzquierdo?.esfera || '',
                        cilindro: historial.historialVisual?.receta?.ojoIzquierdo?.cilindro || '',
                        eje: historial.historialVisual?.receta?.ojoIzquierdo?.eje || '',
                        adicion: historial.historialVisual?.receta?.ojoIzquierdo?.adicion || ''
                    }
                }
            }
        });
        setSelectedHistorial(historial);
        setErrors({});
        setShowDetail(false);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (historial) => {
        setSelectedHistorial(historial);
        setShowDetail(false);
        setShowDeleteModal(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.clienteId) newErrors.clienteId = 'Cliente requerido';
        if (!formData.padecimientos.tipo) newErrors.padecimientoTipo = 'Tipo de padecimiento requerido';
        if (!formData.padecimientos.descripcion) newErrors.padecimientoDescripcion = 'Descripción requerida';
        if (!formData.padecimientos.fechaDeteccion) newErrors.fechaDeteccion = 'Fecha de detección requerida';
        if (!formData.historialVisual.fecha) newErrors.fechaDiagnostico = 'Fecha de diagnóstico requerida';
        if (!formData.historialVisual.diagnostico) newErrors.diagnostico = 'Diagnóstico requerido';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Error', 'Por favor completa todos los campos requeridos');
            return;
        }
        try {
            setLoading(true);
            const dataToSend = {
                ...formData,
                padecimientos: {
                    ...formData.padecimientos,
                    fechaDeteccion: new Date(formData.padecimientos.fechaDeteccion)
                },
                historialVisual: {
                    ...formData.historialVisual,
                    fecha: new Date(formData.historialVisual.fecha)
                }
            };
            
            if (selectedHistorial) {
                await axios.put(`${API_URL}/historialMedico/${selectedHistorial._id}`, dataToSend);
                Alert.alert('Éxito', 'Historial médico actualizado correctamente');
            } else {
                const existing = historiales.find(h => (h.clienteId?._id || h.clienteId) === formData.clienteId);
                if (existing) {
                    Alert.alert(
                        'Cliente con historial existente',
                        'Este cliente ya tiene un historial médico. ¿Deseas sobrescribir el existente?',
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                                text: 'Sobrescribir',
                                onPress: async () => {
                                    try {
                                        await axios.put(`${API_URL}/historialMedico/${existing._id}`, dataToSend);
                                        Alert.alert('Éxito', 'Historial médico sobrescrito correctamente');
                                        await fetchHistoriales();
                                        setShowAddModal(false);
                                        setSelectedHistorial(null);
                                        setFormData(initialFormState);
                                    } catch (error) {
                                        Alert.alert('Error', 'No se pudo sobrescribir el historial');
                                    }
                                }
                            }
                        ]
                    );
                    setLoading(false);
                    return;
                }
                await axios.post(`${API_URL}/historialMedico`, dataToSend);
                Alert.alert('Éxito', 'Historial médico creado correctamente');
            }
            await fetchHistoriales();
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedHistorial(null);
            setFormData(initialFormState);
        } catch (error) {
            console.error('Error al guardar historial:', error);
            Alert.alert('Error', 'No se pudo guardar el historial médico');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedHistorial) return;
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/historialMedico/${selectedHistorial._id}`);
            Alert.alert('Éxito', 'Historial médico eliminado correctamente');
            await fetchHistoriales();
            setShowDeleteModal(false);
            setSelectedHistorial(null);
        } catch (error) {
            console.error('Error al eliminar historial:', error);
            Alert.alert('Error', 'No se pudo eliminar el historial médico');
        } finally {
            setLoading(false);
        }
    };

    const clearAllFilters = () => {
        setFilters({
            tipoPadecimiento: 'todos',
            fechaDesde: '',
            fechaHasta: ''
        });
        setSearchTerm('');
    };

    const hasActiveFilters = () => {
        return searchTerm || 
               filters.tipoPadecimiento !== 'todos' || 
               filters.fechaDesde || 
               filters.fechaHasta;
    };

    const ListHeaderComponent = () => (
        <View>
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder="Buscar por cliente, padecimiento..." 
                        placeholderTextColor="#999999" 
                        value={searchTerm} 
                        onChangeText={setSearchTerm} 
                    />
                    {searchTerm ? (
                        <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#666666" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <View style={styles.filtersRow}>
                    <TouchableOpacity 
                        onPress={() => setShowFilters(!showFilters)} 
                        style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
                    >
                        <Ionicons name="funnel" size={20} color={hasActiveFilters() ? "#FFFFFF" : "#009BBF"} />
                        {hasActiveFilters() && <View style={styles.filterBadge} />}
                    </TouchableOpacity>
                </View>

                {showFilters && (
                    <View style={styles.filtersPanel}>
                        <View style={styles.filtersPanelHeader}>
                            <Text style={styles.filtersPanelTitle}>Filtros Avanzados</Text>
                            <TouchableOpacity onPress={() => setShowFilters(false)}>
                                <Ionicons name="close" size={24} color="#666666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Tipo de Padecimiento</Text>
                            <View style={styles.pickerContainer}>
                                <Ionicons name="fitness" size={20} color="#666666" style={styles.pickerIcon} />
                                <Picker
                                    selectedValue={filters.tipoPadecimiento}
                                    onValueChange={(value) => setFilters({ ...filters, tipoPadecimiento: value })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Todos" value="todos" />
                                    {uniquePadecimientos.map(p => (
                                        <Picker.Item 
                                            key={p} 
                                            label={p.charAt(0).toUpperCase() + p.slice(1)} 
                                            value={p} 
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Fecha Desde</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="calendar" size={20} color="#666666" style={styles.inputIcon} />
                                <TextInput 
                                    style={styles.input} 
                                    value={filters.fechaDesde} 
                                    onChangeText={(text) => setFilters({ ...filters, fechaDesde: text })} 
                                    placeholder="YYYY-MM-DD" 
                                    placeholderTextColor="#999999" 
                                />
                            </View>
                        </View>

                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Fecha Hasta</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="calendar" size={20} color="#666666" style={styles.inputIcon} />
                                <TextInput 
                                    style={styles.input} 
                                    value={filters.fechaHasta} 
                                    onChangeText={(text) => setFilters({ ...filters, fechaHasta: text })} 
                                    placeholder="YYYY-MM-DD" 
                                    placeholderTextColor="#999999" 
                                />
                            </View>
                        </View>

                        <View style={styles.filterActions}>
                            <TouchableOpacity onPress={clearAllFilters} style={styles.filterClearButton}>
                                <Text style={styles.filterClearButtonText}>Limpiar Todo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.filterApplyButton}>
                                <Text style={styles.filterApplyButtonText}>Aplicar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsCount}>
                        {filteredAndSortedHistoriales.length} resultado{filteredAndSortedHistoriales.length !== 1 ? 's' : ''}
                    </Text>
                    {hasActiveFilters() && (
                        <TouchableOpacity onPress={clearAllFilters} style={styles.clearFiltersButton}>
                            <Ionicons name="close-circle" size={16} color="#009BBF" />
                            <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    if (loading && historiales.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#009BBF" />
                <Text style={styles.loadingText}>Cargando historiales...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#009BBF" />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={handleGoBack}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Historial Médico</Text>
                        <Text style={styles.headerSubtitle}>Gestiona los expedientes médicos</Text>
                    </View>
                    
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer} contentContainerStyle={styles.statsContent}>
                    <StatsCard label="Total" value={stats.total} iconName="document-text" color="#009BBF" />
                    <StatsCard label="Recientes" value={stats.recientes} iconName="time" color="#49AA4C" />
                    <StatsCard label="Clientes" value={stats.clientes} iconName="people" color="#F39C12" />
                </ScrollView>
            </View>

            <FlatList
                data={filteredAndSortedHistoriales}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <HistorialCard 
                        historial={item} 
                        onView={(h) => { setSelectedHistorial(h); setShowDetail(true); }} 
                        onEdit={(h) => handleOpenEditModal(h)} 
                        onDelete={(h) => handleOpenDeleteModal(h)} 
                    />
                )}
                ListHeaderComponent={ListHeaderComponent}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<EmptyState />}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={handleRefresh} 
                        colors={['#009BBF']} 
                        tintColor="#009BBF" 
                    />
                }
            />

            <DetailModal 
                visible={showDetail} 
                onClose={() => { setShowDetail(false); setSelectedHistorial(null); }} 
                historial={selectedHistorial} 
            />
            <FormModal 
                visible={showAddModal || showEditModal} 
                onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedHistorial(null); }} 
                title={selectedHistorial ? 'Editar Historial' : 'Nuevo Historial'} 
                onSubmit={handleSubmit} 
                formData={formData} 
                setFormData={setFormData} 
                errors={errors} 
                clientes={clientes} 
                editMode={!!selectedHistorial}
            />
            <DeleteModal 
                visible={showDeleteModal} 
                onClose={() => { setShowDeleteModal(false); setSelectedHistorial(null); }} 
                onConfirm={handleDelete} 
                historial={selectedHistorial} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    loadingText: { marginTop: 12, fontSize: 16, fontFamily: 'Lato-Regular', color: '#666666' },
    header: { backgroundColor: '#009BBF', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    headerContent: { flex: 1 },
    headerTitle: { fontSize: 24, fontFamily: 'Lato-Bold', color: '#FFFFFF', marginBottom: 4, marginLeft: 20 },
    headerSubtitle: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#E0F7FF' },
    headerButtons: { flexDirection: 'row', gap: 8 },
    refreshButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center' },
    addButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#49AA4C', alignItems: 'center', justifyContent: 'center' },
    statsContainer: { marginTop: 8 },
    statsContent: { gap: 12 },
    statsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, width: 140, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    statsLabel: { fontSize: 12, fontFamily: 'Lato-Regular', color: '#666666' },
    statsIconContainer: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statsValue: { fontSize: 24, fontFamily: 'Lato-Bold', color: '#1A1A1A' },
    searchContainer: { padding: 16, backgroundColor: '#F8F9FA' },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E5E5', marginBottom: 12 },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, fontSize: 16, fontFamily: 'Lato-Regular', color: '#1A1A1A' },
    clearButton: { padding: 4 },
    filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    filterButton: { width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E5E5', position: 'relative' },
    filterButtonActive: { backgroundColor: '#009BBF', borderColor: '#009BBF' },
    filterBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E74C3C' },
    filtersPanel: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#E5E5E5' },
    filtersPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    filtersPanelTitle: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#1A1A1A' },
    filterGroup: { marginBottom: 16 },
    filterLabel: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 8 },
    filterActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
    filterClearButton: { flex: 1, paddingVertical: 12, backgroundColor: '#F8F9FA', borderRadius: 12, alignItems: 'center' },
    filterClearButtonText: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#666666' },
    filterApplyButton: { flex: 1, paddingVertical: 12, backgroundColor: '#009BBF', borderRadius: 12, alignItems: 'center' },
    filterApplyButtonText: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#FFFFFF' },
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    resultsCount: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#666666' },
    clearFiltersButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    clearFiltersText: { fontSize: 12, fontFamily: 'Lato-Bold', color: '#009BBF' },
    listContent: { paddingBottom: 100 },
    historialCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
    cardHeader: { marginBottom: 12 },
    clientInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#009BBF20', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#009BBF' },
    clientDetails: { flex: 1 },
    clientName: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#1A1A1A' },
    clientAge: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#666666' },
    cardInfo: { marginBottom: 12, gap: 8 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoLabel: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#666666', width: 100 },
    infoValue: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#1A1A1A', flex: 1 },
    cardActions: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    actionButtonPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#EFF6FF', borderRadius: 12 },
    actionButtonPrimaryText: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#2563EB' },
    actionButtonIcon: { width: 44, height: 44, backgroundColor: '#F0FDF4', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionButtonIconRed: { width: 44, height: 44, backgroundColor: '#FEF2F2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
    emptyIconContainer: { width: 96, height: 96, backgroundColor: '#F8F9FA', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#E5E5E5', borderStyle: 'dashed' },
    emptyTitle: { fontSize: 18, fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
    emptySubtitle: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#666666', textAlign: 'center', lineHeight: 20 },
    modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
    modalHeader: { backgroundColor: '#009BBF', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
    modalHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 20, fontFamily: 'Lato-Bold', color: '#FFFFFF' },
    modalCloseButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center' },
    modalContent: { flex: 1, padding: 20 },
    modalSection: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    modalSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    modalSectionTitle: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#1A1A1A' },
    modalSectionContent: { gap: 12 },
    infoRowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    infoRowLabel: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#666666' },
    infoRowValue: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#1A1A1A', textAlign: 'right', flex: 1, marginLeft: 8 },
    graduacionContainer: { gap: 12 },
    graduacionCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#009BBF20' },
    graduacionTitle: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#009BBF', marginBottom: 8 },
    formContent: { flex: 1, padding: 20 },
    formGroup: { marginBottom: 20 },
    formGroupHalf: { flex: 1 },
    formLabel: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 8 },
    pickerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', paddingLeft: 12, overflow: 'hidden' },
    pickerIcon: { marginRight: 8 },
    picker: { flex: 1, height: 48, color: '#1A1A1A' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 12 },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, height: 48, fontSize: 16, fontFamily: 'Lato-Regular', color: '#1A1A1A' },
    inputSmall: { height: 48, paddingHorizontal: 12, fontSize: 16, fontFamily: 'Lato-Regular', color: '#1A1A1A', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5' },
    textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
    errorText: { fontSize: 12, fontFamily: 'Lato-Regular', color: '#E74C3C', marginTop: 4 },
    sectionTitle: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#009BBF', marginBottom: 12, marginTop: 8 },
    formRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    formActions: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#E5E5E5' },
    cancelButton: { flex: 1, height: 48, backgroundColor: '#F8F9FA', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    cancelButtonText: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#666666' },
    submitButton: { flex: 1, height: 48, backgroundColor: '#009BBF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    submitButtonText: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#FFFFFF' },
    deleteModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    deleteModalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center' },
    deleteModalIcon: { width: 80, height: 80, backgroundColor: '#FEF2F2', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    deleteModalTitle: { fontSize: 20, fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
    deleteModalMessage: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#666666', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    deleteModalActions: { flexDirection: 'row', gap: 12, width: '100%' },
    deleteModalCancelButton: { flex: 1, height: 48, backgroundColor: '#F8F9FA', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    deleteModalCancelText: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#666666' },
    deleteModalConfirmButton: { flex: 1, height: 48, backgroundColor: '#E74C3C', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    deleteModalConfirmText: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#FFFFFF' }
});

export default HistorialMedico;