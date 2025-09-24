import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente para mostrar estadísticas de lentes
 * 
 * Muestra cuatro tarjetas con:
 * - Total de lentes
 * - Lentes en promoción
 * - Stock total
 * - Valor del inventario
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.stats - Objeto con estadísticas { total, enPromocion, stockTotal, valorInventario }
 */
const LentesStatsCard = ({ stats }) => {
    const statsData = [
        {
            title: 'Total de Lentes',
            value: stats.total || 0,
            icon: 'glasses-outline',
            backgroundColor: '#009BBF15',
            iconColor: '#009BBF',
            textColor: '#009BBF'
        },
        {
            title: 'En Promoción',
            value: stats.enPromocion || 0,
            icon: 'pricetag-outline',
            backgroundColor: '#FF8C0015',
            iconColor: '#FF8C00',
            textColor: '#FF8C00'
        },
        {
            title: 'Stock Total',
            value: stats.stockTotal || 0,
            icon: 'cube-outline',
            backgroundColor: '#49AA4C15',
            iconColor: '#49AA4C',
            textColor: '#49AA4C'
        },
        {
            title: 'Valor Inventario',
            value: `$${(stats.valorInventario || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            icon: 'cash-outline',
            backgroundColor: '#6366F115',
            iconColor: '#6366F1',
            textColor: '#6366F1'
        }
    ];

    const renderStatCard = (stat, index) => (
        <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
                <Text style={styles.statTitle} numberOfLines={2}>{stat.title}</Text>
                <View style={[styles.iconContainer, { backgroundColor: stat.backgroundColor }]}>
                    <Ionicons name={stat.icon} size={18} color={stat.iconColor} />
                </View>
            </View>
            <Text style={[styles.statValue, { color: stat.textColor }]} numberOfLines={1}>
                {stat.value}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {statsData.map((stat, index) => renderStatCard(stat, index))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        minHeight: 85,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    statTitle: {
        fontSize: 11,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        flex: 1,
        lineHeight: 14,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
    },
    statValue: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        lineHeight: 24,
    },
});

export default LentesStatsCard;