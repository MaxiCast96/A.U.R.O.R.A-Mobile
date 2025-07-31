import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Pantalla de Home (Inicio)
 * 
 * Esta pantalla muestra un mensaje de bienvenida personalizado
 * con el nombre del usuario logueado y datos reales de la óptica.
 * 
 * Funcionalidades:
 * - Mensaje de bienvenida personalizado
 * - Datos reales del usuario
 * - Información de la óptica
 */
const HomeScreen = () => {
    const { user, getAuthHeaders } = useAuth();
    const [stats, setStats] = useState({
        totalCitas: 0,
        citasHoy: 0,
        pacientesActivos: 0
    });

    /**
     * Cargar estadísticas de la óptica
     */
    const loadStats = async () => {
        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/stats', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log('El servidor no devolvió JSON válido para estadísticas');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                console.log('No se pudieron cargar las estadísticas');
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    /**
     * Cargar estadísticas al montar el componente
     */
    useEffect(() => {
        loadStats();
    }, []);

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header con mensaje de bienvenida */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>
                    ¡Bienvenido de vuelta!
                </Text>
                <Text style={styles.userName}>
                    {user?.nombre || user?.email || 'Usuario'}
                </Text>
                <Text style={styles.subtitle}>
                    Aquí tienes un resumen de tu óptica
                </Text>
            </View>

            {/* Estadísticas rápidas */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.totalCitas || 0}</Text>
                    <Text style={styles.statLabel}>Citas Totales</Text>
                </View>
                
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.citasHoy || 0}</Text>
                    <Text style={styles.statLabel}>Citas Hoy</Text>
                </View>
                
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.pacientesActivos || 0}</Text>
                    <Text style={styles.statLabel}>Pacientes Activos</Text>
                </View>
            </View>

            {/* Información de la óptica */}
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Óptica La Inteligente</Text>
                <Text style={styles.infoText}>
                    Somos especialistas en el cuidado de tu visión. 
                    Ofrecemos servicios de calidad con la mejor tecnología 
                    para garantizar tu salud visual.
                </Text>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // Header con mensaje de bienvenida
    header: {
        padding: 20,
        backgroundColor: '#009BBF',
        paddingTop: 40,
    },
    
    // Texto de bienvenida
    welcomeText: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    
    // Nombre del usuario
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    
    // Subtítulo
    subtitle: {
        fontSize: 14,
        color: '#E0F7FF',
    },
    
    // Contenedor de estadísticas
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between',
    },
    
    // Tarjeta de estadística
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    
    // Número de estadística
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#009BBF',
        marginBottom: 4,
    },
    
    // Etiqueta de estadística
    statLabel: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },
    
    // Sección de información
    infoSection: {
        padding: 20,
        backgroundColor: '#F8F9FA',
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    
    // Título de sección
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    
    // Texto informativo
    infoText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    
    // Sección de servicios
    servicesSection: {
        padding: 20,
    },
    
    // Item de servicio
    serviceItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#009BBF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2.22,
        elevation: 3,
    },
    
    // Título del servicio
    serviceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    
    // Descripción del servicio
    serviceDescription: {
        fontSize: 14,
        color: '#666666',
    },
    
    // Espaciador para el tab bar
    spacer: {
        height: 100,
    },
});

export default HomeScreen;