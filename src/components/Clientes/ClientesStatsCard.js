import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente para mostrar estadísticas de clientes
 * 
 * Muestra tres tarjetas con:
 * - Total de clientes
 * - Clientes activos  
 * - Clientes inactivos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.stats - Objeto con estadísticas { total, activos, inactivos }
 */
const ClientesStatsCard = ({ stats }) => {
    const statsData = [
        {
            title: 'Total Clientes',
            value: stats.total,
            icon: 'people-outline',
            backgroundColor: '#009BBF15',
            iconColor: '#009BBF',
            textColor: '#009BBF'
        },
        {
            title: 'Clientes Activos',
            value: stats.activos,
            icon: 'checkmark-circle-outline',
            backgroundColor: '#49AA4C15',
            iconColor: '#49AA4C',
            textColor: '#49AA4C'
        },
        {
            title: 'Clientes Inactivos',
            value: stats.inactivos,
            icon: 'close-circle-outline',
            backgroundColor: '#D0155F15',
            iconColor: '#D0155F',
            textColor: '#D0155F'
        }
    ];

    const renderStatCard = (stat, index) => (
        <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <View style={[styles.iconContainer, { backgroundColor: stat.backgroundColor }]}>
                    <Ionicons name={stat.icon} size={20} color={stat.iconColor} />
                </View>
            </View>
            <Text style={[styles.statValue, { color: stat.textColor }]}>
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
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statTitle: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        flex: 1,
        lineHeight: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    statValue: {
        fontSize: 28,
        fontFamily: 'Lato-Bold',
        lineHeight: 32,
    },
});

export default ClientesStatsCard;