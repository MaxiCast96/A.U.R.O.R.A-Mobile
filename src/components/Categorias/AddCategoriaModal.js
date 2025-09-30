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
import { X, Cube, Camera, CloudUpload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const AddCategoriaModal = ({ visible, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        icono: ''
    });
    const [imagen, setImagen] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
                setImagen(result.assets[0].uri);
                setFormData({...formData, icono: result.assets[0].uri});
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
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
            ...formData,
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            icono: formData.icono || ''
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
            icono: ''
        });
        setImagen(null);
        setErrors({});
        onClose();
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
                        <Cube size={24} color="#FFFFFF" />
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Nueva Categoría</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleClose}
                    >
                        <X size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Sección de Icono/Imagen */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Icono de la Categoría</Text>
                        <View style={styles.imageSection}>
                            {imagen ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: imagen }} style={styles.imagePreview} />
                                    <TouchableOpacity 
                                        style={styles.changeImageButton}
                                        onPress={seleccionarImagen}
                                    >
                                        <Camera size={20} color="#FFFFFF" />
                                        <Text style={styles.changeImageText}>Cambiar Imagen</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    style={styles.uploadImageButton}
                                    onPress={seleccionarImagen}
                                >
                                    <CloudUpload size={40} color="#009BBF" />
                                    <Text style={styles.uploadImageText}>Subir Imagen</Text>
                                    <Text style={styles.imageRecommendation}>
                                        Recomendado: 1:1 para mejor visualización
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
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