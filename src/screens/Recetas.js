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

const initialFormState = {
    historialMedicoId: '',
    optometristaId: '',
    diagnostico: '',
    ojoDerecho: { esfera: '', cilindro: '', eje: '', adicion: '' },
    ojoIzquierdo: { esfera: '', cilindro: '', eje: '', adicion: '' },
    observaciones: '',
    vigencia: '12',
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

const RecetaCard = ({ receta, onView, onEdit, onDelete }) => {
    const cliente = receta.historialMedicoId?.clienteId;
    const clienteNombre = cliente ? `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() : 'N/A';
    const optometrista = receta.optometristaId?.empleadoId;
    const optometristaNombre = optometrista ? `Dr(a). ${optometrista.nombre || ''} ${optometrista.apellido || ''}`.trim() : 'N/A';

    return (
        <View style={styles.recetaCard}>
            <View style={styles.cardHeader}>
                <View style={styles.clientInfo}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="document-text" size={24} color="#009BBF" />
                    </View>
                    <View style={styles.clientDetails}>
                        <Text style={styles.diagnosticoText}>{receta.diagnostico}</Text>
                        <Text style={styles.clientName}>{clienteNombre}</Text>
                    </View>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: receta.isVigente ? '#49AA4C' : '#E74C3C' }]}>
                    <Ionicons name={receta.isVigente ? "checkmark-circle" : "close-circle"} size={12} color="#FFFFFF" />
                    <Text style={styles.estadoText}>{receta.isVigente ? 'Vigente' : 'Vencida'}</Text>
                </View>
            </View>

            <View style={styles.cardInfo}>
                <View style={styles.infoRow}>
                    <Ionicons name="medkit" size={16} color="#D0155F" />
                    <Text style={styles.infoLabel}>Optometrista:</Text>
                    <Text style={styles.infoValue}>{optometristaNombre}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={16} color="#49AA4C" />
                    <Text style={styles.infoLabel}>Fecha:</Text>
                    <Text style={styles.infoValue}>
                        {receta.fecha ? new Date(receta.fecha).toLocaleDateString('es-ES') : '-'}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="time" size={16} color="#F39C12" />
                    <Text style={styles.infoLabel}>Vigencia:</Text>
                    <Text style={styles.infoValue}>{receta.vigencia} meses</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => onView(receta)} style={styles.actionButtonPrimary}>
                    <Ionicons name="eye" size={16} color="#2563EB" />
                    <Text style={styles.actionButtonPrimaryText}>Ver detalles</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onEdit(receta)} style={styles.actionButtonIcon}>
                    <Ionicons name="create" size={16} color="#49AA4C" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(receta)} style={styles.actionButtonIconRed}>
                    <Ionicons name="trash" size={16} color="#E74C3C" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const DetailModal = ({ visible, onClose, receta }) => {
    if (!receta) return null;

    const cliente = receta.historialMedicoId?.clienteId;
    const clienteNombre = cliente ? `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() : 'N/A';
    const optometrista = receta.optometristaId?.empleadoId;
    const optometristaNombre = optometrista ? `Dr(a). ${optometrista.nombre || ''} ${optometrista.apellido || ''}`.trim() : 'N/A';

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderContent}>
                        <Text style={styles.modalTitle}>Detalle de Receta</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.modalEstadoBadge, { backgroundColor: receta.isVigente ? '#49AA4C' : '#E74C3C' }]}>
                        <Ionicons name={receta.isVigente ? "checkmark-circle" : "close-circle"} size={16} color="#FFFFFF" />
                        <Text style={styles.modalEstadoText}>{receta.isVigente ? 'Vigente' : 'Vencida'}</Text>
                    </View>
                </View>

                <ScrollView style={styles.modalContent}>
                    <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                            <Ionicons name="person" size={20} color="#009BBF" />
                            <Text style={styles.modalSectionTitle}>Información del Paciente</Text>
                        </View>
                        <View style={styles.modalSectionContent}>
                            <InfoRow label="Cliente" value={clienteNombre} />
                            <InfoRow label="Optometrista" value={optometristaNombre} />
                            <InfoRow label="Diagnóstico" value={receta.diagnostico} />
                        </View>
                    </View>

                    <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                            <Ionicons name="calendar" size={20} color="#009BBF" />
                            <Text style={styles.modalSectionTitle}>Información de la Receta</Text>
                        </View>
                        <View style={styles.modalSectionContent}>
                            <InfoRow
                                label="Fecha"
                                value={receta.fecha ? new Date(receta.fecha).toLocaleDateString('es-ES') : '-'}
                            />
                            <InfoRow label="Vigencia" value={`${receta.vigencia} meses`} />
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
                                <InfoRow label="Esfera" value={receta.ojoDerecho?.esfera || '-'} />
                                <InfoRow label="Cilindro" value={receta.ojoDerecho?.cilindro || '-'} />
                                <InfoRow label="Eje" value={receta.ojoDerecho?.eje || '-'} />
                                <InfoRow label="Adición" value={receta.ojoDerecho?.adicion || '-'} />
                            </View>
                            <View style={styles.graduacionCard}>
                                <Text style={styles.graduacionTitle}>Ojo Izquierdo (OI)</Text>
                                <InfoRow label="Esfera" value={receta.ojoIzquierdo?.esfera || '-'} />
                                <InfoRow label="Cilindro" value={receta.ojoIzquierdo?.cilindro || '-'} />
                                <InfoRow label="Eje" value={receta.ojoIzquierdo?.eje || '-'} />
                                <InfoRow label="Adición" value={receta.ojoIzquierdo?.adicion || '-'} />
                            </View>
                        </View>
                    </View>

                    {receta.observaciones && (
                        <View style={styles.modalSection}>
                            <View style={styles.modalSectionHeader}>
                                <Ionicons name="document-text" size={20} color="#009BBF" />
                                <Text style={styles.modalSectionTitle}>Observaciones</Text>
                            </View>
                            <Text style={styles.notasText}>{receta.observaciones}</Text>
                        </View>
                    )}
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

const FormModal = ({ visible, onClose, title, onSubmit, formData, setFormData, errors, historialesMedicos, optometristas }) => {
    const handleInputChange = (field, value, isNested = false, parent = null) => {
        if (isNested && parent) {
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [field]: value
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
                    {/* Información del Paciente */}
                    <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Información del Paciente</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Cliente (del Historial) *</Text>
                            <View style={styles.pickerContainer}>
                                <Ionicons name="person" size={20} color="#666666" style={styles.pickerIcon} />
                                <Picker
                                    selectedValue={formData.historialMedicoId}
                                    onValueChange={(value) => handleInputChange('historialMedicoId', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Seleccione un cliente" value="" />
                                    {historialesMedicos.map(historial => {
                                        const cliente = historial.clienteId;
                                        const label = cliente
                                            ? `${cliente.nombre} ${cliente.apellido}`
                                            : `Historial ${historial._id}`;
                                        return (
                                            <Picker.Item
                                                key={historial._id}
                                                label={label}
                                                value={historial._id}
                                            />
                                        );
                                    })}
                                </Picker>
                            </View>
                            {errors.historialMedicoId && <Text style={styles.errorText}>{errors.historialMedicoId}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Optometrista a cargo *</Text>
                            <View style={styles.pickerContainer}>
                                <Ionicons name="medkit" size={20} color="#666666" style={styles.pickerIcon} />
                                <Picker
                                    selectedValue={formData.optometristaId}
                                    onValueChange={(value) => handleInputChange('optometristaId', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Seleccione un optometrista" value="" />
                                    {optometristas.map(opto => (
                                        <Picker.Item
                                            key={opto._id}
                                            label={opto.empleadoId ? `Dr(a). ${opto.empleadoId.nombre} ${opto.empleadoId.apellido}` : 'Optometrista'}
                                            value={opto._id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            {errors.optometristaId && <Text style={styles.errorText}>{errors.optometristaId}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Diagnóstico Principal *</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="medical" size={20} color="#666666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.diagnostico}
                                    onChangeText={(text) => handleInputChange('diagnostico', text)}
                                    placeholder="Ej. Miopía y Astigmatismo"
                                    placeholderTextColor="#999999"
                                />
                            </View>
                            {errors.diagnostico && <Text style={styles.errorText}>{errors.diagnostico}</Text>}
                        </View>
                    </View>

                    {/* Graduación Ojo Derecho */}
                    <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Graduación Ojo Derecho (OD)</Text>
                        <View style={styles.formRow}>
                            <View style={styles.formGroupHalf}>
                                <Text style={styles.formLabel}>Esfera *</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    value={formData.ojoDerecho.esfera}
                                    onChangeText={(text) => handleInputChange('esfera', text, true, 'ojoDerecho')}
                                    placeholder="-1.25"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999999"
                                />
                                {errors['ojoDerecho.esfera'] && <Text style={styles.errorTextSmall}>{errors['ojoDerecho.esfera']}</Text>}
                            </View>
                            <View style={styles.formGroupHalf}>
                                <Text style={styles.formLabel}>Cilindro *</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    value={formData.ojoDerecho.cilindro}
                                    onChangeText={(text) => handleInputChange('cilindro', text, true, 'ojoDerecho')}
                                    placeholder="-0.75"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999999"
                                />
                                {errors['ojoDerecho.cilindro'] && <Text style={styles.errorTextSmall}>{errors['ojoDerecho.cilindro']}</Text>}
                            </View>
                        </View>
                        <View style={styles.formRow}>
                            <View style={styles.formGroupHalf}>
                                <Text style={styles.formLabel}>Eje *</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    value={formData.ojoDerecho.eje}
                                    onChangeText={(text) => handleInputChange('eje', text, true, 'ojoDerecho')}
                                    placeholder="180"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999999"
                                />
                                {errors['ojoDerecho.eje'] && <Text style={styles.errorTextSmall}>{errors['ojoDerecho.eje']}</Text>}
                            </View>
                            <View style={styles.formGroupHalf}>
                                <Text style={styles.formLabel}>Adición</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    value={formData.ojoDerecho.adicion}
                                    onChangeText={(text) => handleInputChange('adicion', text, true, 'ojoDerecho')}
                                    placeholder="+2.00"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999999"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Graduación Ojo Izquierdo */}
                    <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Graduación Ojo Izquierdo (OI)</Text>
                        <View style={styles.formRow}>
                            <View style={styles.formGroupHalf}>
                                <Text style={styles.formLabel}>Esfera *</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    value={formData.ojoIzquierdo.esfera}
                                    onChangeText={(text) => handleInputChange('esfera', text, true, 'ojoIzquierdo')}
                                    placeholder="-1.50"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999999"
                                />
                                {errors['ojoIzquierdo.esfera'] && <Text style={styles.errorTextSmall}>{errors['ojoIzquierdo.esfera']}</Text>}
                            </View>
                            <View style={styles.formGroupHalf}>
                                <Text style={styles.formLabel}>Cilindro *</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    value={formData.ojoIzquierdo.cilindro}
                                    onChangeText={(text) => handleInputChange('cilindro', text, true, 'ojoIzquierdo')}
                                    placeholder="-0.50"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999999"
                                />
                                {errors['ojoIzquierdo.cilindro'] && <Text style={styles.errorTextSmall}>{errors['ojoIzquierdo.cilindro']}</Text>}
                            </View>
                        </View>
                        <View style={styles.formRow}>
                            <View style={styles.formGroupHalf}>
                                <Text style={styles.formLabel}>Eje *</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    value={formData.ojoIzquierdo.eje}
                                    onChangeText={(text) => handleInputChange('eje', text, true, 'ojoIzquierdo')}
                                    placeholder="175"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999999"
                                />
                                {errors['ojoIzquierdo.eje'] && <Text style={styles.errorTextSmall}>{errors['ojoIzquierdo.eje']}</Text>}
                            </View>
                            <View style={styles.formGroupHalf}>
                                <Text style={styles.formLabel}>Adición</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    value={formData.ojoIzquierdo.adicion}
                                    onChangeText={(text) => handleInputChange('adicion', text, true, 'ojoIzquierdo')}
                                    placeholder="+2.00"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999999"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Detalles Adicionales */}
                    <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Detalles Adicionales</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Observaciones Adicionales</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="document-text" size={20} color="#666666" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.observaciones}
                                    onChangeText={(text) => handleInputChange('observaciones', text)}
                                    placeholder="Ej. Tratamiento antireflejante recomendado..."
                                    placeholderTextColor="#999999"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Vigencia (meses) *</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="time" size={20} color="#666666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.vigencia.toString()}
                                    onChangeText={(text) => handleInputChange('vigencia', text)}
                                    placeholder="12"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999999"
                                />
                            </View>
                            <Text style={styles.hintText}>Vigencia recomendada: 12-24 meses</Text>
                            {errors.vigencia && <Text style={styles.errorText}>{errors.vigencia}</Text>}
                        </View>
                    </View>

                    {/* Información útil */}
                    <View style={styles.infoBox}>
                        <View style={styles.infoBoxHeader}>
                            <Ionicons name="information-circle" size={20} color="#2563EB" />
                            <Text style={styles.infoBoxTitle}>Información sobre graduación</Text>
                        </View>
                        <Text style={styles.infoBoxText}>• Valores negativos (-) indican miopía</Text>
                        <Text style={styles.infoBoxText}>• Valores positivos (+) indican hipermetropía</Text>
                        <Text style={styles.infoBoxText}>• El eje se mide de 0° a 180°</Text>
                        <Text style={styles.infoBoxText}>• La adición se usa para lentes progresivos</Text>
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

const DeleteModal = ({ visible, onClose, onConfirm, receta }) => {
    if (!receta) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.deleteModalOverlay}>
                <View style={styles.deleteModalContent}>
                    <View style={styles.deleteModalIcon}>
                        <Ionicons name="warning" size={48} color="#E74C3C" />
                    </View>
                    <Text style={styles.deleteModalTitle}>¿Eliminar receta?</Text>
                    <Text style={styles.deleteModalMessage}>
                        ¿Estás seguro de que deseas eliminar la receta con diagnóstico "{receta.diagnostico}"? Esta acción no se puede deshacer.
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
        <Text style={styles.emptyTitle}>No hay recetas registradas</Text>
        <Text style={styles.emptySubtitle}>Las recetas aparecerán aquí cuando sean creadas</Text>
    </View>
);



const Recetas = () => {
    const navigation = useNavigation();
    const [recetas, setRecetas] = useState([]);
    const [historialesMedicos, setHistorialesMedicos] = useState([]);
    const [optometristas, setOptometristas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedReceta, setSelectedReceta] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [filters, setFilters] = useState({
        estadoReceta: 'todos',
        optometristaId: 'todos',
        fechaDesde: '',
        fechaHasta: ''
    });

    const handleGoBack = () => {
        navigation.goBack();
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [recetasRes, historialesRes, optosRes] = await Promise.all([
                axios.get(`${API_URL}/recetas`),
                axios.get(`${API_URL}/historialMedico`),
                axios.get(`${API_URL}/optometrista`)
            ]);

            const formattedRecetas = (Array.isArray(recetasRes.data) ? recetasRes.data : []).map(r => ({
                ...r,
                fechaRaw: new Date(r.fecha),
                isVigente: new Date(new Date(r.fecha).setMonth(new Date(r.fecha).getMonth() + r.vigencia)) > new Date()
            }));

            setRecetas(formattedRecetas);
            setHistorialesMedicos(historialesRes.data || []);
            setOptometristas(optosRes.data || []);
        } catch (error) {
            console.error('Error al cargar recetas:', error);
            Alert.alert('Error', 'No se pudieron cargar las recetas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredRecetas = useMemo(() => {
        return recetas.filter(receta => {
            const search = searchTerm.toLowerCase();
            const clienteNombre = receta.historialMedicoId?.clienteId?.nombre?.toLowerCase() || '';
            const clienteApellido = receta.historialMedicoId?.clienteId?.apellido?.toLowerCase() || '';
            const optometristaNombre = receta.optometristaId?.empleadoId?.nombre?.toLowerCase() || '';
            const optometristaApellido = receta.optometristaId?.empleadoId?.apellido?.toLowerCase() || '';

            const matchesSearch = !searchTerm ||
                receta.diagnostico.toLowerCase().includes(search) ||
                `${clienteNombre} ${clienteApellido}`.includes(search) ||
                `${optometristaNombre} ${optometristaApellido}`.includes(search);

            let matchesEstado = true;
            if (filters.estadoReceta !== 'todos') {
                const estado = filters.estadoReceta === 'vigente';
                matchesEstado = receta.isVigente === estado;
            }

            let matchesOptometrista = true;
            if (filters.optometristaId !== 'todos') {
                matchesOptometrista = receta.optometristaId?._id === filters.optometristaId;
            }

            let matchesFechaDesde = true;
            if (filters.fechaDesde) {
                const fechaDesde = new Date(filters.fechaDesde);
                matchesFechaDesde = receta.fechaRaw >= fechaDesde;
            }

            let matchesFechaHasta = true;
            if (filters.fechaHasta) {
                const fechaHasta = new Date(filters.fechaHasta);
                fechaHasta.setHours(23, 59, 59);
                matchesFechaHasta = receta.fechaRaw <= fechaHasta;
            }

            return matchesSearch && matchesEstado && matchesOptometrista && matchesFechaDesde && matchesFechaHasta;
        });
    }, [recetas, searchTerm, filters]);

    const stats = useMemo(() => {
        const vigentes = recetas.filter(r => r.isVigente).length;
        return {
            total: recetas.length,
            vigentes: vigentes,
            vencidas: recetas.length - vigentes
        };
    }, [recetas]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleOpenAddModal = () => {
        setFormData(initialFormState);
        setErrors({});
        setSelectedReceta(null);
        setShowAddModal(true);
    };

    const handleOpenEditModal = (receta) => {
        setFormData({
            historialMedicoId: receta.historialMedicoId?._id || receta.historialMedicoId || '',
            optometristaId: receta.optometristaId?._id || receta.optometristaId || '',
            diagnostico: receta.diagnostico || '',
            ojoDerecho: {
                esfera: receta.ojoDerecho?.esfera?.toString() || '',
                cilindro: receta.ojoDerecho?.cilindro?.toString() || '',
                eje: receta.ojoDerecho?.eje?.toString() || '',
                adicion: receta.ojoDerecho?.adicion?.toString() || ''
            },
            ojoIzquierdo: {
                esfera: receta.ojoIzquierdo?.esfera?.toString() || '',
                cilindro: receta.ojoIzquierdo?.cilindro?.toString() || '',
                eje: receta.ojoIzquierdo?.eje?.toString() || '',
                adicion: receta.ojoIzquierdo?.adicion?.toString() || ''
            },
            observaciones: receta.observaciones || '',
            vigencia: receta.vigencia?.toString() || '12'
        });
        setSelectedReceta(receta);
        setErrors({});
        setShowDetail(false);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (receta) => {
        setSelectedReceta(receta);
        setShowDetail(false);
        setShowDeleteModal(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.historialMedicoId) newErrors.historialMedicoId = 'Debe seleccionar un cliente';
        if (!formData.optometristaId) newErrors.optometristaId = 'Debe seleccionar un optometrista';
        if (!formData.diagnostico.trim()) newErrors.diagnostico = 'El diagnóstico es requerido';
        if (!formData.vigencia || parseInt(formData.vigencia) <= 0) newErrors.vigencia = 'La vigencia debe ser mayor a 0';

        const requiredEyeFields = ['esfera', 'cilindro', 'eje'];
        requiredEyeFields.forEach(field => {
            if (!formData.ojoDerecho[field] || formData.ojoDerecho[field] === '') {
                newErrors[`ojoDerecho.${field}`] = 'Requerido';
            }
            if (!formData.ojoIzquierdo[field] || formData.ojoIzquierdo[field] === '') {
                newErrors[`ojoIzquierdo.${field}`] = 'Requerido';
            }
        });

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
                vigencia: parseInt(formData.vigencia),
                ojoDerecho: {
                    esfera: parseFloat(formData.ojoDerecho.esfera) || null,
                    cilindro: parseFloat(formData.ojoDerecho.cilindro) || null,
                    eje: parseInt(formData.ojoDerecho.eje) || null,
                    adicion: formData.ojoDerecho.adicion ? parseFloat(formData.ojoDerecho.adicion) : null
                },
                ojoIzquierdo: {
                    esfera: parseFloat(formData.ojoIzquierdo.esfera) || null,
                    cilindro: parseFloat(formData.ojoIzquierdo.cilindro) || null,
                    eje: parseInt(formData.ojoIzquierdo.eje) || null,
                    adicion: formData.ojoIzquierdo.adicion ? parseFloat(formData.ojoIzquierdo.adicion) : null
                }
            };

            if (selectedReceta) {
                await axios.put(`${API_URL}/recetas/${selectedReceta._id}`, dataToSend);
                Alert.alert('Éxito', 'Receta actualizada correctamente');
            } else {
                await axios.post(`${API_URL}/recetas`, dataToSend);
                Alert.alert('Éxito', 'Receta creada correctamente');
            }
            await fetchData();
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedReceta(null);
            setFormData(initialFormState);
        } catch (error) {
            console.error('Error al guardar receta:', error);
            Alert.alert('Error', 'No se pudo guardar la receta');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedReceta) return;
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/recetas/${selectedReceta._id}`);
            Alert.alert('Éxito', 'Receta eliminada correctamente');
            await fetchData();
            setShowDeleteModal(false);
            setSelectedReceta(null);
        } catch (error) {
            console.error('Error al eliminar receta:', error);
            Alert.alert('Error', 'No se pudo eliminar la receta');
        } finally {
            setLoading(false);
        }
    };

    const clearAllFilters = () => {
        setFilters({
            estadoReceta: 'todos',
            optometristaId: 'todos',
            fechaDesde: '',
            fechaHasta: ''
        });
        setSearchTerm('');
    };

    const hasActiveFilters = () => {
        return searchTerm ||
            filters.estadoReceta !== 'todos' ||
            filters.optometristaId !== 'todos' ||
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
                        placeholder="Buscar por diagnóstico, cliente..."
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
                            <Text style={styles.filterLabel}>Estado de Receta</Text>
                            <View style={styles.pickerContainer}>
                                <Ionicons name="flag" size={20} color="#666666" style={styles.pickerIcon} />
                                <Picker
                                    selectedValue={filters.estadoReceta}
                                    onValueChange={(value) => setFilters({ ...filters, estadoReceta: value })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Todas" value="todos" />
                                    <Picker.Item label="Vigente" value="vigente" />
                                    <Picker.Item label="Vencida" value="vencida" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Optometrista</Text>
                            <View style={styles.pickerContainer}>
                                <Ionicons name="medkit" size={20} color="#666666" style={styles.pickerIcon} />
                                <Picker
                                    selectedValue={filters.optometristaId}
                                    onValueChange={(value) => setFilters({ ...filters, optometristaId: value })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Todos" value="todos" />
                                    {optometristas.map(op => (
                                        <Picker.Item
                                            key={op._id}
                                            label={op.empleadoId ? `${op.empleadoId.nombre} ${op.empleadoId.apellido}` : 'Optometrista'}
                                            value={op._id}
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
                        {filteredRecetas.length} receta{filteredRecetas.length !== 1 ? 's' : ''} encontrada{filteredRecetas.length !== 1 ? 's' : ''}
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

    if (loading && recetas.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#009BBF" />
                <Text style={styles.loadingText}>Cargando recetas...</Text>
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
                        <Text style={styles.headerTitle}>Gestión de Recetas</Text>
                        <Text style={styles.headerSubtitle}>Administra las recetas</Text>
                    </View>

                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer} contentContainerStyle={styles.statsContent}>
                    <StatsCard label="Total" value={stats.total} iconName="document-text" color="#009BBF" />
                    <StatsCard label="Vigentes" value={stats.vigentes} iconName="checkmark-circle" color="#49AA4C" />
                    <StatsCard label="Vencidas" value={stats.vencidas} iconName="time" color="#E74C3C" />
                </ScrollView>
            </View>

            <FlatList
                data={filteredRecetas}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <RecetaCard
                        receta={item}
                        onView={(r) => { setSelectedReceta(r); setShowDetail(true); }}
                        onEdit={(r) => handleOpenEditModal(r)}
                        onDelete={(r) => handleOpenDeleteModal(r)}
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
                onClose={() => { setShowDetail(false); setSelectedReceta(null); }}
                receta={selectedReceta}
            />
            <FormModal
                visible={showAddModal || showEditModal}
                onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedReceta(null); setFormData(initialFormState); }}
                title={selectedReceta ? 'Editar Receta' : 'Nueva Receta'}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                historialesMedicos={historialesMedicos}
                optometristas={optometristas}
            />
            <DeleteModal
                visible={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setSelectedReceta(null); }}
                onConfirm={handleDelete}
                receta={selectedReceta}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    loadingText: { marginTop: 12, fontSize: 16, fontFamily: 'Lato-Regular', color: '#666666' },
    header: { backgroundColor: '#009BBF', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerContent: { flexDirection: 4, justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    headerTitle: { fontSize: 24, fontFamily: 'Lato-Bold', color: '#FFFFFF', marginBottom: 4, marginRight: 18, marginLeft: 5 },
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
    recetaCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    clientInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#009BBF20', alignItems: 'center', justifyContent: 'center' },
    clientDetails: { flex: 1 },
    diagnosticoText: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 2 },
    clientName: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#666666' },
    estadoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
    estadoText: { fontSize: 11, fontFamily: 'Lato-Bold', color: '#FFFFFF', textTransform: 'uppercase' },
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
    modalHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontFamily: 'Lato-Bold', color: '#FFFFFF' },
    modalCloseButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center' },
    modalEstadoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8, alignSelf: 'flex-start' },
    modalEstadoText: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#FFFFFF', textTransform: 'uppercase' },
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
    notasText: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#1A1A1A', lineHeight: 20, marginTop: 8 },
    formContent: { flex: 1, padding: 20 },
    formSection: { marginBottom: 24 },
    formSectionTitle: { fontSize: 18, fontFamily: 'Lato-Bold', color: '#009BBF', marginBottom: 16 },
    formGroup: { marginBottom: 16 },
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
    errorTextSmall: { fontSize: 11, fontFamily: 'Lato-Regular', color: '#E74C3C', marginTop: 2 },
    hintText: { fontSize: 12, fontFamily: 'Lato-Regular', color: '#666666', marginTop: 4 },
    formRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    infoBox: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2563EB20', marginBottom: 16 },
    infoBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    infoBoxTitle: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#2563EB' },
    infoBoxText: { fontSize: 12, fontFamily: 'Lato-Regular', color: '#1E40AF', marginBottom: 4 },
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

export default Recetas;