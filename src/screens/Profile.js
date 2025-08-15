import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Alert,
    StatusBar,
    RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Importación de componentes separados
import ProfilePhoto from '../components/Profile/ProfilePhoto';
import EditableField from '../components/Profile/EditableField';
import ProfileSection from '../components/Profile/ProfileSection';
import SaveStatus from '../components/Profile/SaveStatus';

/**
 * Pantalla de Perfil de Usuario
 * 
 * Permite visualizar y editar la información del perfil del usuario.
 * Incluye datos personales, información de contacto, datos laborales
 * y configuraciones de cuenta.
 * 
 * Funcionalidades principales:
 * - Edición de foto de perfil con Cloudinary
 * - Campos editables con validación
 * - Campos de solo lectura para datos sensibles
 * - Guardado automático de cambios
 * - Refresh manual de datos
 * - Integración con backend en Render
 * - Navegación de vuelta al Home
 */
const Profile = () => {
    const { user, updateUser, getAuthHeaders, logout } = useAuth();
    const navigation = useNavigation();
    
    // Estados principales
    const [profileData, setProfileData] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // Estado para SaveStatus
    const [saveMessage, setSaveMessage] = useState('');

    /**
     * Cargar datos del perfil desde el backend
     * Utilizando la misma estrategia que Home.js para llamadas a la API
     */
    const loadProfileData = async () => {
        try {
            setLoading(true);
            
            // Verificar que tenemos headers de autenticación
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                console.log('No hay token de autenticación disponible para perfil');
                return;
            }

            console.log('Cargando datos del perfil...');
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/user/profile', {
                method: 'GET',
                headers: headers,
            });

            console.log('Response status perfil:', response.status);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('El servidor no devolvió JSON válido para perfil');
                const textResponse = await response.text();
                console.log('Response text perfil:', textResponse);
                return;
            }

            if (response.ok) {
                const data = await response.json();
                console.log('Datos del perfil recibidos:', data);
                setProfileData(data);
            } else {
                console.log('Error en la respuesta del perfil:', response.status);
                const errorData = await response.text();
                console.log('Error data perfil:', errorData);
                
                Alert.alert(
                    'Error de conexión', 
                    'No se pudieron cargar los datos del perfil.',
                    [{ text: 'Entendido', style: 'default' }]
                );
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Reintentar', onPress: loadProfileData, style: 'default' }]
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualizar campo específico del perfil
     * Utilizando la misma estrategia de validación que Home.js
     */
    const updateProfileField = async (field, value) => {
        try {
            setSaveStatus('saving');
            setSaveMessage(`Guardando ${field}...`);
            
            // Verificar headers de autenticación
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                throw new Error('No hay token de autenticación disponible');
            }

            console.log(`Actualizando campo ${field} con valor:`, value);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/user/profile', {
                method: 'PATCH',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    [field]: value
                }),
            });

            console.log('Response status actualización:', response.status);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('El servidor no devolvió JSON válido para actualización');
                const textResponse = await response.text();
                console.log('Response text actualización:', textResponse);
                throw new Error('Respuesta del servidor no válida');
            }

            if (response.ok) {
                const updatedData = await response.json();
                console.log('Campo actualizado correctamente:', updatedData);
                
                setProfileData(prev => ({
                    ...prev,
                    [field]: value
                }));
                
                // Actualizar contexto de usuario si es necesario
                if (['nombre', 'apellido', 'correo'].includes(field)) {
                    updateUser && updateUser(updatedData);
                }
                
                // Mostrar estado de éxito
                setSaveStatus('saved');
                setSaveMessage('Cambios guardados correctamente');
                
            } else {
                console.log('Error en actualización:', response.status);
                const errorData = await response.text();
                console.log('Error data actualización:', errorData);
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al actualizar campo:', error);
            setSaveStatus('error');
            setSaveMessage('Error al guardar cambios');
            throw error; // Re-lanzar para que EditableField maneje el error
        }
    };

    /**
     * Actualizar foto de perfil
     */
    const updateProfilePhoto = async (photoUrl) => {
        try {
            setSaveStatus('saving');
            setSaveMessage('Actualizando foto de perfil...');
            
            await updateProfileField('photoUrl', photoUrl);
            
            setSaveStatus('saved');
            setSaveMessage('Foto actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar foto:', error);
            setSaveStatus('error');
            setSaveMessage('Error al actualizar la foto');
            
            Alert.alert(
                'Error',
                'No se pudo actualizar la foto de perfil.',
                [{ text: 'Entendido', style: 'default' }]
            );
        }
    };

    /**
     * Refrescar datos del perfil
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadProfileData();
        setRefreshing(false);
    };

    /**
     * Navegar de vuelta al Home
     */
    const handleGoHome = () => {
        console.log('Navegando al Home...');
        navigation.navigate('Home');
    };

    /**
     * Confirmar cierre de sesión (mantener funcionalidad)
     */
    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: logout
                }
            ]
        );
    };

    /**
     * Cargar datos al montar el componente
     */
    useEffect(() => {
        loadProfileData();
    }, []);

    /**
     * Combinar datos del usuario del contexto con datos del perfil
     */
    const userData = {
        ...user,
        ...profileData
    };

    return (
        <View style={styles.container}>
            {/* Configuración de la barra de estado */}
            <StatusBar barStyle="light-content" backgroundColor="#009BBF" />
            
            {/* Header principal */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                    <Text style={styles.headerSubtitle}>
                        Gestiona tu información personal
                    </Text>
                </View>
                
                {/* Botón de volver al inicio */}
                <TouchableOpacity 
                    style={styles.homeButton}
                    onPress={handleGoHome}
                    activeOpacity={0.7}
                >
                    <Ionicons name="home-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Contenido principal */}
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#009BBF']}
                        tintColor="#009BBF"
                        title="Actualizando perfil..."
                        titleColor="#666666"
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Indicador de estado de guardado */}
                <SaveStatus 
                    status={saveStatus}
                    message={saveMessage}
                    autoHide={true}
                />

                {/* Foto de perfil */}
                <View style={styles.photoSection}>
                    <ProfilePhoto 
                        photoUrl={userData.photoUrl}
                        onPhotoChange={updateProfilePhoto}
                        editable={true}
                    />
                    <Text style={styles.welcomeText}>
                        Hola, {userData.nombre || 'Usuario'}
                    </Text>
                    <Text style={styles.roleText}>
                        {userData.cargo || 'Miembro del equipo'}
                    </Text>
                </View>

                {/* Información Personal */}
                <ProfileSection 
                    title="Información Personal"
                    subtitle="Datos básicos de tu perfil"
                >
                    <EditableField
                        label="Nombre"
                        value={userData.nombre}
                        onSave={(value) => updateProfileField('nombre', value)}
                        icon="person-outline"
                        type="text"
                        maxLength={50}
                    />
                    
                    <EditableField
                        label="Apellido"
                        value={userData.apellido}
                        onSave={(value) => updateProfileField('apellido', value)}
                        icon="person-outline"
                        type="text"
                        maxLength={50}
                    />
                    
                    <EditableField
                        label="Correo Electrónico"
                        value={userData.correo}
                        onSave={(value) => updateProfileField('correo', value)}
                        icon="mail-outline"
                        type="email"
                    />
                    
                    <EditableField
                        label="Teléfono"
                        value={userData.telefono}
                        onSave={(value) => updateProfileField('telefono', value)}
                        icon="call-outline"
                        type="phone"
                        maxLength={15}
                    />
                </ProfileSection>

                {/* Información de Identificación */}
                <ProfileSection 
                    title="Identificación"
                    subtitle="Documentos oficiales (solo lectura)"
                >
                    <EditableField
                        label="DUI"
                        value={userData.dui}
                        editable={false}
                        icon="card-outline"
                        type="dui"
                    />
                </ProfileSection>

                {/* Información Laboral */}
                <ProfileSection 
                    title="Información Laboral"
                    subtitle="Datos relacionados con tu trabajo"
                >
                    <EditableField
                        label="Cargo"
                        value={userData.cargo}
                        editable={false}
                        icon="briefcase-outline"
                        type="text"
                    />
                    
                    <EditableField
                        label="Sucursal"
                        value={userData.sucursalId?.nombre || 'No asignada'}
                        editable={false}
                        icon="business-outline"
                        type="text"
                    />
                    
                    <EditableField
                        label="Fecha de Contratación"
                        value={userData.fechaContratacion ? 
                            new Date(userData.fechaContratacion).toLocaleDateString('es-ES') : 
                            'No especificada'
                        }
                        editable={false}
                        icon="calendar-outline"
                        type="text"
                    />
                </ProfileSection>

                {/* Sección de Acciones */}
                <ProfileSection 
                    title="Acciones de Cuenta"
                    subtitle="Configuraciones y opciones avanzadas"
                >
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => Alert.alert('Cambiar contraseña', 'Funcionalidad próximamente')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.actionButtonContent}>
                            <View style={styles.actionIcon}>
                                <Ionicons name="lock-closed-outline" size={20} color="#F39C12" />
                            </View>
                            <View style={styles.actionText}>
                                <Text style={styles.actionTitle}>Cambiar Contraseña</Text>
                                <Text style={styles.actionSubtitle}>Actualiza tu contraseña de acceso</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleGoHome}
                        activeOpacity={0.7}
                    >
                        <View style={styles.actionButtonContent}>
                            <View style={[styles.actionIcon, styles.homeActionIcon]}>
                                <Ionicons name="home-outline" size={20} color="#009BBF" />
                            </View>
                            <View style={styles.actionText}>
                                <Text style={[styles.actionTitle, styles.homeActionTitle]}>
                                    Ir al Inicio
                                </Text>
                                <Text style={styles.actionSubtitle}>Volver al panel principal</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.logoutActionButton]}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <View style={styles.actionButtonContent}>
                            <View style={[styles.actionIcon, styles.logoutActionIcon]}>
                                <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
                            </View>
                            <View style={styles.actionText}>
                                <Text style={[styles.actionTitle, styles.logoutActionTitle]}>
                                    Cerrar Sesión
                                </Text>
                                <Text style={styles.actionSubtitle}>Salir de tu cuenta de forma segura</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </ProfileSection>

                {/* Espaciador para el tab bar */}
                <View style={styles.spacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    
    // Header principal
    header: {
        backgroundColor: '#009BBF',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    
    // Contenido del header
    headerContent: {
        flex: 1,
    },
    
    // Título del header
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    
    // Subtítulo del header
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#E0F7FF',
        opacity: 0.9,
    },
    
    // Botón de ir al inicio en header
    homeButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
    },
    
    // Contenido principal
    content: {
        flex: 1,
    },
    
    // Contenido del scroll
    scrollContent: {
        paddingBottom: 100,
    },
    
    // Sección de foto
    photoSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    
    // Texto de bienvenida
    welcomeText: {
        fontSize: 22,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginTop: 12,
        textAlign: 'center',
    },
    
    // Texto del rol
    roleText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 4,
        textAlign: 'center',
    },
    
    // Botón de acción
    actionButton: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    
    // Botón de acción de logout
    logoutActionButton: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FFEBEE',
    },
    
    // Contenido del botón de acción
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    
    // Ícono de acción
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFF8E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Ícono de home
    homeActionIcon: {
        backgroundColor: '#F0F9FF',
    },
    
    // Ícono de logout
    logoutActionIcon: {
        backgroundColor: '#FFEBEE',
    },
    
    // Texto de acción
    actionText: {
        flex: 1,
    },
    
    // Título de acción
    actionTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    
    // Título de home
    homeActionTitle: {
        color: '#009BBF',
    },
    
    // Título de logout
    logoutActionTitle: {
        color: '#E74C3C',
    },
    
    // Subtítulo de acción
    actionSubtitle: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    
    // Espaciador
    spacer: {
        height: 40,
    },
});

export default Profile;