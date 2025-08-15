import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Componente ProfileSection
 * 
 * Agrupa campos relacionados del perfil en secciones organizadas
 * con títulos y estilos consistentes.
 * 
 * Props:
 * @param {string} title - Título de la sección
 * @param {string} subtitle - Subtítulo opcional de la sección
 * @param {ReactNode} children - Campos y contenido de la sección
 * @param {string} backgroundColor - Color de fondo personalizado
 */
const ProfileSection = ({ 
    title, 
    subtitle, 
    children, 
    backgroundColor = '#FFFFFF' 
}) => {
    return (
        <View style={styles.container}>
            {/* Header de la sección */}
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && (
                    <Text style={styles.subtitle}>{subtitle}</Text>
                )}
            </View>

            {/* Contenido de la sección */}
            <View style={[styles.content, { backgroundColor }]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        marginBottom: 24,
    },
    
    // Header de la sección
    header: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    
    // Título de la sección
    title: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    
    // Subtítulo de la sección
    subtitle: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#999999',
        lineHeight: 18,
    },
    
    // Contenido de la sección
    content: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
});

export default ProfileSection;