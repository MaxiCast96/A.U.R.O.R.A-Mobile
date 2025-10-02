import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const KPICards = ({ stats: propStats }) => {
    const { getAuthHeaders } = useAuth();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    
    const [stats, setStats] = useState({
        totalClientes: 0,
        citasHoy: 0,
        ventasMes: 0,
        ingresosMes: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (propStats) {
            console.log('📊 KPICards recibió stats:', propStats);
            setStats(propStats);
            startAnimations();
        }
    }, [propStats]);

    const startAnimations = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    console.log('🎨 KPICards renderizando con stats:', stats);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Indicadores Clave</Text>
            
            {/* Card Principal - Ingresos */}
            <View style={styles.kpiMainCard}>
                <LinearGradient
                    colors={['#009BBF', '#007A9A']}
                    style={styles.kpiMainGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.kpiMainContent}>
                        <View>
                            <Text style={styles.kpiMainLabel}>Ingresos del Mes</Text>
                            <Text style={styles.kpiMainValue}>
                                ${formatNumber(stats.ingresosMes || 0)}
                            </Text>
                        </View>
                        <View style={styles.kpiMainIconContainer}>
                            <Ionicons name="cash-outline" size={32} color="#FFFFFF" />
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* Cards Secundarios - Grid 3 columnas */}
            <View style={styles.kpiSecondaryGrid}>
                <View style={styles.kpiSecondaryCard}>
                    <View style={styles.kpiSecondaryIcon}>
                        <Ionicons name="people-outline" size={24} color="#009BBF" />
                    </View>
                    <Text style={styles.kpiSecondaryValue}>
                        {formatNumber(stats.totalClientes || 0)}
                    </Text>
                    <Text style={styles.kpiSecondaryLabel}>Clientes</Text>
                </View>

                <View style={styles.kpiSecondaryCard}>
                    <View style={styles.kpiSecondaryIcon}>
                        <Ionicons name="calendar-outline" size={24} color="#009BBF" />
                    </View>
                    <Text style={styles.kpiSecondaryValue}>
                        {formatNumber(stats.citasHoy || 0)}
                    </Text>
                    <Text style={styles.kpiSecondaryLabel}>Citas Hoy</Text>
                </View>

                <View style={styles.kpiSecondaryCard}>
                    <View style={styles.kpiSecondaryIcon}>
                        <Ionicons name="bag-outline" size={24} color="#009BBF" />
                    </View>
                    <Text style={styles.kpiSecondaryValue}>
                        {formatNumber(stats.ventasMes || 0)}
                    </Text>
                    <Text style={styles.kpiSecondaryLabel}>Ventas</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    
    // Card Principal
    kpiMainCard: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#009BBF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    kpiMainGradient: {
        padding: 24,
    },
    kpiMainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    kpiMainLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 8,
    },
    kpiMainValue: {
        fontSize: 36,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    kpiMainIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Cards Secundarios
    kpiSecondaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: -4,
    },
    kpiSecondaryCard: {
        flex: 1,
        marginHorizontal: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 155, 191, 0.1)',
        shadowColor: '#009BBF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    kpiSecondaryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#009BBF10',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    kpiSecondaryValue: {
        fontSize: 22,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
        marginBottom: 4,
    },
    kpiSecondaryLabel: {
        fontSize: 11,
        fontFamily: 'Lato-Regular',
        color: '#5A6C7D',
        textAlign: 'center',
    },
});

export default KPICards;