import React, { useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
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
 * - Si no está autenticado: navega a Welcome
 * - Si está autenticado: navega a Main
 * - Degradado superior para mayor atractivo visual
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
                handleNavigateAfterSplash();
            });
        }, 1800); // 1200ms fade in + 600ms visible

        return () => clearTimeout(timeout);
    }, [fadeAnim, navigation, isAuthenticated]);

    /**
     * Manejar la navegación después del splash screen
     */
    const handleNavigateAfterSplash = () => {
        if (isAuthenticated) {
            // Si el usuario ya está autenticado, va directo a Main
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } else {
            // Si no está autenticado, va a la pantalla de bienvenida
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Degradado superior */}
            <LinearGradient
                colors={['#A4D5DD', '#FFFFFF']}
                locations={[0, 0.7]}
                style={styles.gradient}
            />
            
            <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                <Image
                    source={require('../assets/ap.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
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
    
    // Degradado superior
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    
    logo: {
        width: 280,
        height: 180,
    },
});

export default SplashScreen;