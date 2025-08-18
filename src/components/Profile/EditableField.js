import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity,
    Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente EditableField
 * 
 * Campo de texto que puede alternar entre modo visualización y edición.
 * Incluye validaciones y diferentes tipos de input según el tipo de campo.
 * 
 * Props:
 * @param {string} label - Etiqueta del campo
 * @param {string} value - Valor actual del campo
 * @param {Function} onSave - Función para guardar el nuevo valor
 * @param {boolean} editable - Si el campo se puede editar
 * @param {string} type - Tipo de campo (text, email, phone, etc.)
 * @param {string} icon - Nombre del ícono a mostrar
 * @param {string} placeholder - Texto placeholder
 * @param {number} maxLength - Longitud máxima del texto
 * @param {boolean} multiline - Si permite múltiples líneas
 */
const EditableField = ({ 
    label, 
    value, 
    onSave, 
    editable = true, 
    type = 'text',
    icon,
    placeholder,
    maxLength,
    multiline = false
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value || '');
    const [saving, setSaving] = useState(false);

    /**
     * Validar el valor según el tipo de campo
     */
    const validateValue = (val) => {
        const trimmedValue = val.trim();
        
        switch (type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(trimmedValue)) {
                    return 'Ingresa un email válido';
                }
                break;
                
            case 'phone':
                const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
                if (!phoneRegex.test(trimmedValue)) {
                    return 'Ingresa un número de teléfono válido';
                }
                break;
                
            case 'dui':
                const duiRegex = /^\d{8}-\d$/;
                if (!duiRegex.test(trimmedValue)) {
                    return 'Formato de DUI inválido (########-#)';
                }
                break;
                
            case 'text':
                if (trimmedValue.length < 2) {
                    return 'Debe tener al menos 2 caracteres';
                }
                break;
        }
        
        return null; // Sin errores
    };

    /**
     * Iniciar edición
     */
    const startEditing = () => {
        if (!editable) return;
        setTempValue(value || '');
        setIsEditing(true);
    };

    /**
     * Cancelar edición
     */
    const cancelEditing = () => {
        setTempValue(value || '');
        setIsEditing(false);
    };

    /**
     * Guardar cambios
     */
    const saveChanges = async () => {
        const trimmedValue = tempValue.trim();
        
        // Validar valor
        const validationError = validateValue(trimmedValue);
        if (validationError) {
            Alert.alert('Error de validación', validationError);
            return;
        }

        // Si no hay cambios, solo cerrar edición
        if (trimmedValue === value) {
            setIsEditing(false);
            return;
        }

        try {
            setSaving(true);
            
            // Llamar función de guardado
            if (onSave) {
                await onSave(trimmedValue);
            }
            
            setIsEditing(false);
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert(
                'Error',
                'No se pudo guardar el cambio. Intenta nuevamente.',
                [{ text: 'Entendido', style: 'default' }]
            );
        } finally {
            setSaving(false);
        }
    };

    /**
     * Obtener configuración del teclado según tipo
     */
    const getKeyboardType = () => {
        switch (type) {
            case 'email':
                return 'email-address';
            case 'phone':
                return 'phone-pad';
            case 'number':
                return 'numeric';
            default:
                return 'default';
        }
    };

    /**
     * Formatear valor para mostrar
     */
    const formatDisplayValue = (val) => {
        if (!val) return 'No especificado';
        
        switch (type) {
            case 'phone':
                // Formatear teléfono con guiones si es necesario
                return val.replace(/(\d{4})(\d{4})/, '$1-$2');
            default:
                return val;
        }
    };

    return (
        <View style={styles.container}>
            {/* Etiqueta del campo */}
            <View style={styles.labelContainer}>
                {icon && (
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon} size={20} color="#009BBF" />
                    </View>
                )}
                <Text style={styles.label}>{label}</Text>
                {!editable && (
                    <View style={styles.readOnlyBadge}>
                        <Ionicons name="lock-closed" size={12} color="#666666" />
                    </View>
                )}
            </View>

            {/* Campo de valor */}
            <View style={[
                styles.fieldContainer,
                isEditing && styles.fieldContainerEditing,
                !editable && styles.fieldContainerReadOnly
            ]}>
                {isEditing ? (
                    // Modo edición
                    <View style={styles.editingContainer}>
                        <TextInput
                            style={[
                                styles.textInput,
                                multiline && styles.textInputMultiline
                            ]}
                            value={tempValue}
                            onChangeText={setTempValue}
                            placeholder={placeholder || `Ingresa ${label.toLowerCase()}`}
                            placeholderTextColor="#999999"
                            keyboardType={getKeyboardType()}
                            autoCapitalize={type === 'email' ? 'none' : 'words'}
                            autoCorrect={type !== 'email'}
                            maxLength={maxLength}
                            multiline={multiline}
                            numberOfLines={multiline ? 3 : 1}
                            editable={!saving}
                        />
                        
                        {/* Botones de acción */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={cancelEditing}
                                disabled={saving}
                            >
                                <Ionicons name="close" size={20} color="#E74C3C" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.saveButton,
                                    saving && styles.saveButtonLoading
                                ]}
                                onPress={saveChanges}
                                disabled={saving}
                            >
                                <Ionicons 
                                    name={saving ? "hourglass" : "checkmark"} 
                                    size={20} 
                                    color="#FFFFFF" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Modo visualización
                    <TouchableOpacity 
                        style={styles.displayContainer}
                        onPress={startEditing}
                        disabled={!editable}
                        activeOpacity={editable ? 0.7 : 1}
                    >
                        <Text style={[
                            styles.displayValue,
                            !value && styles.displayValueEmpty
                        ]}>
                            {formatDisplayValue(value)}
                        </Text>
                        
                        {editable && (
                            <Ionicons name="pencil" size={16} color="#666666" />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Información adicional */}
            {maxLength && isEditing && (
                <Text style={styles.characterCount}>
                    {tempValue.length}/{maxLength}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        marginBottom: 20,
    },
    
    // Contenedor de la etiqueta
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    
    // Contenedor del ícono
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Etiqueta del campo
    label: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        flex: 1,
    },
    
    // Badge de solo lectura
    readOnlyBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: '#F0F0F0',
        borderRadius: 6,
    },
    
    // Contenedor del campo
    fieldContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        overflow: 'hidden',
    },
    
    // Campo en modo edición
    fieldContainerEditing: {
        borderColor: '#009BBF',
        backgroundColor: '#FFFFFF',
    },
    
    // Campo de solo lectura
    fieldContainerReadOnly: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E0E0E0',
    },
    
    // Contenedor modo edición
    editingContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        gap: 12,
    },
    
    // Input de texto
    textInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        padding: 0,
        margin: 0,
        textAlignVertical: 'top',
    },
    
    // Input multilínea
    textInputMultiline: {
        minHeight: 60,
    },
    
    // Botones de acción
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    
    // Botón cancelar
    cancelButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    
    // Botón guardar
    saveButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#49AA4C',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Botón guardar en carga
    saveButtonLoading: {
        backgroundColor: '#666666',
    },
    
    // Contenedor modo visualización
    displayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        minHeight: 48,
    },
    
    // Valor mostrado
    displayValue: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        flex: 1,
    },
    
    // Valor vacío
    displayValueEmpty: {
        color: '#999999',
        fontStyle: 'italic',
    },
    
    // Contador de caracteres
    characterCount: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'right',
        marginTop: 4,
    },
});

export default EditableField;