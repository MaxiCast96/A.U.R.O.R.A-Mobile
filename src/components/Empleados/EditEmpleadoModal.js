import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    Image,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEditEmpleado } from '../../hooks/useEmpleado/useEditEmpleado';
import { EL_SALVADOR_DATA } from '../../constants/ElSalvadorData';

/**
 * Componente EditEmpleadoModal
 * 
 * Modal para editar empleados existentes con formulario organizado por secciones
 * siguiendo el diseño del sitio web de escritorio.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Object} empleado - Empleado a editar (null si no hay empleado seleccionado)
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onSuccess - Función que se ejecuta al actualizar exitosamente el empleado
 */
const EditEmpleadoModal = ({ visible, empleado, onClose, onSuccess }) => {
    const {
        // Estados del formulario - Información Personal
        nombre,
        setNombre,
        apellido,
        setApellido,
        dui,
        telefono,
        correo,
        setCorreo,
        fotoPerfil,
        
        // Estados del formulario - Información de Residencia
        departamento,
        ciudad,
        setCiudad,
        direccionCompleta,
        setDireccionCompleta,
        
        // Estados del formulario - Información Laboral
        sucursal,
        setSucursal,
        puesto,
        setPuesto,
        salario,
        setSalario,
        fechaContratacion,
        showDatePicker,
        setShowDatePicker,
        estado,
        setEstado,
        
        // Estados del formulario - Acceso y Seguridad
        password,
        setPassword,
        showPassword,
        setShowPassword,
        
        // Estados de control
        loading,
        errors,
        setErrors,
        uploadingImage,
        
        // Opciones para selectores
        sucursales,
        puestos,
        
        // Funciones de inicialización
        loadEmpleadoData,
        
        // Funciones de formateo
        handleDUIChange,
        handleTelefonoChange,
        handleDepartamentoChange,
        handleDateChange,
        
        // Funciones de gestión de imágenes
        handleImagePicker,
        
        // Funciones de validación
        validateField,
        hasChanges,
        
        // Funciones de limpieza
        clearForm,
        
        // Funciones de actualización
        updateEmpleado
    } = useEditEmpleado();

    /**
     * Cargar datos del empleado cuando se abre el modal o cambia el empleado
     */
    useEffect(() => {
        if (visible && empleado) {
            loadEmpleadoData(empleado);
        }
    }, [visible, empleado]);

    /**
     * Manejar el guardado del empleado
     */
    const handleSave = async () => {
        const success = await updateEmpleado(onSuccess);
        if (success) {
            onClose();
        }
    };

    /**
     * Cerrar modal con confirmación si hay cambios
     */
    const handleClose = () => {
        if (hasChanges()) {
            Alert.alert(
                'Descartar cambios',
                '¿Estás seguro de que deseas cerrar sin guardar los cambios?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: 'Descartar', 
                        style: 'destructive',
                        onPress: () => {
                            clearForm();
                            onClose();
                        }
                    }
                ]
            );
        } else {
            clearForm();
            onClose();
        }
    };

    /**
     * Renderizar campo de entrada de texto con validación
     */
    const renderTextInput = (label, value, onChangeText, placeholder, required = false, keyboardType = 'default', multiline = false, field = null) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
                style={[
                    styles.textInput, 
                    multiline && styles.multilineInput,
                    errors[field] && styles.inputError
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                onBlur={field ? () => validateField(field, value) : undefined}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    /**
     * Renderizar campo de contraseña
     */
    const renderPasswordInput = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                Nueva Contraseña (opcional)
            </Text>
            <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Dejar en blanco para mantener la actual"
                    placeholderTextColor="#999999"
                    secureTextEntry={!showPassword}
                    onBlur={() => validateField('password', password)}
                />
                <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Ionicons 
                        name={showPassword ? 'eye-off' : 'eye'} 
                        size={20} 
                        color="#666666" 
                    />
                </TouchableOpacity>
            </View>
            {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
            )}
            <Text style={styles.inputHint}>Solo completa si deseas cambiar la contraseña</Text>
        </View>
    );

    /**
     * Renderizar selector de departamento con validación defensiva
     */
    const renderDepartamentoSelector = () => {
        if (!EL_SALVADOR_DATA || typeof EL_SALVADOR_DATA !== 'object') {
            console.warn('EL_SALVADOR_DATA no está disponible');
            return (
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Departamento <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.pickerContainer, styles.disabledInput]}>
                        <Text style={styles.errorText}>Error: Datos de departamentos no disponibles</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                    Departamento <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.pickerContainer, errors.departamento && styles.inputError]}>
                    <Picker
                        selectedValue={departamento}
                        onValueChange={handleDepartamentoChange}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecciona un departamento" value="" />
                        {Object.keys(EL_SALVADOR_DATA).map((dept) => (
                            <Picker.Item key={dept} label={dept} value={dept} />
                        ))}
                    </Picker>
                </View>
                {errors.departamento && (
                    <Text style={styles.errorText}>{errors.departamento}</Text>
                )}
            </View>
        );
    };

    /**
     * Renderizar selector de ciudad con validación defensiva
     */
    const renderCiudadSelector = () => {
        if (!EL_SALVADOR_DATA || typeof EL_SALVADOR_DATA !== 'object') {
            return (
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Ciudad/Municipio <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.pickerContainer, styles.disabledInput]}>
                        <Text style={styles.errorText}>Error: Datos de ciudades no disponibles</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                    Ciudad/Municipio <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.pickerContainer, errors.ciudad && styles.inputError]}>
                    <Picker
                        selectedValue={ciudad}
                        onValueChange={(value) => {
                            setCiudad(value);
                            if (value) {
                                setErrors(prev => ({ ...prev, ciudad: null }));
                            }
                        }}
                        style={styles.picker}
                        enabled={!!departamento && !!EL_SALVADOR_DATA[departamento]}
                    >
                        <Picker.Item 
                            label={departamento ? "Selecciona una ciudad" : "Primero selecciona un departamento"} 
                            value="" 
                        />
                        {departamento && EL_SALVADOR_DATA[departamento]?.map((municipio) => (
                            <Picker.Item key={municipio} label={municipio} value={municipio} />
                        ))}
                    </Picker>
                </View>
                {errors.ciudad && (
                    <Text style={styles.errorText}>{errors.ciudad}</Text>
                )}
                {!departamento && (
                    <Text style={styles.inputHint}>Selecciona primero un departamento</Text>
                )}
            </View>
        );
    };

    /**
     * Renderizar selector de estado
     */
    const renderEstadoSelector = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                Estado del Empleado <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.estadoContainer}>
                <TouchableOpacity
                    style={[
                        styles.estadoOption,
                        estado === 'Activo' && styles.estadoOptionSelected
                    ]}
                    onPress={() => setEstado('Activo')}
                >
                    <Text style={[
                        styles.estadoText,
                        estado === 'Activo' && styles.estadoTextSelected
                    ]}>
                        Activo
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.estadoOption,
                        estado === 'Inactivo' && styles.estadoOptionSelected
                    ]}
                    onPress={() => setEstado('Inactivo')}
                >
                    <Text style={[
                        styles.estadoText,
                        estado === 'Inactivo' && styles.estadoTextSelected
                    ]}>
                        Inactivo
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    /**
     * Renderizar selector de sucursal
     */
    const renderSucursalSelector = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                Sucursal <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.sucursal && styles.inputError]}>
                <Picker
                    selectedValue={sucursal}
                    onValueChange={(value) => {
                        setSucursal(value);
                        if (value) {
                            setErrors(prev => ({ ...prev, sucursal: null }));
                        }
                    }}
                    style={styles.picker}
                >
                    {sucursales.map((sucursalItem) => (
                        <Picker.Item 
                            key={sucursalItem.value} 
                            label={sucursalItem.label} 
                            value={sucursalItem.value} 
                        />
                    ))}
                </Picker>
            </View>
            {errors.sucursal && (
                <Text style={styles.errorText}>{errors.sucursal}</Text>
            )}
        </View>
    );

    /**
     * Renderizar selector de puesto
     */
    const renderPuestoSelector = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                Puesto <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.puesto && styles.inputError]}>
                <Picker
                    selectedValue={puesto}
                    onValueChange={(value) => {
                        setPuesto(value);
                        if (value) {
                            setErrors(prev => ({ ...prev, puesto: null }));
                        }
                    }}
                    style={styles.picker}
                >
                    {puestos.map((puestoItem) => (
                        <Picker.Item 
                            key={puestoItem.value} 
                            label={puestoItem.label} 
                            value={puestoItem.value} 
                        />
                    ))}
                </Picker>
            </View>
            {errors.puesto && (
                <Text style={styles.errorText}>{errors.puesto}</Text>
            )}
        </View>
    );

    /**
     * Renderizar selector de fecha
     */
    const renderDatePicker = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                Fecha de Contratación <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
                style={[styles.datePickerButton, errors.fechaContratacion && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.datePickerText}>
                    {fechaContratacion.toLocaleDateString('es-ES')}
                </Text>
                <Ionicons name="calendar" size={20} color="#666666" />
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={fechaContratacion}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
            {errors.fechaContratacion && (
                <Text style={styles.errorText}>{errors.fechaContratacion}</Text>
            )}
        </View>
    );

    /**
     * Renderizar sección de foto de perfil
     */
    const renderFotoPerfilSection = () => (
        <View style={styles.fotoPerfilContainer}>
            <TouchableOpacity
                style={styles.fotoPerfilButton}
                onPress={handleImagePicker}
                disabled={uploadingImage}
            >
                {fotoPerfil ? (
                    <Image source={{ uri: fotoPerfil }} style={styles.fotoPerfilImage} />
                ) : (
                    <View style={styles.fotoPerfilPlaceholder}>
                        <Ionicons name="person" size={40} color="#CCCCCC" />
                    </View>
                )}
                <View style={styles.fotoPerfilIcon}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
            </TouchableOpacity>
            <View style={styles.fotoPerfilInfo}>
                <Text style={styles.fotoPerfilTitle}>Cambiar foto de perfil</Text>
                <Text style={styles.fotoPerfilHint}>
                    {uploadingImage ? 'Subiendo imagen...' : 'Haz clic en la imagen para cambiar'}
                </Text>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header del modal */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Editar Empleado</Text>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Contenido del formulario */}
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Sección: Foto de Perfil */}
                    <View style={styles.section}>
                        <View style={styles.sectionContent}>
                            {renderFotoPerfilSection()}
                        </View>
                    </View>

                    {/* Sección: Información Personal */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person" size={20} color="#009BBF" />
                            <Text style={styles.sectionTitle}>Información Personal</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Nombre', nombre, setNombre, 'Ej: Juan Carlos', true, 'default', false, 'nombre')}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Apellido', apellido, setApellido, 'Ej: García López', true, 'default', false, 'apellido')}
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Número de DUI', dui, handleDUIChange, '12345678-9', true, 'numeric', false, 'dui')}
                                    <Text style={styles.inputHint}>Formato: 12345678-9</Text>
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Teléfono', telefono, handleTelefonoChange, '+503 78901234', true, 'phone-pad', false, 'telefono')}
                                    <Text style={styles.inputHint}>Se agrega +503 automáticamente</Text>
                                </View>
                            </View>
                            {renderTextInput('Correo Electrónico', correo, setCorreo, 'juan.garcia@email.com', true, 'email-address', false, 'correo')}
                            <Text style={styles.inputHint}>Ejemplo: empleado@email.com</Text>
                        </View>
                    </View>

                    {/* Sección: Información de Residencia */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="home" size={20} color="#49AA4C" />
                            <Text style={styles.sectionTitle}>Información de Residencia</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderDepartamentoSelector()}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderCiudadSelector()}
                                </View>
                            </View>
                            {renderTextInput(
                                'Dirección Completa', 
                                direccionCompleta, 
                                setDireccionCompleta, 
                                'Colonia Santa Elena, Calle Los Rosales #456, Casa amarilla con portón negro',
                                false,
                                'default',
                                true
                            )}
                        </View>
                    </View>

                    {/* Sección: Información Laboral */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="briefcase" size={20} color="#6B46C1" />
                            <Text style={styles.sectionTitle}>Información Laboral</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderSucursalSelector()}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderPuestoSelector()}
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Salario (USD)', salario, setSalario, '500.00', true, 'numeric', false, 'salario')}
                                    <Text style={styles.inputHint}>Salario mensual en dólares</Text>
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderDatePicker()}
                                </View>
                            </View>
                            {renderEstadoSelector()}
                        </View>
                    </View>

                    {/* Sección: Acceso y Seguridad */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="lock-closed" size={20} color="#6B7280" />
                            <Text style={styles.sectionTitle}>Acceso y Seguridad</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {renderPasswordInput()}
                        </View>
                    </View>

                    {/* Espaciador */}
                    <View style={styles.spacer} />
                </ScrollView>

                {/* Botones de acción */}
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
                        onPress={handleSave}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Ionicons name="save" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Actualizando...' : 'Actualizar Empleado'}
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
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    inputHint: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#DC2626',
        marginTop: 4,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    passwordToggle: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        fontSize: 14,
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
    datePickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
    },
    datePickerText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    fotoPerfilContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    fotoPerfilButton: {
        position: 'relative',
    },
    fotoPerfilPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    fotoPerfilImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    fotoPerfilIcon: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fotoPerfilInfo: {
        flex: 1,
    },
    fotoPerfilTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    fotoPerfilHint: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
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
    disabledInput: {
        opacity: 0.5,
    },
});

export default EditEmpleadoModal;