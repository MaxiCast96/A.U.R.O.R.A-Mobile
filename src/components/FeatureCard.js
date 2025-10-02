import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Componente FeatureCard
 * 
 * Tarjeta para mostrar características o beneficios de la aplicación
 * en la pantalla de bienvenida.
 * 
 * Props:
 * - icon: Identificador del ícono a mostrar ('inventory' | 'users' | 'sales')
 * - title: Título de la característica
 * - description: Descripción breve de la característica
 */
const FeatureCard = ({ icon, title, description }) => {
    // Función para obtener el ícono según el tipo
    const getIconElement = () => {
        const iconStyles = [styles.iconBase];
        
        switch(icon) {
            case 'inventory':
                return (
                    <View style={[...iconStyles, styles.iconInventory]}>
                        <View style={styles.inventoryBox}>
                            <View style={styles.inventoryLine} />
                            <View style={[styles.inventoryLine, styles.inventoryLineShort]} />
                            <View style={[styles.inventoryLine, styles.inventoryLineShort]} />
                        </View>
                    </View>
                );
            case 'users':
                return (
                    <View style={[...iconStyles, styles.iconUsers]}>
                        <View style={styles.userHead} />
                        <View style={styles.userBody} />
                    </View>
                );
            
            default:
                return <View style={iconStyles} />;
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                {getIconElement()}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    iconContainer: {
        marginRight: 16,
    },
    iconBase: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Ícono de Inventario
    iconInventory: {
        backgroundColor: '#E0F2F7',
    },
    inventoryBox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#009BBF',
        borderRadius: 4,
        padding: 4,
        justifyContent: 'space-around',
    },
    inventoryLine: {
        height: 2,
        backgroundColor: '#009BBF',
        borderRadius: 1,
    },
    inventoryLineShort: {
        width: '70%',
    },
    
    // Ícono de Usuarios
    iconUsers: {
        backgroundColor: '#E8F5E9',
    },
    userHead: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#49AA4C',
        marginBottom: 2,
    },
    userBody: {
        width: 20,
        height: 12,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: '#49AA4C',
    },
    
    // Ícono de Ventas
    iconSales: {
        backgroundColor: '#FCE4EC',
    },
    salesCart: {
        width: 24,
        height: 24,
    },
    salesHandle: {
        width: 16,
        height: 8,
        borderWidth: 2,
        borderColor: '#D01B5F',
        borderBottomWidth: 0,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        marginLeft: 4,
    },
    salesBody: {
        width: 24,
        height: 12,
        backgroundColor: '#D01B5F',
        borderRadius: 2,
    },
    
    // Textos
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: 'Lato-Bold',
        fontSize: 16,
        fontWeight: '700',
        color: '#3C3C3B',
        marginBottom: 4,
    },
    description: {
        fontFamily: 'Lato-Regular',
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
    },
});

export default FeatureCard;