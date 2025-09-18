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

/**
 * Componente AddClienteModal
 * 
 * Modal para agregar nuevos clientes con formulario organizado por secciones
 * siguiendo el diseño del sitio web de escritorio.
 * 
 * Props:
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {Function} onClose - Función que se ejecuta al cerrar el modal
 * @param {Function} onSave - Función que se ejecuta al guardar el cliente
 */
const AddClienteModal = ({ visible, onClose, onSave }) => {
    // Estados del formulario - Información Personal
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [edad, setEdad] = useState('');
    const [dui, setDui] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');

    // Estados del formulario - Información de Residencia
    const [departamento, setDepartamento] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccionCompleta, setDireccionCompleta] = useState('');

    // Estados del formulario - Estado y Seguridad
    const [estado, setEstado] = useState('activo');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estado de carga
    const [loading, setLoading] = useState(false);

    /**
     * Limpiar todos los campos del formulario
     */
    const clearForm = () => {
        setNombre('');
        setApellidos('');
        setEdad('');
        setDui('');
        setTelefono('');
        setEmail('');
        setDepartamento('');
        setCiudad('');
        setDireccionCompleta('');
        setEstado('activo');
        setPassword('');
        setShowPassword(false);
    };

    /**
     * Validar formulario antes de enviar
     */
    const validateForm = () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return false;
        }
        if (!apellidos.trim()) {
            Alert.alert('Error', 'Los apellidos son obligatorios');
            return false;
        }
        if (!edad.trim() || isNaN(edad) || parseInt(edad) < 18) {
            Alert.alert('Error', 'La edad debe ser un número mayor a 18 años');
            return false;
        }
        if (!dui.trim()) {
            Alert.alert('Error', 'El DUI es obligatorio');
            return false;
        }
        if (!telefono.trim()) {
            Alert.alert('Error', 'El teléfono es obligatorio');
            return false;
        }
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Error', 'Ingresa un correo electrónico válido');
            return false;
        }
        if (!password.trim() || password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        return true;
    };

    /**
     * Manejar el guardado del cliente
     */
    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        
        const clienteData = {
            nombre: nombre.trim(),
            apellido: apellidos.trim(),
            edad: parseInt(edad),
            dui: dui.trim(),
            telefono: telefono.trim(),
            email: email.trim().toLowerCase(),
            direccion: {
                calle: direccionCompleta.trim(),
                ciudad: ciudad.trim(),
                departamento: departamento.trim()
            },
            estado: estado,
            password: password.trim()
        };

        try {
            await onSave(clienteData);
            clearForm();
            onClose();
        } catch (error) {
            console.error('Error al guardar cliente:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cerrar modal y limpiar formulario
     */
    const handleClose = () => {
        clearForm();
        onClose();
    };

    /**
     * Renderizar campo de entrada de texto
     */
    const renderTextInput = (label, value, onChangeText, placeholder, required = false, keyboardType = 'default', multiline = false) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
                style={[styles.textInput, multiline && styles.multilineInput]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
            />
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
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Contraseña para acceder al sistema"
                    placeholderTextColor="#999999"
                    secureTextEntry={!showPassword}
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
            <Text style={styles.inputHint}>Debe tener al menos 6 caracteres</Text>
        </View>
    );

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
                        estado === 'activo' && styles.estadoOptionSelected
                    ]}
                    onPress={() => setEstado('activo')}
                >
                    <Text style={[
                        styles.estadoText,
                        estado === 'activo' && styles.estadoTextSelected
                    ]}>
                        Activo
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.estadoOption,
                        estado === 'inactivo' && styles.estadoOptionSelected
                    ]}
                    onPress={() => setEstado('inactivo')}
                >
                    <Text style={[
                        styles.estadoText,
                        estado === 'inactivo' && styles.estadoTextSelected
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
                                    {renderTextInput('Nombre Completo', nombre, setNombre, 'Ej: María Elena', true)}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Apellidos', apellidos, setApellidos, 'Ej: Rodríguez Pérez', true)}
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Edad', edad, setEdad, '25', true, 'numeric')}
                                    <Text style={styles.inputHint}>Edad mínima: 18 años</Text>
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Número de DUI', dui, setDui, '12345678-9', true)}
                                    <Text style={styles.inputHint}>Formato: 12345678-9</Text>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Teléfono', telefono, setTelefono, '+503 78901234', true, 'phone-pad')}
                                    <Text style={styles.inputHint}>Ingrese 8 dígitos. Ej: 78901234</Text>
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Correo Electrónico', email, setEmail, 'maria.rodriguez@email.com', true, 'email-address')}
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
                                    {renderTextInput('Departamento', departamento, setDepartamento, 'San Salvador')}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Ciudad/Municipio', ciudad, setCiudad, 'San Salvador')}
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
        marginBottom: 10,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 10,
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
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    inputHint: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 4,
        margin: 5
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