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
    Alert,
    Image
} from 'react-native';
import { X, Cube, Camera, CloudUpload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEditCategoria } from '../../hooks/useCategorias/useEditCategoria';

const EditCategoriaModal = ({ visible, categoria, onClose, onSuccess }) => {
    const {
        nombre,
        setNombre,
        descripcion,
        setDescripcion,
        icono,
        setIcono,
        loading,
        errors,
        loadCategoriaData,
        clearForm,
        validateField,
        updateCategoria
    } = useEditCategoria();

    
    useEffect(() => {
        if (visible && categoria) {
            loadCategoriaData(categoria);
        }
    }, [visible, categoria]);

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
                setIcono(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const handleSave = async () => {
        const updatedCategoria = await updateCategoria();
        if (updatedCategoria) {
            onSuccess(updatedCategoria);
        }
    };

    const handleClose = () => {
        clearForm();
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
                onChangeText={(text) => {
                    if (field === 'nombre') setNombre(text);
                    if (field === 'descripcion') setDescripcion(text);
                }}
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
                            <Text style={styles.headerTitle}>Editar Categoría</Text>
                            {categoria && (
                                <Text style={styles.headerSubtitle}>
                                    {categoria.nombre}
                                </Text>
                            )}
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
                            {icono ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: icono }} style={styles.imagePreview} />
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
                                    <CloudUpload size={40} color="#49AA4C" />
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
                        
                        {renderTextInput('Nombre de la Categoría', nombre, 'nombre', 'Nombre de la categoría')}
                        {renderTextInput('Descripción', descripcion, 'descripcion', 'Descripción de la categoría')}
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
                        style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.updateButtonText}>
                            {loading ? 'Actualizando...' : 'Actualizar'}
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
        backgroundColor: '#49AA4C',
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
        color: '#49AA4C',
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
        backgroundColor: '#49AA4C',
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
    updateButton: {
        flex: 2,
        paddingVertical: 14,
        backgroundColor: '#49AA4C',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateButtonDisabled: {
        backgroundColor: '#999999',
    },
    updateButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default EditCategoriaModal;