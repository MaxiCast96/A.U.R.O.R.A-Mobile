import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Importación del hook personalizado
import { useProfile } from '../hooks/useProfile';

// Importación de componentes separados
import ProfilePhoto from '../components/Profile/ProfilePhoto';
import EditableField from '../components/Profile/EditableField';
import ProfileSection from '../components/Profile/ProfileSection';
import SaveStatus from '../components/Profile/SaveStatus';

const Profile = () => {
    const { logout } = useAuth();
    const navigation = useNavigation();
    
    // Uso del hook personalizado para obtener todos los estados y funciones
    const {
        // Estados de datos
        profileData,
        loading,
        refreshing,
        
        // Estados de guardado
        saveStatus,
        saveMessage,
        
        // Funciones de datos
        updateProfileField,
        updateProfilePhoto,
        onRefresh,
        
        // Funciones de utilidad
        getUserData,
        getSucursalDisplay
    } = useProfile();

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleChangePassword = () => {
        const userData = getUserData();
        Alert.alert(
            'Cambiar Contraseña',
            'Se enviará un código de verificación a tu correo registrado para confirmar el cambio de contraseña.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Continuar',
                    onPress: () => {
                        navigation.navigate('ForgotPassword', {
                            fromProfile: true,
                            prefilledEmail: userData.correo
                        });
                    },
                },
            ]
        );
    };

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
                    onPress: async () => {
                        await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    // Obtener datos del usuario combinados
    const userData = getUserData();

    console.log('userData:', userData);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#009BBF" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleGoBack}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                    <Text style={styles.headerSubtitle}>
                        Gestiona tu información personal
                    </Text>
                </View>
            </View>
            
            {/* Content */}
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
                {/* Estado de guardado */}
                <SaveStatus 
                    status={saveStatus}
                    message={saveMessage}
                    autoHide={true}
                />
                
                {/* Sección de foto de perfil */}
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
                
                {/* Identificación */}
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
                        value={getSucursalDisplay(userData.sucursalId)}
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
                
                {/* Acciones de Cuenta */}
                <ProfileSection 
                    title="Acciones de Cuenta"
                    subtitle="Configuraciones y opciones avanzadas"
                >
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleChangePassword}
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
                
                <View style={styles.spacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#009BBF',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
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
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#E0F7FF',
        opacity: 0.9,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    photoSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 22,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginTop: 12,
        textAlign: 'center',
    },
    roleText: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 4,
        textAlign: 'center',
    },
    actionButton: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    logoutActionButton: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FFEBEE',
    },
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFF8E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutActionIcon: {
        backgroundColor: '#FFEBEE',
    },
    actionText: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    logoutActionTitle: {
        color: '#E74C3C',
    },
    actionSubtitle: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    spacer: {
        height: 40,
    },
});

export default Profile;