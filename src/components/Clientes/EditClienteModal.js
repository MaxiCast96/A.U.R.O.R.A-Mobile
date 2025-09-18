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
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEditCliente } from '../../hooks/useCliente/useEditCliente';

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
    const {
        // Estados del formulario - Información Personal
        nombre,
        setNombre,
        apellido,
        setApellido,
        edad,
        setEdad,
        dui,
        setDui,
        telefono,
        setTelefono,
        correo,
        setCorreo,
        
        // Estados del formulario - Información de Residencia
        departamento,
        setDepartamento,
        ciudad,
        setCiudad,
        direccionCompleta,
        setDireccionCompleta,
        
        // Estados del formulario - Estado y Seguridad
        estado,
        setEstado,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        
        // Estados de control
        loading,
        
        // Funciones
        loadClienteData,
        hasChanges,
        clearForm,
        updateCliente
    } = useEditCliente();

    // Cargar datos del cliente cuando se abre el modal
    useEffect(() => {
        if (visible && cliente) {
            loadClienteData(cliente);
        }
    }, [visible, cliente]);

    /**
     * Manejar el guardado del cliente
     */
    const handleSave = async () => {
        const success = await updateCliente((updatedCliente) => {
            if (onSuccess) {
                onSuccess(updatedCliente);
            }
            onClose();
        });
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
     * Renderizar campo de entrada de texto
     */
    const renderTextInput = (label, value, onChangeText, placeholder, required = false, keyboardType = 'default', multiline = false, editable = true) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
                style={[
                    styles.textInput, 
                    multiline && styles.multilineInput,
                    !editable && styles.disabledInput
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                editable={editable}
            />
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
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Dejar vacío si no desea cambiar"
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
            <Text style={styles.inputHint}>Dejar vacío para mantener la contraseña actual</Text>
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
                                    {renderTextInput('Nombre', nombre, setNombre, 'Ej: María Elena', true)}
                                </View>
                                <View style={styles.halfWidth}>
                                    {renderTextInput('Apellido', apellido, setApellido, 'Ej: Rodríguez Pérez', true)}
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
                                    {renderTextInput('Correo Electrónico', correo, setCorreo, 'maria.rodriguez@email.com', true, 'email-address')}
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