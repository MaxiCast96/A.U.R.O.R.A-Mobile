import React, { useRef, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

/**
 * Pantalla de Splash (Carga Inicial)
 * 
 * Esta pantalla se muestra al abrir la aplicación y muestra
 * el logo de la óptica con una animación de fade in/out.
 * Después de la animación, navega automáticamente según el
 * estado de autenticación del usuario.
 * 
 * Características:
 * - Animación de fade in/out
 * - Logo de la óptica
 * - Navegación automática según autenticación
 */
const SplashScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated } = useAuth();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
        }).start();

        // Espera, luego fade out y navega
        const timeout = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                // Navegar según el estado de autenticación
                if (isAuthenticated) {
                    navigation.replace('Main');
                } else {
                    navigation.replace('Login');
                }
            });
        }, 1800); // 1200ms fade in + 600ms visible

        return () => clearTimeout(timeout);
    }, [fadeAnim, navigation, isAuthenticated]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                <Image
                    source={require('../assets/ap.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>ÓPTICA LA INTELIGENTE</Text>
                <Text style={styles.subtitle}>
                    MIRA BIEN, <Text style={styles.subtitleBold}>LUCE BIEN</Text>
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 250,
        height: 150,
        marginBottom: 30,
    },
    title: {
        color: '#009BBF',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        color: '#009BBF',
        fontSize: 18,
        textAlign: 'center',
    },
    subtitleBold: {
        color: '#E91E63',
        fontWeight: 'bold',
    },
});

export default SplashScreen;