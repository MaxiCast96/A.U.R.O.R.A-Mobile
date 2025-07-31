import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * Componente Button reutilizable
 * 
 * Este componente permite crear botones con diferentes estilos
 * y variantes para mantener consistencia en toda la aplicación.
 * 
 * Props:
 * - title: Texto del botón
 * - onPress: Función que se ejecuta al presionar
 * - variant: 'primary' | 'secondary' | 'outline'
 * - size: 'small' | 'medium' | 'large'
 * - disabled: boolean para deshabilitar el botón
 * - style: estilos adicionales
 */
const Button = ({ 
    title, 
    onPress, 
    variant = 'primary', 
    size = 'medium', 
    disabled = false,
    style = {}
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[variant],
                styles[size],
                disabled && styles.disabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Text style={[
                styles.text,
                styles[`${variant}Text`],
                styles[`${size}Text`],
                disabled && styles.disabledText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Estilo base del botón
    button: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        minWidth: 120,
    },
    
    // Variantes de color
    primary: {
        backgroundColor: '#009BBF',
    },
    secondary: {
        backgroundColor: '#6B7280',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#009BBF',
    },
    
    // Tamaños
    small: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 100,
    },
    medium: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        minWidth: 120,
    },
    large: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        minWidth: 140,
    },
    
    // Estado deshabilitado
    disabled: {
        opacity: 0.5,
    },
    
    // Texto base
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    
    // Texto por variante
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#FFFFFF',
    },
    outlineText: {
        color: '#009BBF',
    },
    
    // Texto por tamaño
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },
    
    // Texto deshabilitado
    disabledText: {
        opacity: 0.7,
    },
});

export default Button; 