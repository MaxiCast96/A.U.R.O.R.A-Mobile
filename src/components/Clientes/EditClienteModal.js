import React, { useEffect, useState } from 'react';
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
    getFieldError
} from '../../utils/validator';

/**
 * Componente EditClienteModal
 * 
 * Modal para editar clientes existentes con formulario organizado por secciones
 * siguiendo el diseño del sitio web de escritorio pero diferenciándose visualmente
 * del modal de agregar cliente.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Object} cliente - Datos del cliente a editar
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onSuccess - Función que se ejecuta al actualizar exitosamente el cliente
 */
const EditClienteModal = ({ visible, cliente, onClose, onSuccess }) => {
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
    const [initialData, setInitialData] = useState(null);

    /**
     * Cargar datos del cliente cuando se abre el modal
     */
    useEffect(() => {
        if (visible && cliente) {
            loadClienteData(cliente);
        }
    }, [visible, cliente]);

    /**
     * Cargar datos del cliente existente en el formulario
     */
    const loadClienteData = (clienteData) => {
        if (!clienteData) return;
        
        setNombre(clienteData.nombre || '');
        setApellido(clienteData.apellido || '');
        setEdad(clienteData.edad?.toString() || '');
        setDui(clienteData.dui || '');
        
        // Formatear teléfono con +503 si no lo tiene
        const telefonoFormatted = clienteData.telefono 
            ? (clienteData.telefono.startsWith('+503') 
                ? clienteData.telefono 
                : `+503 ${clienteData.telefono}`)
            : '';
        setTelefono(telefonoFormatted);
        
        setCorreo(clienteData.correo || '');
        
        // Cargar dirección
        if (clienteData.direccion) {
            setDepartamento(clienteData.direccion.departamento || '');
            setCiudad(clienteData.direccion.ciudad || '');
            setDireccionCompleta(clienteData.direccion.calle || '');
        } else {
            setDepartamento('');
            setCiudad('');
            setDireccionCompleta('');
        }
        
        setEstado(clienteData.estado || 'Activo');
        setPassword(''); // No cargar contraseña por seguridad
        setShowPassword(false);
        setErrors({});
        
        // Guardar datos iniciales para comparación
        setInitialData(clienteData);
    };

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
        setInitialData(null);
    };

    /**
     * Validar un campo específico
     */
    const validateField = (field, value) => {
        let error = null;
        
        // Para contraseña en edición, solo validar si no está vacía
        if (field === 'password') {
            if (value && value.length < 6) {
                error = 'La contraseña debe tener al menos 6 caracteres';
            }
        } else {
            error = getFieldError(field, value);
        }
        
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
        return !error;
    };

    /**
     * Verificar si hay cambios en los datos
     */
    const hasChanges = () => {
        if (!initialData) return false;
        
        const currentData = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            edad: Number(edad),
            dui: dui.trim(),
            telefono: getTelefonoNumbers(telefono),
            correo: correo.trim().toLowerCase(),
            estado: estado,
            direccion: {
                departamento: departamento.trim(),
                ciudad: ciudad.trim(),
                calle: direccionCompleta.trim()
            }
        };
        
        // Comparar datos básicos
        if (currentData.nombre !== (initialData.nombre || '') ||
            currentData.apellido !== (initialData.apellido || '') ||
            currentData.edad !== (initialData.edad || 0) ||
            currentData.dui !== (initialData.dui || '') ||
            currentData.telefono !== (initialData.telefono || '') ||
            currentData.correo !== (initialData.correo || '') ||
            currentData.estado !== (initialData.estado || 'Activo')) {
            return true;
        }
        
        // Comparar dirección
        const initialDir = initialData.direccion || {};
        if (currentData.direccion.departamento !== (initialDir.departamento || '') ||
            currentData.direccion.ciudad !== (initialDir.ciudad || '') ||
            currentData.direccion.calle !== (initialDir.calle || '')) {
            return true;
        }
        
        // Verificar si hay nueva contraseña
        if (password && password.trim() !== '') {
            return true;
        }
        
        return false;
    };

    /**
     * Validar formulario completo antes de enviar
     */
    const validateForm = () => {
        const newErrors = {};
        
        // Validar campos requeridos (excluyendo contraseña que es opcional en edición)
        const requiredFields = {
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo
        };

        let isValid = true;

        Object.keys(requiredFields).forEach(field => {
            const error = getFieldError(field, requiredFields[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        // Validar contraseña solo si se está cambiando
        if (password && password.trim() !== '' && password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

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
     * Actualizar cliente en el servidor
     */
    const updateCliente = async () => {
        if (!cliente?._id) {
            Alert.alert('Error', 'No se puede actualizar el cliente');
            return false;
        }

        if (!validateForm()) return false;

        // Verificar si hay cambios
        if (!hasChanges()) {
            Alert.alert('Sin cambios', 'No se han detectado cambios en los datos del cliente');
            return false;
        }

        setLoading(true);
        
        // Preparar datos según la estructura de tu MongoDB
        const clienteData = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            edad: Number(edad),
            dui: dui.trim(),
            telefono: getTelefonoNumbers(telefono), // Solo los números
            correo: correo.trim().toLowerCase(),
            direccion: {
                calle: direccionCompleta.trim(),
                ciudad: ciudad.trim(),
                departamento: departamento.trim()
            },
            estado: estado
        };

        // Solo agregar contraseña si se está cambiando
        if (password && password.trim() !== '') {
            clienteData.password = password.trim();
        }

        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/clientes/${cliente._id}`, {
                method: 'PUT',
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
                
                return true;
            } else {
                Alert.alert(
                    'Error al actualizar cliente', 
                    responseData.message || 'No se pudo actualizar el cliente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
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
        await updateCliente();
    };

    /**
     * Cerrar modal con confirmación si hay cambios
     */
    const handleClose = () => {
        if (hasChanges()) {
            Alert.alert(
                'Cambios sin guardar',
                '¿Estás seguro de que deseas cerrar sin guardar los cambios?',
                [
                    { text: 'Continuar editando', style: 'cancel' },
                    { 
                        text: 'Cerrar sin guardar', 
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
    const renderTextInput = (label, value, onChangeText, placeholder, required = false, keyboardType = 'default', multiline = false, editable = true, field = null) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
                style={[
                    styles.textInput, 
                    multiline && styles.multilineInput,
                    !editable && styles.disabledInput,
                    errors[field] && styles.inputError
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                editable={editable}
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
                Nueva Contraseña
            </Text>
            <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Dejar vacío si no desea cambiar"
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
            <Text style={styles.inputHint}>Dejar vacío para mantener la contraseña actual</Text>
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
                        estado === 'Activo' && styles.estadoOptionActiveSelected
                    ]}
                    onPress={() => setEstado('Activo')}
                >
                    <Text style={[
                        styles.estadoText,
                        estado === 'Activo' && styles.estadoTextActiveSelected
                    ]}>
                        Activo
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.estadoOption,
                        estado === 'Inactivo' && styles.estadoOptionInactiveSelected
                    ]}
                    onPress={() => setEstado('Inactivo')}
                >
                    <Text style={[
                        styles.estadoText,
                        estado === 'Inactivo' && styles.estadoTextInactiveSelected
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
                    <View style={styles.headerContent}>
                        <Ionicons name="pencil" size={24} color="#FFFFFF" />
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Editar Cliente</Text>
                            {cliente && (
                                <Text style={styles.headerSubtitle}>
                                    {cliente.nombre} {cliente.apellido}
                                </Text>
                            )}
                        </View>
                    </View>
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
                            <Ionicons name="person" size={20} color="#49AA4C" />
                            <Text style={styles.sectionTitle}>Información Personal</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Nombre', nombre, setNombre, 'Ej: María Elena', true, 'default', false, true, 'nombre')}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Apellido', apellido, setApellido, 'Ej: Rodríguez Pérez', true, 'default', false, true, 'apellido')}
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Edad', edad, setEdad, '25', true, 'numeric', false, true, 'edad')}
                                    <Text style={styles.inputHint}>Edad mínima: 18 años</Text>
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Número de DUI', dui, handleDUIChange, '12345678-9', true, 'numeric', false, true, 'dui')}
                                    <Text style={styles.inputHint}>Formato: 12345678-9</Text>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Teléfono', telefono, handleTelefonoChange, '+503 78901234', true, 'phone-pad', false, true, 'telefono')}
                                    <Text style={styles.inputHint}>Formato: +503 12345678</Text>
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Correo Electrónico', correo, setCorreo, 'maria.rodriguez@email.com', true, 'email-address', false, true, 'correo')}
                                    <Text style={styles.inputHint}>Ejemplo: cliente@email.com</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Sección: Información de Residencia */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location" size={20} color="#FF8C00" />
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
                                'Colonia Santa Elena, Calle Los Rosales #456',
                                false,
                                'default',
                                true
                            )}
                        </View>
                    </View>

                    {/* Sección: Estado del Cliente */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="analytics" size={20} color="#6366F1" />
                            <Text style={styles.sectionTitle}>Estado del Cliente</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {renderEstadoSelector()}
                        </View>
                    </View>

                    {/* Sección: Seguridad */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="key" size={20} color="#10B981" />
                            <Text style={styles.sectionTitle}>Seguridad</Text>
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
                        <Ionicons name="close-circle-outline" size={20} color="#666666" />
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.updateButtonText}>
                            {loading ? 'Actualizando...' : 'Actualizar Cliente'}
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
        backgroundColor: '#49AA4C', // Color diferente al de agregar
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
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
        borderLeftWidth: 3,
        borderLeftColor: '#49AA4C', // Borde de color para diferenciarlo
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
        color: '#49AA4C',
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
    disabledInput: {
        backgroundColor: '#F8F9FA',
        color: '#666666',
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
    estadoOptionActiveSelected: {
        borderColor: '#10B981',
        backgroundColor: '#10B981',
    },
    estadoOptionInactiveSelected: {
        borderColor: '#49AA4C',
        backgroundColor: '#49AA4C',
    },
    estadoText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    estadoTextActiveSelected: {
        color: '#FFFFFF',
    },
    estadoTextInactiveSelected: {
        color: '#FFFFFF',
    },
    spacer: {
        height: 20,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    updateButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#49AA4C',
        borderRadius: 10,
        gap: 8,
        shadowColor: '#49AA4C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    updateButtonDisabled: {
        backgroundColor: '#999999',
        shadowColor: 'transparent',
    },
    updateButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default EditClienteModal;