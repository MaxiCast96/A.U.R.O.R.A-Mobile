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

/**
 * Pantalla de Home (Inicio) Mejorada
 * 
 * Esta pantalla muestra un dashboard completo con indicadores clave,
 * gráficas interactivas y acciones rápidas, imitando la interfaz
 * de escritorio con una experiencia móvil optimizada.
 * 
 * Funcionalidades:
 * - Acciones rápidas en la parte superior
 * - Mensaje de bienvenida personalizado
 * - Indicadores clave de rendimiento (KPI)
 * - Gráficas de ventas y estado de citas
 * - Datos reales de la API
 * - Animaciones sutiles
 * - Pull to refresh
 */
const HomeScreen = () => {
    const navigation = useNavigation(); // Hook de navegación
    const { user, getAuthHeaders } = useAuth();
    const [stats, setStats] = useState({
        totalClientes: 0,
        citasHoy: 0,
        ventasMes: 0,
        ingresosMes: 0,
        pacientesActivos: 0
    });
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadStats();
        
        // Animación de entrada
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    /**
     * Cargar estadísticas completas de la óptica
     */
    const loadStats = async () => {
        try {
            // Verificar que tenemos headers de autenticación
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
            // Mantener valores por defecto en caso de error
        }
    };

    /**
     * Función de refresh
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    /**
     * Navegación al perfil
     */
    const handleProfilePress = () => {
        console.log('Navegando a configuración de perfil...');
        navigation.navigate('More'); // Navegación a la pantalla More
    };

    /**
     * Funciones para las acciones rápidas
     */
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

    /**
     * Renderizar botón de acción rápida con degradado
     */
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
                        <Ionicons name="glasses-outline" size={24} color="#009BBF" />
                    </View>
                    
                    {/* Saludo de Bienvenida */}
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greetingText}>
                            Hola, {user?.nombre || user?.email || 'Usuario'}
                        </Text>
                    </View>
                    
                    {/* Botón de Perfil */}
                    <TouchableOpacity 
                        style={styles.profileButton}
                        onPress={handleProfilePress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="person-circle-outline" size={32} color="#666666" />
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
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    
    // Header superior con logo, saludo y perfil
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    
    // Contenedor del logo
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#009BBF',
    },
    
    // Contenedor del saludo
    greetingContainer: {
        flex: 1,
        alignItems: 'left',
        paddingHorizontal: 16,
    },
    
    // Texto del saludo
    greetingText: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'left',
    },
    
    // Botón de perfil
    profileButton: {
        padding: 4,
    },
    
    // Sección de acciones rápidas
    quickActionsSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 16,
    },
    
    // Título de acciones rápidas
    quickActionsTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    
    // Fila de acciones rápidas
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    
    // Botón de acción rápida
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
    
    // Degradado del botón de acción rápida
    quickActionGradient: {
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
    },
    
    // Texto del botón de acción rápida
    quickActionText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        marginTop: 6,
        textAlign: 'center',
        lineHeight: 14,
    },
    
    // Sección de información
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
    
    // Título de sección
    sectionTitle: {
        fontSize: 17,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    
    // Texto informativo
    infoText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        lineHeight: 22,
        marginBottom: 16,
    },
    
    // Contenedor del eslogan
    sloganContainer: {
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    
    // Texto del eslogan
    sloganText: {
        fontSize: 15,
        fontFamily: 'Lato-Bold',
        textAlign: 'center',
    },
    
    // Eslogan verde
    sloganGreen: {
        color: '#49AA4C',
    },
    
    // Eslogan rosa
    sloganPink: {
        color: '#D0155F',
    },
    
    // Sección de servicios
    servicesSection: {
        padding: 20,
        paddingTop: 0,
    },
    
    // Item de servicio
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
    
    // Título del servicio
    serviceTitle: {
        fontSize: 15,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    
    // Descripción del servicio
    serviceDescription: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        lineHeight: 20,
    },
    
    // Espaciador para el tab bar
    spacer: {
        height: 100,
    },
});

export default HomeScreen;