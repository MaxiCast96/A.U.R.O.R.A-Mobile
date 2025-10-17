import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAddOptometrista } from '../../hooks/useOptometristas/useAddOptometrista';
import { useAuth } from '../../context/AuthContext';
import HorariosInteractivo from './HorarioInteractivo';

const AddOptometristaModal = ({ visible, onClose, onSuccess, empleadoData }) => {
    const { getAuthHeaders } = useAuth();
    
    const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
    const [loadingSucursales, setLoadingSucursales] = useState(true);

    const {
        especialidad,
        setEspecialidad,
        numeroLicencia,
        setNumeroLicencia,
        experiencia,
        setExperiencia,
        estadoDisponibilidad,
        setEstadoDisponibilidad,
        disponibilidad,
        setDisponibilidad,
        sucursalesAsignadas,
        setSucursalesAsignadas,
        loading,
        errors,
        setErrors,
        especialidades,
        createOptometrista,
        clearOptometristaForm,
        validateField,
    } = useAddOptometrista();

    const loadSucursales = async () => {
        try {
            setLoadingSucursales(true);
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/sucursales', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const sucursalesData = await response.json();
                setSucursalesDisponibles(sucursalesData);
            } else {
                setSucursalesDisponibles([]);
            }
        } catch (error) {
            setSucursalesDisponibles([]);
        } finally {
            setLoadingSucursales(false);
        }
    };

    useEffect(() => {
        if (visible) {
            loadSucursales();
        }
    }, [visible]);

    const handleHorariosChange = (newDisponibilidad) => {
        setDisponibilidad(newDisponibilidad);
        if (errors.disponibilidad && newDisponibilidad.length > 0) {
            setErrors(prev => ({ ...prev, disponibilidad: null }));
        }
    };

    const handleSucursalToggle = (sucursalId) => {
        const currentSucursales = Array.isArray(sucursalesAsignadas) ? sucursalesAsignadas : [];
        
        if (currentSucursales.includes(sucursalId)) {
            setSucursalesAsignadas(currentSucursales.filter(id => id !== sucursalId));
        } else {
            setSucursalesAsignadas([...currentSucursales, sucursalId]);
        }
        
        if (errors.sucursalesAsignadas) {
            setErrors(prev => ({ ...prev, sucursalesAsignadas: null }));
        }
    };

    const validateSucursales = () => {
        if (!Array.isArray(sucursalesAsignadas) || sucursalesAsignadas.length === 0) {
            setErrors(prev => ({ 
                ...prev, 
                sucursalesAsignadas: 'Debe seleccionar al menos una sucursal' 
            }));
            return false;
        }
        return true;
    };

    const handleCreateOptometrista = async () => {
        if (!validateSucursales()) {
            return;
        }
        
        const success = await createOptometrista(empleadoData, onSuccess);
        if (success) {
            onClose();
        }
    };

    const handleClose = () => {
        clearOptometristaForm();
        onClose();
    };

    const renderTextInput = (label, value, onChangeText, placeholder, required = false, keyboardType = 'default', field = null) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
                style={[
                    styles.textInput,
                    errors[field] && styles.inputError
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                keyboardType={keyboardType}
                onBlur={field ? () => validateField(field, value) : undefined}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    const renderEspecialidadSelector = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                Especialidad <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.especialidad && styles.inputError]}>
                <Picker
                    selectedValue={especialidad}
                    onValueChange={(value) => {
                        setEspecialidad(value);
                        if (value) {
                            validateField('especialidad', value);
                        }
                    }}
                    style={styles.picker}
                    itemStyle={{ color: '#1A1A1A', fontSize: 14 }}
                    dropdownIconColor="#666666"
                >
                    {especialidades.map((especialidadItem) => (
                        <Picker.Item 
                            key={especialidadItem.value} 
                            label={especialidadItem.label} 
                            value={especialidadItem.value}
                            color="#1A1A1A"
                        />
                    ))}
                </Picker>
            </View>
            {errors.especialidad && (
                <Text style={styles.errorText}>{errors.especialidad}</Text>
            )}
        </View>
    );

    const renderEstadoDisponibilidadSelector = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                Estado de Disponibilidad <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.estadoContainer}>
                <TouchableOpacity
                    style={[
                        styles.estadoOption,
                        estadoDisponibilidad === 'Disponible' && styles.estadoOptionSelected
                    ]}
                    onPress={() => setEstadoDisponibilidad('Disponible')}
                >
                    <Text style={[
                        styles.estadoText,
                        estadoDisponibilidad === 'Disponible' && styles.estadoTextSelected
                    ]}>
                        Disponible
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.estadoOption,
                        estadoDisponibilidad === 'No Disponible' && styles.estadoOptionSelected
                    ]}
                    onPress={() => setEstadoDisponibilidad('No Disponible')}
                >
                    <Text style={[
                        styles.estadoText,
                        estadoDisponibilidad === 'No Disponible' && styles.estadoTextSelected
                    ]}>
                        No Disponible
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpleadoInfo = () => (
        <View style={styles.empleadoInfoContainer}>
            <View style={styles.empleadoAvatar}>
                <Text style={styles.empleadoAvatarText}>
                    {empleadoData ? `${empleadoData.nombre?.charAt(0) || ''}${empleadoData.apellido?.charAt(0) || ''}`.toUpperCase() : 'SX'}
                </Text>
            </View>
            <View style={styles.empleadoInfo}>
                <Text style={styles.empleadoNombre}>
                    {empleadoData ? `${empleadoData.nombre || ''} ${empleadoData.apellido || ''}`.trim() : 'Empleado nuevo'}
                </Text>
                <Text style={styles.empleadoCorreo}>
                    {empleadoData?.correo || 'empleado@email.com'}
                </Text>
                <Text style={styles.empleadoMeta}>
                    ✓ {empleadoData?._id ? 'Empleado existente - Se actualizará' : 'Empleado nuevo - Se guardará automáticamente'}
                </Text>
            </View>
        </View>
    );

    const renderSucursalesAsignadas = () => {
        if (loadingSucursales) {
            return (
                <View style={styles.sucursalesContainer}>
                    <Text style={styles.sucursalesTitle}>
                        Sucursales Asignadas <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Cargando sucursales...</Text>
                    </View>
                </View>
            );
        }

        if (!Array.isArray(sucursalesDisponibles) || sucursalesDisponibles.length === 0) {
            return (
                <View style={styles.sucursalesContainer}>
                    <Text style={styles.sucursalesTitle}>
                        Sucursales Asignadas <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={16} color="#DC2626" />
                        <Text style={styles.errorText}>No se pudieron cargar las sucursales</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.sucursalesContainer}>
                <Text style={styles.sucursalesTitle}>
                    Sucursales Asignadas <Text style={styles.required}>*</Text>
                </Text>
                <Text style={styles.sucursalesSubtitle}>
                    Selecciona las sucursales donde el optometrista prestará sus servicios
                </Text>
                
                <View style={[
                    styles.sucursalesGrid,
                    errors.sucursalesAsignadas && styles.sucursalesGridError
                ]}>
                    {sucursalesDisponibles.map((sucursal) => {
                        const isSelected = Array.isArray(sucursalesAsignadas) && sucursalesAsignadas.includes(sucursal._id);
                        
                        return (
                            <TouchableOpacity
                                key={sucursal._id}
                                style={[
                                    styles.sucursalCard,
                                    isSelected ? styles.sucursalCardSelected : styles.sucursalCardUnselected
                                ]}
                                onPress={() => handleSucursalToggle(sucursal._id)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.sucursalCardContent}>
                                    <View style={[
                                        styles.sucursalCheckbox,
                                        isSelected ? styles.sucursalCheckboxSelected : styles.sucursalCheckboxUnselected
                                    ]}>
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.sucursalCardText,
                                        isSelected ? styles.sucursalCardTextSelected : styles.sucursalCardTextUnselected
                                    ]}>
                                        {sucursal.nombre}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {errors.sucursalesAsignadas && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={16} color="#DC2626" />
                        <Text style={styles.errorText}>{errors.sucursalesAsignadas}</Text>
                    </View>
                )}

                <Text style={styles.sucursalesHint}>
                    Selecciona al menos una sucursal donde el optometrista trabajará
                </Text>
                
                {sucursalesAsignadas && sucursalesAsignadas.length > 0 && (
                    <Text style={styles.debugText}>
                        Seleccionadas: {sucursalesAsignadas.length}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        {empleadoData?._id ? 'Actualizar a Optometrista (Paso 2 de 2)' : 'Añadir Detalles del Optometrista (Paso 2 de 2)'}
                    </Text>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person" size={20} color="#009BBF" />
                            <Text style={styles.sectionTitle}>Información del Optometrista</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <Text style={styles.sectionSubtitle}>Empleado <Text style={styles.required}>*</Text></Text>
                            {renderEmpleadoInfo()}

                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderEspecialidadSelector()}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Número de Licencia', numeroLicencia, setNumeroLicencia, 'Ingrese el número de licencia', true, 'default', 'numeroLicencia')}
                                </View>
                            </View>
                            
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Años de Experiencia', experiencia, setExperiencia, 'Ingrese años de experiencia', true, 'numeric', 'experiencia')}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderEstadoDisponibilidadSelector()}
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="time" size={20} color="#009BBF" />
                            <Text style={styles.sectionTitle}>Configuración de Horarios</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <HorariosInteractivo
                                disponibilidad={disponibilidad}
                                onChange={handleHorariosChange}
                                error={errors.disponibilidad}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="business" size={20} color="#009BBF" />
                            <Text style={styles.sectionTitle}>Asignación de Sucursales</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {renderSucursalesAsignadas()}
                        </View>
                    </View>

                    <View style={styles.spacer} />
                </ScrollView>

                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleCreateOptometrista}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Ionicons name="save" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Guardando...' : 'Guardar Optometrista'}
                        </Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        flex: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    section: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    sectionSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    sectionContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    halfWidth: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    required: {
        color: '#D0155F',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: '#DC2626',
        borderWidth: 2,
    },
    errorText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#DC2626',
        marginTop: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        minHeight: 50,
    },
    picker: {
        height: 50,
        fontSize: 14,
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
    },
    estadoContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    estadoOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
    },
    estadoOptionSelected: {
        borderColor: '#009BBF',
        backgroundColor: '#009BBF',
    },
    estadoText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    estadoTextSelected: {
        color: '#FFFFFF',
    },
    empleadoInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F8FB',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#009BBF',
    },
    empleadoAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    empleadoAvatarText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    empleadoInfo: {
        flex: 1,
    },
    empleadoNombre: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    empleadoCorreo: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginBottom: 4,
    },
    empleadoMeta: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#009BBF',
        fontStyle: 'italic',
    },
    spacer: {
        height: 40,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    sucursalesContainer: {
        marginVertical: 8,
    },
    sucursalesTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    sucursalesSubtitle: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginBottom: 12,
    },
    sucursalesGrid: {
        gap: 8,
    },
    sucursalesGridError: {
        borderWidth: 1,
        borderColor: '#DC2626',
        borderRadius: 8,
        padding: 8,
    },
    sucursalCard: {
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    sucursalCardSelected: {
        backgroundColor: '#E8F8FB',
        borderColor: '#009BBF',
        borderWidth: 2,
    },
    sucursalCardUnselected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E5E5',
    },
    sucursalCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    sucursalCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sucursalCheckboxSelected: {
        backgroundColor: '#009BBF',
        borderColor: '#009BBF',
    },
    sucursalCheckboxUnselected: {
        backgroundColor: 'transparent',
        borderColor: '#D1D5DB',
    },
    sucursalCardText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        flex: 1,
    },
    sucursalCardTextSelected: {
        color: '#1A1A1A',
        fontFamily: 'Lato-Bold',
    },
    sucursalCardTextUnselected: {
        color: '#666666',
    },
    sucursalesHint: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 8,
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
        gap: 4,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    debugText: {
        fontSize: 10,
        fontFamily: 'Lato-Regular',
        color: '#009BBF',
        textAlign: 'center',
        marginTop: 4,
    },
});

export default AddOptometristaModal;