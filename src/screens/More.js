import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

/**
 * Pantalla de More (Más Opciones)
 * 
 * Esta pantalla muestra opciones adicionales y configuración
 * de la aplicación, incluyendo la información del usuario
 * y la opción de cerrar sesión.
 * 
 * Funcionalidades:
 * - Información del usuario logueado
 * - Opciones de configuración
 * - Cerrar sesión
 * - Navegación a otras pantallas
 */
const MoreScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();

    /**
     * Opciones del menú
     */
    const menuOptions = [
        { 
            icon: 'person-outline', 
            title: 'Perfil', 
            subtitle: 'Ver información de tu cuenta',
            onPress: () => Alert.alert('Perfil', 'Funcionalidad próximamente')
        },
        { 
            icon: 'settings-outline', 
            title: 'Configuración', 
            subtitle: 'Ajustes de la aplicación',
            onPress: () => Alert.alert('Configuración', 'Funcionalidad próximamente')
        },
        { 
            icon: 'notifications-outline', 
            title: 'Notificaciones', 
            subtitle: 'Gestionar alertas y recordatorios',
            onPress: () => Alert.alert('Notificaciones', 'Funcionalidad próximamente')
        },
        { 
            icon: 'help-circle-outline', 
            title: 'Ayuda', 
            subtitle: 'Centro de ayuda y soporte',
            onPress: () => Alert.alert('Ayuda', 'Funcionalidad próximamente')
        },
        { 
            icon: 'information-circle-outline', 
            title: 'Acerca de', 
            subtitle: 'Información de la aplicación',
            onPress: () => Alert.alert('Acerca de', 'Óptica La Inteligente v1.0.0')
        },
    ];

    /**
     * Manejar el logout
     */
    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await logout();
                            if (result.success) {
                                // Navegar al login después del logout exitoso
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Login' }],
                                });
                            } else {
                                Alert.alert('Error', result.message);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Error al cerrar sesión');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header con información del usuario */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color="#FFFFFF" />
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>
                            {user?.nombre || user?.email || 'Usuario'}
                        </Text>
                        <Text style={styles.userEmail}>
                            {user?.correo || 'usuario@optica.com'}
                        </Text>
                        <Text style={styles.userRole}>
                            {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Menú de opciones */}
            <View style={styles.menuContainer}>
                <Text style={styles.sectionTitle}>Opciones</Text>
                
                {menuOptions.map((option, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.menuItem}
                        onPress={option.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons 
                                name={option.icon} 
                                size={24} 
                                color="#009BBF" 
                                style={styles.menuIcon}
                            />
                            <View style={styles.menuText}>
                                <Text style={styles.menuTitle}>{option.title}</Text>
                                <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sección de logout */}
            <View style={styles.logoutSection}>
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>

            {/* Información de la app */}
            <View style={styles.appInfo}>
                <Text style={styles.appInfoText}>
                    Óptica La Inteligente
                </Text>
                <Text style={styles.appVersion}>
                    Versión 1.0.0
                </Text>
            </View>

            {/* Espaciador para el tab bar */}
            <View style={styles.spacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // Header con información del usuario
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#009BBF',
    },
    
    // Información del usuario
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    // Avatar del usuario
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    
    // Detalles del usuario
    userDetails: {
        flex: 1,
    },
    
    // Nombre del usuario
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    
    // Email del usuario
    userEmail: {
        fontSize: 14,
        color: '#E0F7FF',
        marginBottom: 2,
    },
    
    // Rol del usuario
    userRole: {
        fontSize: 12,
        color: '#E0F7FF',
        opacity: 0.8,
    },
    
    // Contenedor del menú
    menuContainer: {
        padding: 20,
    },
    
    // Título de sección
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    
    // Item del menú
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    
    // Lado izquierdo del item
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    
    // Icono del menú
    menuIcon: {
        marginRight: 16,
    },
    
    // Texto del menú
    menuText: {
        flex: 1,
    },
    
    // Título del menú
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    
    // Subtítulo del menú
    menuSubtitle: {
        fontSize: 12,
        color: '#666666',
    },
    
    // Sección de logout
    logoutSection: {
        padding: 20,
        paddingTop: 0,
    },
    
    // Botón de logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    
    // Texto del logout
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        marginLeft: 12,
    },
    
    // Información de la app
    appInfo: {
        alignItems: 'center',
        padding: 20,
        paddingTop: 0,
    },
    
    // Texto de información de la app
    appInfoText: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    
    // Versión de la app
    appVersion: {
        fontSize: 12,
        color: '#999999',
    },
    
    // Espaciador para el tab bar
    spacer: {
        height: 100,
    },
});

export default MoreScreen; 