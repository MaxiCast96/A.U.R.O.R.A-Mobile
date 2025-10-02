import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

/**
 * Componente ProfilePhoto
 * 
 * Maneja la foto de perfil del usuario con funcionalidades de:
 * - Mostrar foto actual desde Cloudinary
 * - Tomar foto con cámara
 * - Seleccionar desde galería
 * - Subida DIRECTA a Cloudinary (sin pasar por backend)
 * 
 * Props:
 * @param {string} photoUrl - URL actual de la foto de perfil
 * @param {Function} onPhotoChange - Callback cuando se actualiza la foto
 * @param {boolean} editable - Si la foto se puede editar
 */
const ProfilePhoto = ({ photoUrl, onPhotoChange, editable = true }) => {
    const [uploading, setUploading] = useState(false);
    const [localImageUri, setLocalImageUri] = useState(null);

    /**
     * Solicitar permisos para acceder a cámara y galería
     */
    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
                Alert.alert(
                    'Permisos requeridos',
                    'Necesitamos permisos para acceder a la cámara y galería de fotos.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        }
        return true;
    };

    /**
     * Mostrar opciones para seleccionar foto
     */
    const showImagePicker = () => {
        if (!editable) return;

        Alert.alert(
            'Cambiar foto de perfil',
            'Selecciona una opción',
            [
                {
                    text: 'Cámara',
                    onPress: () => pickImage('camera'),
                    style: 'default'
                },
                {
                    text: 'Galería',
                    onPress: () => pickImage('gallery'),
                    style: 'default'
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        );
    };

    /**
     * Seleccionar imagen desde cámara o galería
     */
    const pickImage = async (source) => {
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        try {
            let result;

            const options = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: false,
            };

            if (source === 'camera') {
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets && result.assets[0]) {
                const selectedImage = result.assets[0];
                console.log('Imagen seleccionada:', selectedImage.uri);
                setLocalImageUri(selectedImage.uri);
                await uploadImageToCloudinary(selectedImage.uri);
            }
        } catch (error) {
            console.error('Error al seleccionar imagen:', error);
            Alert.alert(
                'Error',
                'No se pudo seleccionar la imagen. Intenta nuevamente.',
                [{ text: 'Entendido', style: 'default' }]
            );
        }
    };

    /**
     * Subir imagen DIRECTAMENTE a Cloudinary usando preset unsigned
     */
    const uploadImageToCloudinary = async (imageUri) => {
        try {
            setUploading(true);
            console.log('Subiendo imagen a Cloudinary:', imageUri);

            const formData = new FormData();
            
            const filename = imageUri.split('/').pop() || `profile_${Date.now()}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            // Usar el preset configurado en Cloudinary
            formData.append('upload_preset', 'empleados_unsigned');
            
            // Opcional: agregar carpeta específica para fotos de perfil
            formData.append('folder', 'empleados/perfiles');

            console.log('Enviando a Cloudinary con preset: empleados_unsigned');

            // Subir directamente a Cloudinary
            const response = await fetch(
                'https://api.cloudinary.com/v1_1/dv6zckgk4/image/upload',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                    },
                    body: formData,
                }
            );

            const responseData = await response.json();
            console.log('Respuesta de Cloudinary:', responseData);

            if (response.ok && responseData.secure_url) {
                const cloudinaryUrl = responseData.secure_url;
                console.log('Imagen subida exitosamente:', cloudinaryUrl);

                // Llamar al callback con la nueva URL
                // El callback (updateProfilePhoto) se encargará de actualizar el backend
                onPhotoChange && onPhotoChange(cloudinaryUrl);
                setLocalImageUri(null);

                Alert.alert(
                    'Éxito',
                    'Foto de perfil actualizada correctamente.',
                    [{ text: 'Perfecto', style: 'default' }]
                );
            } else {
                console.error('Error de Cloudinary:', responseData);
                throw new Error(responseData.error?.message || 'Error al subir imagen');
            }
        } catch (error) {
            console.error('Error al subir imagen:', error);
            Alert.alert(
                'Error de subida',
                `No se pudo actualizar la foto de perfil: ${error.message}`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Reintentar', onPress: () => uploadImageToCloudinary(imageUri) }
                ]
            );
            setLocalImageUri(null);
        } finally {
            setUploading(false);
        }
    };

    /**
     * Obtener la URI de la imagen a mostrar
     */
    const getImageSource = () => {
        if (localImageUri) {
            return { uri: localImageUri };
        }

        if (photoUrl) {
            return { uri: photoUrl };
        }

        return null;
    };

    const imageSource = getImageSource();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.photoContainer}
                onPress={showImagePicker}
                disabled={!editable || uploading}
                activeOpacity={0.8}
            >
                {/* Imagen de perfil */}
                <View style={styles.imageContainer}>
                    {imageSource ? (
                        <Image
                            source={imageSource}
                            style={styles.profileImage}
                            onError={(error) => {
                                console.log('Error cargando imagen:', error.nativeEvent.error);
                            }}
                            onLoad={() => {
                                console.log('Imagen cargada correctamente');
                            }}
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Ionicons name="person" size={48} color="#FFFFFF" />
                        </View>
                    )}

                    {/* Overlay de carga */}
                    {uploading && (
                        <View style={styles.uploadingOverlay}>
                            <View style={styles.uploadingIndicator}>
                                <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
                                <Text style={styles.uploadingText}>Subiendo...</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Botón de editar */}
                {editable && !uploading && (
                    <View style={styles.editButton}>
                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                    </View>
                )}

                {/* Indicador de carga */}
                {uploading && (
                    <View style={styles.loadingButton}>
                        <Ionicons name="hourglass" size={16} color="#FFFFFF" />
                    </View>
                )}
            </TouchableOpacity>

            {/* Texto informativo */}
            {editable && (
                <Text style={styles.helpText}>
                    Toca para cambiar foto
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 24,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    imageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        backgroundColor: '#E5E7EB',
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        marginTop: 8,
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    loadingButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#666666',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    helpText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'center',
        marginTop: 4,
    },
});

export default ProfilePhoto;