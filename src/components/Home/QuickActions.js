import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente de Acciones Rápidas
 * 
 * Este componente muestra los botones de acciones rápidas
 * que permiten al usuario crear nuevos elementos fácilmente.
 * 
 * Props:
 * - onCreateLentes: función para crear lentes
 * - onCreateCita: función para crear cita
 * - onCreateReceta: función para crear receta
 * - onCreatePromocion: función para crear promoción
 */
const QuickActions = ({ 
    onCreateLentes, 
    onCreateCita, 
    onCreateReceta, 
    onCreatePromocion 
}) => {
    const scaleAnim = new Animated.Value(1);

    /**
     * Animación para el botón presionado
     */
    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    /**
     * Renderizar botón de acción rápida
     */
    const renderActionButton = (title, icon, onPress, color = '#009BBF') => (
        <Animated.View 
            style={[
                styles.actionButton,
                { transform: [{ scale: scaleAnim }] }
            ]}
        >
            <TouchableOpacity
                style={[styles.actionButtonInner, { backgroundColor: color }]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
            >
                <Ionicons name={icon} size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.actionsGrid}>
                {renderActionButton('Crear Lentes', 'glasses-outline', onCreateLentes)}
                {renderActionButton('Crear Cita', 'calendar-outline', onCreateCita)}
                {renderActionButton('Crear Receta', 'medical-outline', onCreateReceta)}
                {renderActionButton('Crear Promoción', 'pricetag-outline', onCreatePromocion)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    actionButton: {
        width: '48%',
        marginBottom: 12,
    },
    actionButtonInner: {
        backgroundColor: '#009BBF',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default QuickActions;