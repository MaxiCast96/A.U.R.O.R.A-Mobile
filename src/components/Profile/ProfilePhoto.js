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
import { useAuth } from '../../context/AuthContext';

/**
 * Componente ProfilePhoto
 * 
 * Maneja la foto de perfil del usuario con funcionalidades de:
 * - Mostrar foto actual desde Cloudinary
 * - Tomar foto con cámara
 * - Seleccionar desde galería
 * - Subida a Cloudinary a través del backend
 * 
 * Props:
 * @param {string} photoUrl - URL actual de la foto de perfil
 * @param {Function} onPhotoChange - Callback cuando se actualiza la foto
 * @param {boolean} editable - Si la foto se puede editar
 */
const ProfilePhoto = ({ photoUrl, onPhotoChange, editable = true }) => {
    const { getAuthHeaders } = useAuth();
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
                aspect: [1, 1], // Aspecto cuadrado para foto de perfil
                quality: 0.7, // Reducir calidad para mejor rendimiento
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
                await uploadImageToBackend(selectedImage.uri);
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
     * Subir imagen al backend que luego la sube a Cloudinary
     */
    const uploadImageToBackend = async (imageUri) => {
        try {
            setUploading(true);
            console.log('Iniciando subida de imagen:', imageUri);

            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                throw new Error('No hay token de autenticación disponible');
            }

            // Crear FormData para envío multipart
            const formData = new FormData();

            // Obtener información del archivo
            const filename = imageUri.split('/').pop() || 'profile-photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            // Agregar el archivo al FormData
            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            console.log('Enviando imagen al servidor...');

            // Enviar al backend
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/upload/profile-photo', {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta del servidor:', data);

                // El backend debería devolver la URL de Cloudinary
                if (data.photoUrl || data.url || data.secure_url) {
                    const cloudinaryUrl = data.photoUrl || data.url || data.secure_url;
                    console.log('URL de Cloudinary recibida:', cloudinaryUrl);

                    // Llamar al callback con la nueva URL
                    onPhotoChange && onPhotoChange(cloudinaryUrl);
                    setLocalImageUri(null); // Limpiar imagen local

                    Alert.alert(
                        'Éxito',
                        'Foto de perfil actualizada correctamente.',
                        [{ text: 'Perfecto', style: 'default' }]
                    );
                } else {
                    throw new Error('No se recibió URL de la imagen del servidor');
                }
            } else {
                const errorText = await response.text();
                console.error('Error del servidor:', errorText);
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al subir imagen:', error);
            Alert.alert(
                'Error de subida',
                `No se pudo actualizar la foto de perfil: ${error.message}`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Reintentar', onPress: () => uploadImageToBackend(imageUri) }
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

    /**
     * Obtener las iniciales del usuario como fallback
     */
    const getInitials = (name = 'U') => {
        if (typeof name !== 'string') return 'U';

        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2) || 'U';
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
                                console.log('Error cargando imagen:', error);
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

                {/* Botón de editar (solo si es editable) */}
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
    // Contenedor principal
    container: {
        alignItems: 'center',
        marginBottom: 24,
    },

    // Contenedor de la foto
    photoContainer: {
        position: 'relative',
        marginBottom: 8,
    },

    // Contenedor de la imagen
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

    // Imagen de perfil
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        backgroundColor: '#E5E7EB',
    },

    // Contenedor placeholder para iniciales
    placeholderContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#009BBF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Overlay de carga
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

    // Indicador de subida
    uploadingIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Texto de subida
    uploadingText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        marginTop: 8,
    },

    // Botón de editar
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

    // Botón de carga
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

    // Texto de ayuda
    helpText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'center',
        marginTop: 4,
    },
});

export default ProfilePhoto;