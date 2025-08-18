import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
    Animated,
    TouchableOpacity,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import KPICards from '../components/Home/KPICards';
import DashboardCharts from '../components/Home/DashboardCharts';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user, getAuthHeaders } = useAuth();
    const [stats, setStats] = useState({
        totalClientes: 0,
        citasHoy: 0,
        ventasMes: 0,
        ingresosMes: 0,
        pacientesActivos: 0
    });
    const [profileData, setProfileData] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadStats();
        loadProfileData(); // Cargar datos del perfil
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    // Función para cargar los datos del perfil
    const loadProfileData = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                console.log('No hay token de autenticación disponible para perfil');
                return;
            }
            
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/empleados/${user.id}`, {
                method: 'GET',
                headers: headers,
            });
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('El servidor no devolvió JSON válido para perfil');
                return;
            }
            
            if (response.ok) {
                const data = await response.json();
                console.log('Datos del perfil cargados en Home:', data);
                setProfileData(data);
            }
        } catch (error) {
            console.error('Error al cargar perfil en Home:', error);
        }
    };

    const loadStats = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers || !headers.Authorization) {
                console.log('No hay token de autenticación disponible');
                return;
            }
            console.log('Cargando estadísticas...');
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/dashboard/all', {
                method: 'GET',
                headers: headers,
            });
            console.log('Response status:', response.status);
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('El servidor no devolvió JSON válido para estadísticas');
                const textResponse = await response.text();
                console.log('Response text:', textResponse);
                return;
            }
            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos:', data);
                setStats({
                    totalClientes: data.totalClientes || data.total_clientes || 0,
                    citasHoy: data.citasHoy || data.citas_hoy || 0,
                    ventasMes: data.ventasMes || data.ventas_mes || 0,
                    ingresosMes: data.ingresosMes || data.ingresos_mes || 0,
                    pacientesActivos: data.pacientesActivos || data.pacientes_activos || 0
                });
            } else {
                console.log('Error en la respuesta:', response.status);
                const errorData = await response.text();
                console.log('Error data:', errorData);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadStats(), loadProfileData()]);
        setRefreshing(false);
    };

    const handleProfilePress = () => {
        console.log('Navegando a configuración de perfil...');
        navigation.navigate('Profile');
    };

    const handleCreateLentes = () => {
        Alert.alert(
            'Crear Lentes',
            '¿Desea crear un nuevo registro de lentes?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Crear',
                    onPress: () => {
                        console.log('Navegando a crear lentes...');
                    }
                }
            ]
        );
    };

    const handleCreateCita = () => {
        Alert.alert(
            'Crear Cita',
            '¿Desea agendar una nueva cita?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Crear',
                    onPress: () => {
                        console.log('Navegando a crear cita...');
                    }
                }
            ]
        );
    };

    const handleCreateReceta = () => {
        Alert.alert(
            'Crear Receta',
            '¿Desea crear una nueva receta médica?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Crear',
                    onPress: () => {
                        console.log('Navegando a crear receta...');
                    }
                }
            ]
        );
    };

    const handleCreatePromocion = () => {
        Alert.alert(
            'Crear Promoción',
            '¿Desea crear una nueva promoción?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Crear',
                    onPress: () => {
                        console.log('Navegando a crear promoción...');
                    }
                }
            ]
        );
    };

    const renderQuickActionButton = (title, icon, onPress) => (
        <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={['#009BBF', '#007A9A']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={icon} size={20} color="#FFFFFF" />
                <Text style={styles.quickActionText}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    // Obtener la URL de la foto de perfil desde múltiples fuentes
    const getProfilePhotoUrl = () => {
        return profileData.photoUrl || 
               profileData.fotoPerfil || 
               user?.photoUrl || 
               user?.fotoPerfil || 
               null;
    };

    // Obtener el nombre del usuario
    const getUserName = () => {
        return profileData.nombre || 
               user?.nombre || 
               user?.email || 
               'Usuario';
    };

    const profilePhotoUrl = getProfilePhotoUrl();
    console.log('URL de foto de perfil en Home:', profilePhotoUrl);

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#009BBF']}
                    tintColor="#009BBF"
                />
            }
        >
            <Animated.View style={{ opacity: fadeAnim }}>
                {/* Header Superior con Logo, Saludo y Perfil */}
                <View style={styles.topHeader}>
                    {/* Logo de la Óptica */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../src/assets/Logo-para-fondo-blanco.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    {/* Saludo de Bienvenida */}
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greetingText}>
                            Hola, {getUserName()}
                        </Text>
                    </View>
                    {/* Botón de Perfil con foto */}
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={handleProfilePress}
                        activeOpacity={0.7}
                    >
                        {profilePhotoUrl ? (
                            <Image
                                source={{ uri: profilePhotoUrl }}
                                style={styles.profileImage}
                                resizeMode="cover"
                                onError={(error) => {
                                    console.log('Error cargando imagen de perfil:', error);
                                }}
                                onLoad={() => {
                                    console.log('Imagen de perfil cargada correctamente');
                                }}
                            />
                        ) : (
                            <Ionicons name="person-circle-outline" size={40} color="#009BBF" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Acciones Rápidas - Una sola fila */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.quickActionsTitle}>Acciones Rápidas</Text>
                    <View style={styles.quickActionsRow}>
                        {renderQuickActionButton('Crear Lentes', 'glasses-outline', handleCreateLentes)}
                        {renderQuickActionButton('Crear Cita', 'calendar-outline', handleCreateCita)}
                        {renderQuickActionButton('Crear Receta', 'medical-outline', handleCreateReceta)}
                        {renderQuickActionButton('Crear Promoción', 'pricetag-outline', handleCreatePromocion)}
                    </View>
                </View>

                {/* Indicadores Clave de Rendimiento */}
                <KPICards stats={stats} />

                {/* Gráficas del Dashboard */}
                <DashboardCharts />

                {/* Información de la óptica */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Óptica La Inteligente</Text>
                    <Text style={styles.infoText}>
                        Somos especialistas en el cuidado de tu visión.
                        Ofrecemos servicios de calidad con la mejor tecnología
                        para garantizar tu salud visual.
                    </Text>

                    {/* Información adicional con el eslogan */}
                    <View style={styles.sloganContainer}>
                        <Text style={styles.sloganText}>
                            <Text style={styles.sloganGreen}>MIRA BIEN, </Text>
                            <Text style={styles.sloganPink}>LUCE BIEN</Text>
                        </Text>
                    </View>
                </View>

                {/* Servicios destacados */}
                <View style={styles.servicesSection}>
                    <Text style={styles.sectionTitle}>Nuestros Servicios</Text>

                    <View style={styles.serviceItem}>
                        <Text style={styles.serviceTitle}>Examen de la Vista</Text>
                        <Text style={styles.serviceDescription}>
                            Evaluación completa de tu salud visual
                        </Text>
                    </View>

                    <View style={styles.serviceItem}>
                        <Text style={styles.serviceTitle}>Lentes de Contacto</Text>
                        <Text style={styles.serviceDescription}>
                            Adaptación y venta de lentes de contacto
                        </Text>
                    </View>

                    <View style={styles.serviceItem}>
                        <Text style={styles.serviceTitle}>Monturas</Text>
                        <Text style={styles.serviceDescription}>
                            Gran variedad de monturas para todos los gustos
                        </Text>
                    </View>
                </View>

                {/* Espaciador para el tab bar */}
                <View style={styles.spacer} />
            </Animated.View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#009BBF',
        overflow: 'hidden',
    },
    logo: {
        width: 40,
        height: 40,
    },
    greetingContainer: {
        flex: 1,
        alignItems: 'left',
        paddingHorizontal: 16,
    },
    greetingText: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'left',
    },
    profileButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#009BBF',
        backgroundColor: '#E5E7EB',
    },

    quickActionsSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 16,
    },
    quickActionsTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionGradient: {
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
    },
    quickActionText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        marginTop: 6,
        textAlign: 'center',
        lineHeight: 14,
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        lineHeight: 22,
        marginBottom: 16,
    },
    sloganContainer: {
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    sloganText: {
        fontSize: 15,
        fontFamily: 'Lato-Bold',
        textAlign: 'center',
    },
    sloganGreen: {
        color: '#49AA4C',
    },
    sloganPink: {
        color: '#D0155F',
    },
    servicesSection: {
        padding: 20,
        paddingTop: 0,
    },
    serviceItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#009BBF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    serviceTitle: {
        fontSize: 15,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    serviceDescription: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        lineHeight: 20,
    },
    spacer: {
        height: 100,
    },
});

export default HomeScreen;