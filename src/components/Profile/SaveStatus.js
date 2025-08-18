import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente SaveStatus
 * 
 * Muestra el estado actual de guardado de datos del perfil.
 * Proporciona feedback visual al usuario sobre el estado de sincronización.
 * 
 * Props:
 * @param {string} status - Estado actual ('idle', 'saving', 'saved', 'error')
 * @param {string} message - Mensaje personalizado (opcional)
 * @param {boolean} autoHide - Si debe ocultarse automáticamente
 */
const SaveStatus = ({ status = 'idle', message, autoHide = true }) => {
    const [visible, setVisible] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    /**
     * Configuración de estados
     */
    const statusConfig = {
        idle: {
            icon: null,
            color: '#666666',
            backgroundColor: 'transparent',
            message: ''
        },
        saving: {
            icon: 'sync-outline',
            color: '#009BBF',
            backgroundColor: '#F0F9FF',
            message: message || 'Guardando cambios...'
        },
        saved: {
            icon: 'checkmark-circle',
            color: '#49AA4C',
            backgroundColor: '#F0FFF4',
            message: message || 'Cambios guardados'
        },
        error: {
            icon: 'alert-circle',
            color: '#E74C3C',
            backgroundColor: '#FFF5F5',
            message: message || 'Error al guardar'
        }
    };

    /**
     * Mostrar/ocultar componente con animación
     */
    const animateVisibility = (show) => {
        if (show) {
            setVisible(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setVisible(false);
            });
        }
    };

    /**
     * Efecto para manejar cambios de estado
     */
    useEffect(() => {
        if (status === 'idle') {
            animateVisibility(false);
        } else {
            animateVisibility(true);
            
            // Auto-ocultar después de tiempo determinado
            if (autoHide && (status === 'saved' || status === 'error')) {
                const timer = setTimeout(() => {
                    animateVisibility(false);
                }, 3000);
                
                return () => clearTimeout(timer);
            }
        }
    }, [status, autoHide]);

    if (!visible) return null;

    const config = statusConfig[status];

    return (
        <Animated.View 
            style={[
                styles.container,
                { 
                    backgroundColor: config.backgroundColor,
                    opacity: fadeAnim 
                }
            ]}
        >
            <View style={styles.content}>
                {config.icon && (
                    <View style={styles.iconContainer}>
                        <Ionicons 
                            name={config.icon} 
                            size={16} 
                            color={config.color} 
                        />
                    </View>
                )}
                
                <Text style={[styles.message, { color: config.color }]}>
                    {config.message}
                </Text>
            </View>
            
            {/* Indicador de progreso para estado de guardado */}
            {status === 'saving' && (
                <View style={styles.progressIndicator}>
                    <Animated.View 
                        style={[
                            styles.progressBar,
                            { backgroundColor: config.color }
                        ]} 
                    />
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    
    // Contenido del estado
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    
    // Contenedor del ícono
    iconContainer: {
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Mensaje de estado
    message: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        textAlign: 'center',
    },
    
    // Indicador de progreso
    progressIndicator: {
        height: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
    },
    
    // Barra de progreso
    progressBar: {
        height: '100%',
        width: '100%',
    },
});

export default SaveStatus;