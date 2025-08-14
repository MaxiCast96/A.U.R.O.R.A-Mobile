import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';

/**
 * Pantalla de Bienvenida
 * 
 * Esta pantalla es la primera que ve el usuario al abrir la aplicación.
 * Permite elegir entre iniciar sesión o registrarse.
 * 
 * Funcionalidades:
 * - Navegación al Login
 * - Navegación al Register
 * - Diseño atractivo con logo de la óptica
 * - Degradado superior para mayor atractivo visual
 */
const Welcome = () => {
    const navigation = useNavigation();

    /**
     * Navegar a la pantalla de Login
     */
    const handleGoToLogin = () => {
        navigation.navigate('Login');
    };

    /**
     * Navegar a la pantalla de Register
     */
    const handleGoToRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Degradado superior */}
            <LinearGradient
                colors={['#A4D5DD', '#FFFFFF']}
                locations={[0, 0.6]}
                style={styles.gradient}
            />
            
            <View style={styles.content}>
                {/* Logo de la óptica */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/ojo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Título y mensaje de bienvenida */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.title}>
                        ¡BIENVENIDO A ÓPTICA LA INTELIGENTE!
                    </Text>
                    <Text style={styles.subtitle}>
                        ¡Selecciona tu opción para comenzar!
                    </Text>
                </View>

                {/* Botones de acción */}
                <View style={styles.buttonsContainer}>
                    <Button
                        title="Registrarse"
                        onPress={handleGoToRegister}
                        variant="outline"
                        size="large"
                        style={styles.registerButton}
                    />
                    
                    <Button
                        title="Iniciar sesión"
                        onPress={handleGoToLogin}
                        variant="primary"
                        size="large"
                        style={styles.loginButton}
                    />
                </View>

                {/* Indicador inferior */}
                <View style={styles.indicator} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // Degradado superior
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '60%',
    },
    
    // Contenedor del contenido
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    
    // Contenedor del logo
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    
    // Logo
    logo: {
        width: 240,
        height: 160,
        marginBottom: 20,
    },
    
    // Contenedor de bienvenida
    welcomeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        maxWidth: 400,
    },
    
    // Título principal
    title: {
        fontFamily: 'Lato', 
        fontSize: 30,
        fontWeight: 'bold',
        color: '#009BBF',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 32,
        letterSpacing: 1.5,
    },
    
    // Subtítulo
    subtitle: {
        fontFamily: 'Lato-Regular',
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    
    // Contenedor de botones
    buttonsContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    
    // Botón de registro
    registerButton: {
        marginBottom: 16,
        width: '100%',
        borderColor: '#009BBF',
        borderWidth: 2,
    },
    
    // Botón de login
    loginButton: {
        width: '100%',
        backgroundColor: '#009BBF',
    },
    
    // Indicador inferior
    indicator: {
        width: 60,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginBottom: 20,
    },
});

export default Welcome;