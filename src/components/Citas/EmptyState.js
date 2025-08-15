import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente EmptyState
 * 
 * Muestra un estado vacío elegante cuando no hay citas programadas,
 * siguiendo la estética moderna de la aplicación.
 * 
 * Props:
 * @param {string} title - Título del estado vacío (opcional)
 * @param {string} subtitle - Subtítulo del estado vacío (opcional)
 * @param {string} icon - Nombre del ícono a mostrar (opcional)
 */
const EmptyState = ({ 
    title = "No hay citas programadas", 
    subtitle = "Las citas aparecerán aquí cuando sean programadas",
    icon = "calendar-outline"
}) => {
    return (
        <View style={styles.container}>
            {/* Ícono principal */}
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={64} color="#A4D5DD" />
            </View>
            
            {/* Contenido de texto */}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            
            {/* Elementos decorativos */}
            <View style={styles.decorativeElements}>
                <View style={[styles.decorativeCircle, styles.circle1]} />
                <View style={[styles.decorativeCircle, styles.circle2]} />
                <View style={[styles.decorativeCircle, styles.circle3]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
        position: 'relative',
    },
    
    // Contenedor del ícono
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        borderStyle: 'dashed',
    },
    
    // Contenedor del texto
    textContainer: {
        alignItems: 'center',
        maxWidth: 280,
    },
    
    // Título del estado vacío
    title: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
        lineHeight: 28,
    },
    
    // Subtítulo del estado vacío
    subtitle: {
        fontSize: 15,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
    },
    
    // Elementos decorativos
    decorativeElements: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: -1,
    },
    
    // Círculo decorativo base
    decorativeCircle: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.1,
    },
    
    // Primer círculo decorativo
    circle1: {
        width: 80,
        height: 80,
        backgroundColor: '#009BBF',
        top: '20%',
        left: '10%',
    },
    
    // Segundo círculo decorativo
    circle2: {
        width: 60,
        height: 60,
        backgroundColor: '#49AA4C',
        bottom: '25%',
        right: '15%',
    },
    
    // Tercer círculo decorativo
    circle3: {
        width: 40,
        height: 40,
        backgroundColor: '#D0155F',
        top: '15%',
        right: '20%',
    },
});

export default EmptyState;