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
import IconSelector from './IconSelector';

const AddCategoriaModal = ({ visible, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        icono: 'cube-outline'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [iconSelectorVisible, setIconSelectorVisible] = useState(false);

    const validateField = (field, value) => {
        let error = null;
        
        switch (field) {
            case 'nombre':
                if (!value?.trim()) error = 'El nombre es obligatorio';
                break;
            case 'descripcion':
                if (!value?.trim()) error = 'La descripción es obligatoria';
                break;
        }
        
        setErrors(prev => ({ ...prev, [field]: error }));
        return !error;
    };

    const validateForm = () => {
        const fieldsToValidate = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
        };

        let isValid = true;

        Object.keys(fieldsToValidate).forEach(field => {
            if (!validateField(field, fieldsToValidate[field])) {
                isValid = false;
            }
        });

        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Error', 'Por favor completa todos los campos requeridos');
            return;
        }

        const categoriaData = {
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            icono: formData.icono || 'cube-outline'
        };

        setLoading(true);
        
        try {
            const response = await fetch('https://aurora-production-7e57.up.railway.app/api/categoria', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoriaData),
            });

            if (response.ok) {
                const responseData = await response.json();
                onSubmit(responseData);
                handleClose();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear categoría');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            icono: 'cube-outline'
        });
        setErrors({});
        onClose();
    };

    const handleIconSelect = (icon) => {
        setFormData({...formData, icono: icon});
    };

    const renderTextInput = (label, value, field, placeholder, required = true) => (
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
                onChangeText={(text) => setFormData({...formData, [field]: text})}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                multiline={field === 'descripcion'}
                numberOfLines={field === 'descripcion' ? 3 : 1}
                onBlur={() => validateField(field, value)}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
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
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Ionicons name="cube" size={24} color="#FFFFFF" />
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Nueva Categoría</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Sección de Icono */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Icono de la Categoría</Text>
                        <TouchableOpacity 
                            style={styles.iconSelector}
                            onPress={() => setIconSelectorVisible(true)}
                        >
                            <View style={styles.iconPreview}>
                                <Ionicons 
                                    name={formData.icono} 
                                    size={48} 
                                    color="#009BBF" 
                                />
                            </View>
                            <View style={styles.iconSelectorText}>
                                <Text style={styles.iconSelectorLabel}>Icono seleccionado</Text>
                                <Text style={styles.iconSelectorValue}>{formData.icono}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#666666" />
                        </TouchableOpacity>
                    </View>

                    {/* Información Básica */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información Básica</Text>
                        
                        {renderTextInput('Nombre de la Categoría', formData.nombre, 'nombre', 'Nombre de la categoría')}
                        {renderTextInput('Descripción', formData.descripcion, 'descripcion', 'Descripción de la categoría')}
                    </View>

                    <View style={styles.spacer} />
                </ScrollView>

                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={handleClose}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.createButton, loading && styles.createButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.createButtonText}>
                            {loading ? 'Creando...' : 'Crear categoría'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Modal de selección de iconos */}
            <IconSelector
                visible={iconSelectorVisible}
                selectedIcon={formData.icono}
                onSelect={handleIconSelect}
                onClose={() => setIconSelectorVisible(false)}
            />
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
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    iconSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    iconPreview: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#009BBF15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconSelectorText: {
        flex: 1,
    },
    iconSelectorLabel: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginBottom: 4,
    },
    iconSelectorValue: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
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
        paddingVertical: 12,
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#DC2626',
    },
    errorText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#DC2626',
        marginTop: 4,
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
        paddingVertical: 14,
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#666666',
    },
    createButton: {
        flex: 2,
        paddingVertical: 14,
        backgroundColor: '#009BBF',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonDisabled: {
        backgroundColor: '#999999',
    },
    createButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default AddCategoriaModal;