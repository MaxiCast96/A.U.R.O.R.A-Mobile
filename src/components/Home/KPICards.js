import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente de Tarjetas KPI
 * 
 * Este componente muestra los indicadores clave de rendimiento
 * con animaciones sutiles y iconos representativos.
 * 
 * Props:
 * - stats: objeto con las estadísticas (totalClientes, citasHoy, ventasMes, ingresosMes)
 */
const KPICards = ({ stats }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    /**
     * Formatear números para mostrar
     */
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    /**
     * Formatear moneda
     */
    const formatCurrency = (amount) => {
        return `$${formatNumber(amount)}`;
    };

    /**
     * Renderizar tarjeta KPI individual
     */
    const renderKPICard = (title, value, icon, color, isLast = false) => (
        <Animated.View 
            style={[
                styles.kpiCard,
                isLast && styles.lastCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.kpiHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={styles.kpiTitle}>{title}</Text>
            </View>
            <Text style={[styles.kpiValue, { color }]}>{value}</Text>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Indicadores Clave de Rendimiento</Text>
            <View style={styles.kpiGrid}>
                {renderKPICard(
                    'Total Clientes', 
                    formatNumber(stats.totalClientes || 0), 
                    'people-outline', 
                    '#009BBF'
                )}
                {renderKPICard(
                    'Citas Hoy', 
                    formatNumber(stats.citasHoy || 0), 
                    'calendar-outline', 
                    '#009BBF'
                )}
                {renderKPICard(
                    'Ventas del Mes', 
                    formatNumber(stats.ventasMes || 0), 
                    'bag-outline', 
                    '#009BBF'
                )}
                {renderKPICard(
                    'Ingresos del Mes', 
                    formatCurrency(stats.ingresosMes || 0), 
                    'cash-outline', 
                    '#009BBF',
                    true
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    kpiCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#009BBF',
    },
    lastCard: {
        marginBottom: 0,
    },
    kpiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    kpiTitle: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        flex: 1,
    },
    kpiValue: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#009BBF',
    },
});

export default KPICards;