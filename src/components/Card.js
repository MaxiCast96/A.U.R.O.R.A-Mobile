import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Componente Card reutilizable
 * 
 * Este componente permite crear tarjetas con diferentes estilos
 * y funcionalidades para mostrar información de manera organizada.
 * 
 * Props:
 * - title: Título de la tarjeta
 * - subtitle: Subtítulo opcional
 * - children: Contenido de la tarjeta
 * - onPress: Función que se ejecuta al presionar
 * - variant: 'default' | 'elevated' | 'outlined'
 * - style: estilos adicionales
 */
const Card = ({ 
    title, 
    subtitle, 
    children, 
    onPress, 
    variant = 'default',
    style = {}
}) => {
    const CardComponent = onPress ? TouchableOpacity : View;

    return (
        <CardComponent
            style={[
                styles.card,
                styles[variant],
                style
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.8 : 1}
        >
            {/* Header de la tarjeta */}
            {(title || subtitle) && (
                <View style={styles.header}>
                    {title && (
                        <Text style={styles.title}>{title}</Text>
                    )}
                    {subtitle && (
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    )}
                </View>
            )}
            
            {/* Contenido de la tarjeta */}
            <View style={styles.content}>
                {children}
            </View>
        </CardComponent>
    );
};

const styles = StyleSheet.create({
    // Estilo base de la tarjeta
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    
    // Variantes de la tarjeta
    default: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    
    elevated: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    
    outlined: {
        borderWidth: 2,
        borderColor: '#009BBF',
    },
    
    // Header de la tarjeta
    header: {
        marginBottom: 12,
    },
    
    // Título de la tarjeta
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    
    // Subtítulo de la tarjeta
    subtitle: {
        fontSize: 14,
        color: '#666666',
    },
    
    // Contenido de la tarjeta
    content: {
        flex: 1,
    },
});

export default Card; 