import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { EL_SALVADOR_DATA } from '../../constants/ElSalvadorData';
import { 
    formatDUI, 
    formatTelefono, 
    getTelefonoNumbers,
    getFieldError,
    validateDUI,
    validateTelefono,
    validateEmail,
    validateRequired,
    validateEdad,
    validatePassword
} from '../../utils/validator';

/**
 * Componente AddClienteModal
 * 
 * Modal para agregar nuevos clientes con formulario organizado por secciones
 * siguiendo el diseño del sitio web de escritorio.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onSuccess - Función que se ejecuta al crear exitosamente el cliente
 */
const AddClienteModal = ({ visible, onClose, onSuccess }) => {
    const { getAuthHeaders } = useAuth();
    
    // Estados del formulario - Información Personal
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [edad, setEdad] = useState('');
    const [dui, setDui] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');

    // Estados del formulario - Información de Residencia
    const [departamento, setDepartamento] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccionCompleta, setDireccionCompleta] = useState('');

    // Estados del formulario - Estado y Seguridad
    const [estado, setEstado] = useState('Activo');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    /**
     * Limpiar todos los campos del formulario
     */
    const clearForm = () => {
        setNombre('');
        setApellido('');
        setEdad('');
        setDui('');
        setTelefono('');
        setCorreo('');
        setDepartamento('');
        setCiudad('');
        setDireccionCompleta('');
        setEstado('Activo');
        setPassword('');
        setShowPassword(false);
        setErrors({});
    };

    /**
     * Validar un campo específico
     */
    const validateField = (field, value) => {
        const error = getFieldError(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
        return !error;
    };

    /**
     * Validar formulario completo antes de enviar
     */
    const validateForm = () => {
        const newErrors = {};
        
        // Validar campos requeridos
        const fields = {
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            password
        };

        let isValid = true;

        Object.keys(fields).forEach(field => {
            const error = getFieldError(field, fields[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    /**
     * Manejar cambio en el DUI con formateo automático
     */
    const handleDUIChange = (value) => {
        const formattedDUI = formatDUI(value);
        setDui(formattedDUI);
        
        // Validar en tiempo real si ya tiene la longitud completa
        if (formattedDUI.length === 10) {
            validateField('dui', formattedDUI);
        } else if (errors.dui) {
            setErrors(prev => ({ ...prev, dui: null }));
        }
    };

    /**
     * Manejar cambio en el teléfono con formateo automático
     */
    const handleTelefonoChange = (value) => {
        const formattedTelefono = formatTelefono(value);
        setTelefono(formattedTelefono);
        
        // Validar en tiempo real
        const numbers = getTelefonoNumbers(formattedTelefono);
        if (numbers.length === 8) {
            validateField('telefono', formattedTelefono);
        } else if (errors.telefono) {
            setErrors(prev => ({ ...prev, telefono: null }));
        }
    };

    /**
     * Manejar cambio de departamento
     */
    const handleDepartamentoChange = (value) => {
        setDepartamento(value);
        setCiudad(''); // Limpiar ciudad cuando cambia departamento
        
        if (value) {
            setErrors(prev => ({ ...prev, departamento: null }));
        }
    };

    /**
     * Crear cliente en el servidor
     */
    const createCliente = async () => {
        if (!validateForm()) return false;

        setLoading(true);
        
        // Preparar datos según la estructura de tu MongoDB
        const clienteData = {
            nombre: nombre.toString().trim(),
            apellido: apellido.toString().trim(),
            edad: Number(edad),
            dui: dui.toString().trim(),
            telefono: getTelefonoNumbers(telefono), // Solo los números
            correo: correo.toString().trim().toLowerCase(),
            direccion: {
                calle: direccionCompleta.toString().trim(),
                ciudad: ciudad.toString().trim(),
                departamento: departamento.toString().trim()
            },
            estado: estado,
            password: password.toString().trim()
        };

        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/clientes', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clienteData),
            });

            const responseData = await response.json();

            if (response.ok) {
                // Limpiar formulario
                clearForm();
                
                // Ejecutar callback de éxito
                if (onSuccess) {
                    onSuccess(responseData);
                }
                
                // Cerrar modal
                onClose();
                
                return true;
            } else {
                Alert.alert(
                    'Error al crear cliente', 
                    responseData.message || 'No se pudo crear el cliente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al crear cliente:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Manejar el guardado del cliente
     */
    const handleSave = async () => {
        await createCliente();
    };

    /**
     * Cerrar modal y limpiar formulario
     */
    const handleClose = () => {
        clearForm();
        onClose();
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
                Contraseña <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Contraseña para acceder al sistema"
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
            <Text style={styles.inputHint}>Debe tener al menos 6 caracteres</Text>
        </View>
    );

    /**
 * Renderizar selector de departamento con validación defensiva
 */
const renderDepartamentoSelector = () => {
    // Validación defensiva para evitar errores si EL_SALVADOR_DATA está undefined
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
    // Validación defensiva
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
                Estado del Cliente <Text style={styles.required}>*</Text>
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
                    <Text style={styles.headerTitle}>Agregar Nuevo Cliente</Text>
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
                    {/* Sección: Información Personal */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person" size={20} color="#009BBF" />
                            <Text style={styles.sectionTitle}>Información Personal</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Nombre', nombre, setNombre, 'Ej: María Elena', true, 'default', false, 'nombre')}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Apellido', apellido, setApellido, 'Ej: Rodríguez Pérez', true, 'default', false, 'apellido')}
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Edad', edad, setEdad, '25', true, 'numeric', false, 'edad')}
                                    <Text style={styles.inputHint}>Edad mínima: 18 años</Text>
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Número de DUI', dui, handleDUIChange, '12345678-9', true, 'numeric', false, 'dui')}
                                    <Text style={styles.inputHint}>Formato: 12345678-9</Text>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Teléfono', telefono, handleTelefonoChange, '+503 78901234', true, 'phone-pad', false, 'telefono')}
                                    <Text style={styles.inputHint}>Se agrega +503 automáticamente</Text>
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Correo Electrónico', correo, setCorreo, 'maria.rodriguez@email.com', true, 'email-address', false, 'correo')}
                                    <Text style={styles.inputHint}>Ejemplo: cliente@email.com</Text>
                                </View>
                            </View>
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

                    {/* Sección: Estado del Cliente */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="bar-chart" size={20} color="#D0155F" />
                            <Text style={styles.sectionTitle}>Estado del Cliente</Text>
                        </View>
                        <View style={styles.sectionContent}>
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
                            {loading ? 'Guardando...' : 'Guardar Cliente'}
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
});

export default AddClienteModal;