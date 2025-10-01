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
    Alert,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const AddMarcaModal = ({ visible, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        paisOrigen: '',
        lineas: []
    });
    const [logo, setLogo] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const lineasOptions = ['Premium', 'Económica'];

    const seleccionarImagen = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una imagen.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setLogo(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const toggleLinea = (linea) => {
        setFormData(prev => ({
            ...prev,
            lineas: prev.lineas.includes(linea)
                ? prev.lineas.filter(l => l !== linea)
                : [...prev.lineas, linea]
        }));
    };

    const validateField = (field, value) => {
        let error = null;
        
        switch (field) {
            case 'nombre':
                if (!value?.trim()) error = 'El nombre es obligatorio';
                break;
            case 'descripcion':
                if (!value?.trim()) error = 'La descripción es obligatoria';
                break;
            case 'paisOrigen':
                if (!value?.trim()) error = 'El país de origen es obligatorio';
                break;
            case 'lineas':
                if (!value || value.length === 0) error = 'Debe seleccionar al menos una línea';
                break;
        }
        
        setErrors(prev => ({ ...prev, [field]: error }));
        return !error;
    };

    const validateForm = () => {
        const fieldsToValidate = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            paisOrigen: formData.paisOrigen,
            lineas: formData.lineas,
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
            Alert.alert('Error', 'Por favor completa todos los campos requeridos correctamente');
            return;
        }

        setLoading(true);
        
        const marcaData = {
            ...formData,
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            paisOrigen: formData.paisOrigen.trim(),
            logo: logo
        };

        try {
            await onAdd(marcaData);
            handleClose();
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la marca');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            paisOrigen: '',
            lineas: []
        });
        setLogo(null);
        setErrors({});
        onClose();
    };

    const renderTextInput = (label, value, field, placeholder, multiline = false) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
                style={[
                    styles.textInput,
                    multiline && styles.textArea,
                    errors[field] && styles.inputError
                ]}
                value={value}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
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
                        <Ionicons name="business" size={24} color="#FFFFFF" />
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Nueva Marca</Text>
                            <Text style={styles.headerSubtitle}>Agregar nueva marca al catálogo</Text>
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
                    {/* Sección de Logo */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Logo de la Marca</Text>
                        <View style={styles.imageSection}>
                            {logo ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: logo }} style={styles.imagePreview} />
                                    <TouchableOpacity 
                                        style={styles.changeImageButton}
                                        onPress={seleccionarImagen}
                                    >
                                        <Ionicons name="camera" size={20} color="#FFFFFF" />
                                        <Text style={styles.changeImageText}>Cambiar Logo</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    style={styles.uploadImageButton}
                                    onPress={seleccionarImagen}
                                >
                                    <Ionicons name="cloud-upload" size={40} color="#009BBF" />
                                    <Text style={styles.uploadImageText}>Subir Logo</Text>
                                    <Text style={styles.imageRecommendation}>
                                        Recomendado: Imagen cuadrada para mejor visualización
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Información Básica */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información Básica</Text>
                        
                        {renderTextInput('Nombre de la Marca', formData.nombre, 'nombre', 'Ej: Ray-Ban, Oakley')}
                        {renderTextInput('País de Origen', formData.paisOrigen, 'paisOrigen', 'Ej: Estados Unidos, Italia')}
                        {renderTextInput('Descripción', formData.descripcion, 'descripcion', 'Descripción de la marca y sus productos...', true)}
                    </View>

                    {/* Líneas de Productos */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Líneas de Productos</Text>
                        <Text style={styles.sectionSubtitle}>
                            Selecciona las líneas de productos que maneja esta marca
                        </Text>
                        
                        <View style={styles.lineasContainer}>
                            {lineasOptions.map((linea) => {
                                const isSelected = formData.lineas.includes(linea);
                                return (
                                    <TouchableOpacity
                                        key={linea}
                                        style={[
                                            styles.lineaOption,
                                            isSelected && styles.lineaOptionSelected
                                        ]}
                                        onPress={() => toggleLinea(linea)}
                                    >
                                        <View style={[
                                            styles.lineaCheckbox,
                                            isSelected && styles.lineaCheckboxSelected
                                        ]}>
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                            )}
                                        </View>
                                        <Text style={[
                                            styles.lineaText,
                                            isSelected && styles.lineaTextSelected
                                        ]}>
                                            {linea}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {errors.lineas && (
                            <Text style={styles.errorText}>{errors.lineas}</Text>
                        )}
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
                            {loading ? 'Creando...' : 'Crear Marca'}
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
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginBottom: 16,
    },
    imageSection: {
        alignItems: 'center',
    },
    uploadImageButton: {
        width: '100%',
        height: 150,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        borderStyle: 'dashed',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    uploadImageText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
        marginTop: 8,
    },
    imageRecommendation: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'center',
        marginTop: 4,
    },
    imagePreviewContainer: {
        width: '100%',
        alignItems: 'center',
    },
    imagePreview: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginBottom: 12,
    },
    changeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#009BBF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    changeImageText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
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
    },
    textArea: {
        height: 100,
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
    lineasContainer: {
        gap: 12,
    },
    lineaOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    lineaOptionSelected: {
        backgroundColor: '#009BBF15',
        borderColor: '#009BBF',
    },
    lineaCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#CCCCCC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: '#F8F9FA',
    },
    lineaCheckboxSelected: {
        backgroundColor: '#009BBF',
        borderColor: '#009BBF',
    },
    lineaText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        flex: 1,
    },
    lineaTextSelected: {
        color: '#009BBF',
        fontFamily: 'Lato-Bold',
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

export default AddMarcaModal;