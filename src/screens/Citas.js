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
import axios from 'axios';

const API_URL = 'https://aurora-production-7e57.up.railway.app/api';

const ESTADO_CONFIG = {
    'Agendada': { color: '#A4D5DD', icon: 'bookmark' },
    'Pendiente': { color: '#E74C3C', icon: 'hourglass' },
    'Confirmada': { color: '#F39C12', icon: 'checkmark' },
    'Completada': { color: '#49AA4C', icon: 'checkmark-circle' },
    'Cancelada': { color: '#8E44AD', icon: 'close-circle' },
    'Programada': { color: '#009BBF', icon: 'calendar' }
};

const FILTER_OPTIONS = [
    { value: 'fecha-desc', label: 'Más Recientes', icon: 'calendar' },
    { value: 'fecha-asc', label: 'Más Antiguos', icon: 'calendar' },
    { value: 'hora-asc', label: 'Hora: Temprano', icon: 'time' },
    { value: 'hora-desc', label: 'Hora: Tarde', icon: 'time' }
];

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

const CitaCard = ({ cita, onView, onEdit, onDelete }) => {
    const estadoInfo = ESTADO_CONFIG[cita.estado] || ESTADO_CONFIG['Pendiente'];
    const clienteNombre = cita.clienteId
        ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.trim()
        : 'N/A';
    const optometristaNombre = cita.optometristaId?.empleadoId
        ? `Dr(a). ${cita.optometristaId.empleadoId.nombre || ''} ${cita.optometristaId.empleadoId.apellido || ''}`.trim()
        : 'N/A';

    return (
        <View style={styles.citaCard}>
            <View style={styles.citaHeader}>
                <View style={styles.citaClientInfo}>
                    <View style={styles.citaClientRow}>
                        <Ionicons name="person" size={16} color="#666666" />
                        <Text style={styles.citaClientName}>{clienteNombre}</Text>
                    </View>
                    <Text style={styles.citaMotivo}>{cita.motivoCita || 'Consulta general'}</Text>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.color }]}>
                    <Ionicons name={estadoInfo.icon} size={12} color="#FFFFFF" />
                    <Text style={styles.estadoText}>{cita.estado}</Text>
                </View>
            </View>

            <View style={styles.citaInfo}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={16} color="#009BBF" />
                    <Text style={styles.infoText}>
                        {cita.fecha ? new Date(cita.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}
                    </Text>
                    <Ionicons name="time" size={16} color="#009BBF" style={styles.infoIconSpacing} />
                    <Text style={styles.infoText}>{cita.hora || 'Sin hora'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color="#49AA4C" />
                    <Text style={styles.infoText}>{cita.sucursalId?.nombre || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="medkit" size={16} color="#D0155F" />
                    <Text style={styles.infoText}>{optometristaNombre}</Text>
                </View>
            </View>

            <View style={styles.citaActions}>
                <TouchableOpacity onPress={() => onView(cita)} style={styles.actionButtonPrimary}>
                    <Ionicons name="eye" size={16} color="#2563EB" />
                    <Text style={styles.actionButtonPrimaryText}>Ver más</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onEdit(cita)} style={styles.actionButtonIcon}>
                    <Ionicons name="create" size={16} color="#49AA4C" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(cita)} style={styles.actionButtonIconRed}>
                    <Ionicons name="trash" size={16} color="#E74C3C" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const DetailModal = ({ visible, onClose, cita }) => {
    if (!cita) return null;
    const estadoInfo = ESTADO_CONFIG[cita.estado] || ESTADO_CONFIG['Pendiente'];

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderContent}>
                        <Text style={styles.modalTitle}>Detalle de Cita</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.modalEstadoBadge, { backgroundColor: estadoInfo.color }]}>
                        <Ionicons name={estadoInfo.icon} size={16} color="#FFFFFF" />
                        <Text style={styles.modalEstadoText}>{cita.estado}</Text>
                    </View>
                </View>

                <ScrollView style={styles.modalContent}>
                    <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                            <Ionicons name="person" size={20} color="#009BBF" />
                            <Text style={styles.modalSectionTitle}>Información del Paciente</Text>
                        </View>
                        <View style={styles.modalSectionContent}>
                            <InfoRow label="Cliente" value={cita.clienteId ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.trim() : 'N/A'} />
                            <InfoRow label="Optometrista" value={cita.optometristaId?.empleadoId ? `Dr(a). ${cita.optometristaId.empleadoId.nombre || ''} ${cita.optometristaId.empleadoId.apellido || ''}`.trim() : 'N/A'} />
                            <InfoRow label="Sucursal" value={cita.sucursalId?.nombre || 'N/A'} />
                        </View>
                    </View>

                    <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                            <Ionicons name="calendar" size={20} color="#009BBF" />
                            <Text style={styles.modalSectionTitle}>Información de la Cita</Text>
                        </View>
                        <View style={styles.modalSectionContent}>
                            <InfoRow label="Fecha" value={cita.fecha ? new Date(cita.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
                            <InfoRow label="Hora" value={cita.hora || 'N/A'} />
                            <InfoRow label="Motivo" value={cita.motivoCita || 'N/A'} />
                            <InfoRow label="Tipo de lente" value={cita.tipoLente || 'N/A'} />
                            <InfoRow label="Graduación" value={cita.graduacion || 'N/A'} />
                        </View>
                    </View>

                    {cita.notasAdicionales && (
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Notas Adicionales</Text>
                            <Text style={styles.notasText}>{cita.notasAdicionales}</Text>
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

const FormModal = ({ visible, onClose, title, onSubmit, formData, setFormData, errors, clientes, optometristas, sucursales }) => {
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
                                onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
                                style={styles.picker}
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
                        <Text style={styles.formLabel}>Optometrista *</Text>
                        <View style={styles.pickerContainer}>
                            <Ionicons name="medkit" size={20} color="#666666" style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.optometristaId}
                                onValueChange={(value) => setFormData({ ...formData, optometristaId: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Seleccione optometrista" value="" />
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
                        <Text style={styles.formLabel}>Sucursal *</Text>
                        <View style={styles.pickerContainer}>
                            <Ionicons name="location" size={20} color="#666666" style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.sucursalId}
                                onValueChange={(value) => setFormData({ ...formData, sucursalId: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Seleccione sucursal" value="" />
                                {sucursales.map(sucursal => (
                                    <Picker.Item 
                                        key={sucursal._id} 
                                        label={sucursal.nombre} 
                                        value={sucursal._id} 
                                    />
                                ))}
                            </Picker>
                        </View>
                        {errors.sucursalId && <Text style={styles.errorText}>{errors.sucursalId}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Fecha *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                value={formData.fecha} 
                                onChangeText={(text) => setFormData({ ...formData, fecha: text })} 
                                placeholder="YYYY-MM-DD" 
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        {errors.fecha && <Text style={styles.errorText}>{errors.fecha}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Hora *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="time" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                value={formData.hora} 
                                onChangeText={(text) => setFormData({ ...formData, hora: text })} 
                                placeholder="HH:MM" 
                                placeholderTextColor="#999999" 
                            />
                        </View>
                        {errors.hora && <Text style={styles.errorText}>{errors.hora}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Estado *</Text>
                        <View style={styles.pickerContainer}>
                            <Ionicons name="flag" size={20} color="#666666" style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.estado}
                                onValueChange={(value) => setFormData({ ...formData, estado: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Agendada" value="Agendada" />
                                <Picker.Item label="Pendiente" value="Pendiente" />
                                <Picker.Item label="Confirmada" value="Confirmada" />
                                <Picker.Item label="Completada" value="Completada" />
                                <Picker.Item label="Cancelada" value="Cancelada" />
                                <Picker.Item label="Programada" value="Programada" />
                            </Picker>
                        </View>
                        {errors.estado && <Text style={styles.errorText}>{errors.estado}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Motivo de la cita</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                value={formData.motivoCita} 
                                onChangeText={(text) => setFormData({ ...formData, motivoCita: text })} 
                                placeholder="Motivo de la consulta" 
                                placeholderTextColor="#999999" 
                                multiline 
                                numberOfLines={3} 
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Tipo de lente</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="glasses" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                value={formData.tipoLente} 
                                onChangeText={(text) => setFormData({ ...formData, tipoLente: text })} 
                                placeholder="Tipo de lente" 
                                placeholderTextColor="#999999" 
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Graduación</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="eye" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                value={formData.graduacion} 
                                onChangeText={(text) => setFormData({ ...formData, graduacion: text })} 
                                placeholder="Graduación" 
                                placeholderTextColor="#999999" 
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Notas adicionales</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="create" size={20} color="#666666" style={styles.inputIcon} />
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                value={formData.notasAdicionales} 
                                onChangeText={(text) => setFormData({ ...formData, notasAdicionales: text })} 
                                placeholder="Notas adicionales" 
                                placeholderTextColor="#999999" 
                                multiline 
                                numberOfLines={3} 
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

const DeleteModal = ({ visible, onClose, onConfirm, cita }) => {
    if (!cita) return null;
    const clienteNombre = cita.clienteId ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.trim() : 'este paciente';

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.deleteModalOverlay}>
                <View style={styles.deleteModalContent}>
                    <View style={styles.deleteModalIcon}>
                        <Ionicons name="warning" size={48} color="#E74C3C" />
                    </View>
                    <Text style={styles.deleteModalTitle}>¿Eliminar cita?</Text>
                    <Text style={styles.deleteModalMessage}>
                        ¿Estás seguro de que deseas eliminar la cita de {clienteNombre}? Esta acción no se puede deshacer.
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
            <Ionicons name="calendar-outline" size={48} color="#CCCCCC" />
        </View>
        <Text style={styles.emptyTitle}>No hay citas programadas</Text>
        <Text style={styles.emptySubtitle}>Las citas aparecerán aquí cuando sean programadas</Text>
    </View>
);

const Citas = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [sortBy, setSortBy] = useState('fecha-desc');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCita, setSelectedCita] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({
        clienteId: '', optometristaId: '', sucursalId: '', fecha: '', hora: '', estado: 'Programada',
        motivoCita: '', tipoLente: '', graduacion: '', notasAdicionales: ''
    });
    const [clientes, setClientes] = useState([]);
    const [optometristas, setOptometristas] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [errors, setErrors] = useState({});
    const [filters, setFilters] = useState({
        estado: 'todos',
        sucursal: 'todos',
        optometrista: 'todos'
    });

    const fetchCitas = useCallback(async () => {
        try {
            setLoading(true);
            const [citasRes, clientesRes, optosRes, sucursalesRes] = await Promise.all([
                axios.get(`${API_URL}/citas`),
                axios.get(`${API_URL}/clientes`),
                axios.get(`${API_URL}/optometrista`),
                axios.get(`${API_URL}/sucursales`)
            ]);
            setCitas(citasRes.data || []);
            setClientes(clientesRes.data || []);
            setOptometristas(optosRes.data || []);
            setSucursales(sucursalesRes.data || []);
        } catch (error) {
            console.error('Error al cargar citas:', error);
            Alert.alert('Error', 'No se pudieron cargar las citas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCitas();
    }, [fetchCitas]);

    const filteredCitas = useMemo(() => {
        let filtered = citas.filter(cita => {
            const searchLower = searchTerm.toLowerCase();
            const clienteStr = cita.clienteId ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.toLowerCase() : '';
            const motivoStr = (cita.motivoCita || '').toLowerCase();
            const matchesSearch = !searchTerm || clienteStr.includes(searchLower) || motivoStr.includes(searchLower);
            
            let matchesDate = true;
            if (selectedDate && cita.fecha) {
                const citaDate = new Date(cita.fecha).toISOString().split('T')[0];
                matchesDate = citaDate === selectedDate;
            }

            let matchesEstado = true;
            if (filters.estado !== 'todos') {
                matchesEstado = cita.estado?.toLowerCase() === filters.estado.toLowerCase();
            }

            let matchesSucursal = true;
            if (filters.sucursal !== 'todos') {
                const sucursalId = cita.sucursalId?._id || cita.sucursalId;
                matchesSucursal = sucursalId === filters.sucursal;
            }

            let matchesOptometrista = true;
            if (filters.optometrista !== 'todos') {
                const optometristaId = cita.optometristaId?._id || cita.optometristaId;
                matchesOptometrista = optometristaId === filters.optometrista;
            }

            return matchesSearch && matchesDate && matchesEstado && matchesSucursal && matchesOptometrista;
        });

        const [field, order] = sortBy.split('-');
        filtered.sort((a, b) => {
            let valueA, valueB;
            if (field === 'fecha') {
                valueA = a.fecha ? new Date(a.fecha) : new Date(0);
                valueB = b.fecha ? new Date(b.fecha) : new Date(0);
            } else if (field === 'hora') {
                valueA = a.hora || '';
                valueB = b.hora || '';
            }
            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [citas, searchTerm, selectedDate, sortBy, filters]);

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return {
            total: citas.length,
            hoy: citas.filter(c => c.fecha?.startsWith(today)).length,
            pendientes: citas.filter(c => ['Pendiente', 'Programada'].includes(c.estado)).length,
            confirmadas: citas.filter(c => ['Confirmada', 'Completada'].includes(c.estado)).length
        };
    }, [citas]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchCitas();
    };

    const changeDay = (direction) => {
        const baseDate = selectedDate ? new Date(selectedDate) : new Date();
        baseDate.setDate(baseDate.getDate() + direction);
        setSelectedDate(baseDate.toISOString().split('T')[0]);
    };

    const handleOpenAddModal = () => {
        setFormData({ clienteId: '', optometristaId: '', sucursalId: '', fecha: '', hora: '', estado: 'Programada', motivoCita: '', tipoLente: '', graduacion: '', notasAdicionales: '' });
        setErrors({});
        setShowAddModal(true);
    };

    const handleOpenEditModal = (cita) => {
        setFormData({
            clienteId: cita.clienteId?._id || cita.clienteId || '',
            optometristaId: cita.optometristaId?._id || cita.optometristaId || '',
            sucursalId: cita.sucursalId?._id || cita.sucursalId || '',
            fecha: cita.fecha ? new Date(cita.fecha).toISOString().split('T')[0] : '',
            hora: cita.hora || '',
            estado: cita.estado || 'Programada',
            motivoCita: cita.motivoCita || '',
            tipoLente: cita.tipoLente || '',
            graduacion: cita.graduacion || '',
            notasAdicionales: cita.notasAdicionales || ''
        });
        setSelectedCita(cita);
        setErrors({});
        setShowDetail(false);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (cita) => {
        setSelectedCita(cita);
        setShowDetail(false);
        setShowDeleteModal(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.clienteId) newErrors.clienteId = 'Cliente requerido';
        if (!formData.optometristaId) newErrors.optometristaId = 'Optometrista requerido';
        if (!formData.sucursalId) newErrors.sucursalId = 'Sucursal requerida';
        if (!formData.fecha) newErrors.fecha = 'Fecha requerida';
        if (!formData.hora) newErrors.hora = 'Hora requerida';
        if (!formData.estado) newErrors.estado = 'Estado requerido';
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
            const dataToSend = { ...formData, fecha: new Date(formData.fecha) };
            if (selectedCita) {
                await axios.put(`${API_URL}/citas/${selectedCita._id}`, dataToSend);
                Alert.alert('Éxito', 'Cita actualizada correctamente');
            } else {
                await axios.post(`${API_URL}/citas`, dataToSend);
                Alert.alert('Éxito', 'Cita creada correctamente');
            }
            await fetchCitas();
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedCita(null);
        } catch (error) {
            console.error('Error al guardar cita:', error);
            Alert.alert('Error', 'No se pudo guardar la cita');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCita) return;
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/citas/${selectedCita._id}`);
            Alert.alert('Éxito', 'Cita eliminada correctamente');
            await fetchCitas();
            setShowDeleteModal(false);
            setSelectedCita(null);
        } catch (error) {
            console.error('Error al eliminar cita:', error);
            Alert.alert('Error', 'No se pudo eliminar la cita');
        } finally {
            setLoading(false);
        }
    };

    const clearAllFilters = () => {
        setFilters({
            estado: 'todos',
            sucursal: 'todos',
            optometrista: 'todos'
        });
        setSearchTerm('');
        setSelectedDate('');
    };

    const hasActiveFilters = () => {
        return searchTerm || 
               selectedDate ||
               filters.estado !== 'todos' || 
               filters.sucursal !== 'todos' || 
               filters.optometrista !== 'todos';
    };

    const ListHeaderComponent = () => (
        <View>
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder="Buscar por cliente o motivo..." 
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
                    <View style={styles.dateSelector}>
                        <TouchableOpacity onPress={() => changeDay(-1)} style={styles.dayButton}>
                            <Ionicons name="chevron-back" size={16} color="#009BBF" />
                        </TouchableOpacity>
                        <TextInput 
                            style={styles.dateInput} 
                            value={selectedDate} 
                            onChangeText={setSelectedDate} 
                            placeholder="YYYY-MM-DD" 
                            placeholderTextColor="#999999"
                        />
                        <TouchableOpacity onPress={() => changeDay(1)} style={styles.dayButton}>
                            <Ionicons name="chevron-forward" size={16} color="#009BBF" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterButton}>
                        <Ionicons name="funnel" size={20} color="#009BBF" />
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
                            <Text style={styles.filterLabel}>Estado</Text>
                            <View style={styles.pickerContainer}>
                                <Ionicons name="flag" size={20} color="#666666" style={styles.pickerIcon} />
                                <Picker
                                    selectedValue={filters.estado}
                                    onValueChange={(value) => setFilters({ ...filters, estado: value })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Todos los estados" value="todos" />
                                    <Picker.Item label="Agendada" value="Agendada" />
                                    <Picker.Item label="Pendiente" value="Pendiente" />
                                    <Picker.Item label="Confirmada" value="Confirmada" />
                                    <Picker.Item label="Completada" value="Completada" />
                                    <Picker.Item label="Cancelada" value="Cancelada" />
                                    <Picker.Item label="Programada" value="Programada" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Sucursal</Text>
                            <View style={styles.pickerContainer}>
                                <Ionicons name="location" size={20} color="#666666" style={styles.pickerIcon} />
                                <Picker
                                    selectedValue={filters.sucursal}
                                    onValueChange={(value) => setFilters({ ...filters, sucursal: value })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Todas las sucursales" value="todos" />
                                    {sucursales.map(sucursal => (
                                        <Picker.Item 
                                            key={sucursal._id} 
                                            label={sucursal.nombre} 
                                            value={sucursal._id} 
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Optometrista</Text>
                            <View style={styles.pickerContainer}>
                                <Ionicons name="medkit" size={20} color="#666666" style={styles.pickerIcon} />
                                <Picker
                                    selectedValue={filters.optometrista}
                                    onValueChange={(value) => setFilters({ ...filters, optometrista: value })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Todos los optometristas" value="todos" />
                                    {optometristas.map(opto => (
                                        <Picker.Item 
                                            key={opto._id} 
                                            label={opto.empleadoId ? `Dr(a). ${opto.empleadoId.nombre} ${opto.empleadoId.apellido}` : 'Optometrista'} 
                                            value={opto._id} 
                                        />
                                    ))}
                                </Picker>
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
                        {filteredCitas.length} cita{filteredCitas.length !== 1 ? 's' : ''} encontrada{filteredCitas.length !== 1 ? 's' : ''}
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

    if (loading && citas.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#009BBF" />
                <Text style={styles.loadingText}>Cargando citas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#009BBF" />

            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Citas Programadas</Text>
                        <Text style={styles.headerSubtitle}>Gestiona todas las citas</Text>
                    </View>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={handleRefresh} disabled={refreshing} style={styles.refreshButton}>
                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer} contentContainerStyle={styles.statsContent}>
                    <StatsCard label="Total" value={stats.total} iconName="calendar" color="#009BBF" />
                    <StatsCard label="Hoy" value={stats.hoy} iconName="time" color="#49AA4C" />
                    <StatsCard label="Pendientes" value={stats.pendientes} iconName="warning" color="#F39C12" />
                    <StatsCard label="Confirmadas" value={stats.confirmadas} iconName="checkmark-circle" color="#49AA4C" />
                </ScrollView>
            </View>

            <FlatList
                data={filteredCitas}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <CitaCard 
                        cita={item} 
                        onView={(c) => { setSelectedCita(c); setShowDetail(true); }} 
                        onEdit={(c) => handleOpenEditModal(c)} 
                        onDelete={(c) => handleOpenDeleteModal(c)} 
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

            <Modal visible={showFilters && false} animationType="slide" transparent={true} onRequestClose={() => setShowFilters(false)}>
                <View style={styles.filterModalOverlay}>
                    <View style={styles.filterModalContent}>
                        <View style={styles.filterModalHeader}>
                            <Text style={styles.filterModalTitle}>Ordenar por</Text>
                            <TouchableOpacity onPress={() => setShowFilters(false)}>
                                <Ionicons name="close" size={24} color="#666666" />
                            </TouchableOpacity>
                        </View>
                        {FILTER_OPTIONS.map(option => (
                            <TouchableOpacity 
                                key={option.value} 
                                onPress={() => { setSortBy(option.value); setShowFilters(false); }} 
                                style={[styles.filterOption, sortBy === option.value && styles.filterOptionSelected]}
                            >
                                <Ionicons name={option.icon} size={20} color={sortBy === option.value ? '#009BBF' : '#666666'} />
                                <Text style={[styles.filterOptionText, sortBy === option.value && styles.filterOptionTextSelected]}>{option.label}</Text>
                                {sortBy === option.value && <Ionicons name="checkmark-circle" size={20} color="#009BBF" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            <DetailModal 
                visible={showDetail} 
                onClose={() => { setShowDetail(false); setSelectedCita(null); }} 
                cita={selectedCita} 
            />
            <FormModal 
                visible={showAddModal || showEditModal} 
                onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedCita(null); }} 
                title={selectedCita ? 'Editar Cita' : 'Nueva Cita'} 
                onSubmit={handleSubmit} 
                formData={formData} 
                setFormData={setFormData} 
                errors={errors} 
                clientes={clientes} 
                optometristas={optometristas} 
                sucursales={sucursales} 
            />
            <DeleteModal 
                visible={showDeleteModal} 
                onClose={() => { setShowDeleteModal(false); setSelectedCita(null); }} 
                onConfirm={handleDelete} 
                cita={selectedCita} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    loadingText: { marginTop: 12, fontSize: 16, fontFamily: 'Lato-Regular', color: '#666666' },
    header: { backgroundColor: '#009BBF', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 24, fontFamily: 'Lato-Bold', color: '#FFFFFF', marginBottom: 4 },
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
    dateSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 8, borderWidth: 1, borderColor: '#E5E5E5' },
    dayButton: { padding: 8 },
    dateInput: { flex: 1, fontSize: 14, fontFamily: 'Lato-Bold', color: '#1A1A1A', textAlign: 'center' },
    filterButton: { width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E5E5', position: 'relative' },
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
    citaCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
    citaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    citaClientInfo: { flex: 1 },
    citaClientRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    citaClientName: { fontSize: 16, fontFamily: 'Lato-Bold', color: '#1A1A1A' },
    citaMotivo: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#666666' },
    estadoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
    estadoText: { fontSize: 11, fontFamily: 'Lato-Bold', color: '#FFFFFF', textTransform: 'uppercase' },
    citaInfo: { marginBottom: 12, gap: 8 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoIconSpacing: { marginLeft: 12 },
    infoText: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#1A1A1A', flex: 1 },
    citaActions: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    actionButtonPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#EFF6FF', borderRadius: 12 },
    actionButtonPrimaryText: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#2563EB' },
    actionButtonIcon: { width: 44, height: 44, backgroundColor: '#F0FDF4', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionButtonIconRed: { width: 44, height: 44, backgroundColor: '#FEF2F2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
    emptyIconContainer: { width: 96, height: 96, backgroundColor: '#F8F9FA', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#E5E5E5', borderStyle: 'dashed' },
    emptyTitle: { fontSize: 18, fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
    emptySubtitle: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#666666', textAlign: 'center', lineHeight: 20 },
    filterModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    filterModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
    filterModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
    filterModalTitle: { fontSize: 18, fontFamily: 'Lato-Bold', color: '#1A1A1A' },
    filterOption: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 16, marginVertical: 4, borderRadius: 12, gap: 12 },
    filterOptionSelected: { backgroundColor: '#F0F9FF' },
    filterOptionText: { flex: 1, fontSize: 16, fontFamily: 'Lato-Regular', color: '#666666' },
    filterOptionTextSelected: { fontFamily: 'Lato-Bold', color: '#009BBF' },
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
    notasText: { fontSize: 14, fontFamily: 'Lato-Regular', color: '#1A1A1A', lineHeight: 20, marginTop: 8 },
    formContent: { flex: 1, padding: 20 },
    formGroup: { marginBottom: 20 },
    formLabel: { fontSize: 14, fontFamily: 'Lato-Bold', color: '#1A1A1A', marginBottom: 8 },
    pickerContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#FFFFFF', 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#E5E5E5', 
        paddingLeft: 12,
        overflow: 'hidden'
    },
    pickerIcon: { marginRight: 8 },
    picker: { 
        flex: 1, 
        height: 48,
        color: '#1A1A1A'
    },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 12 },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, height: 48, fontSize: 16, fontFamily: 'Lato-Regular', color: '#1A1A1A' },
    textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
    errorText: { fontSize: 12, fontFamily: 'Lato-Regular', color: '#E74C3C', marginTop: 4 },
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

export default Citas;