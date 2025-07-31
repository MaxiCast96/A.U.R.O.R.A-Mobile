import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

/**
 * Pantalla de Login
 * 
 * Esta pantalla permite a los usuarios iniciar sesión en la aplicación.
 * Utiliza el AuthContext para manejar la autenticación y conecta
 * directamente con el backend de la óptica.
 * 
 * Funcionalidades:
 * - Validación de campos
 * - Conexión con API de login
 * - Manejo de errores
 * - Navegación a pantalla principal
 */
const Login = () => {
    const navigation = useNavigation();
    const { login, isLoading } = useAuth();
    
    // Estados para los campos del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    /**
     * Validar los campos del formulario
     */
    const validateForm = () => {
        const newErrors = {};

        // Validar email
        if (!email) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'El email no es válido';
        }

        // Validar contraseña
        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Manejar el envío del formulario
     */
    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const result = await login(email, password);

            if (result.success) {
                // Login exitoso - navegar al Main
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            } else {
                // Mostrar error
                Alert.alert('Error', result.message);
            }
        } catch (err) {
            Alert.alert('Error', 'Error al iniciar sesión. Inténtalo de nuevo.');
        }
    };

    /**
     * Manejar navegación al registro
     */
    const handleGoToRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header con logo y título */}
            <View style={styles.header}>
                <Text style={styles.title}>Óptica La Inteligente</Text>
                <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
            </View>

            {/* Formulario de login */}
            <View style={styles.form}>
                <Input
                    label="Email"
                    placeholder="Ingresa tu email"
                    value={email}
                    onChangeText={setEmail}
                    icon="mail-outline"
                    error={errors.email}
                />

                <Input
                    label="Contraseña"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    icon="lock-closed-outline"
                    error={errors.password}
                />

                {/* Botón de login */}
                <Button
                    title="Iniciar Sesión"
                    onPress={handleLogin}
                    variant="primary"
                    size="large"
                    disabled={isLoading}
                    style={styles.loginButton}
                />

                {/* Botón de registro */}
                <Button
                    title="¿No tienes cuenta? Regístrate"
                    onPress={handleGoToRegister}
                    variant="outline"
                    size="medium"
                    style={styles.registerButton}
                />
            </View>

            {/* Información adicional */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Al iniciar sesión, aceptas nuestros términos y condiciones
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // Contenedor del contenido scrolleable
    contentContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    
    // Header con título
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    
    // Título principal
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#009BBF',
        marginBottom: 8,
        textAlign: 'center',
    },
    
    // Subtítulo
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    
    // Contenedor del formulario
    form: {
        marginBottom: 30,
    },
    
    // Botón de login
    loginButton: {
        marginTop: 20,
        marginBottom: 16,
    },
    
    // Botón de registro
    registerButton: {
        marginBottom: 20,
    },
    
    // Footer con información
    footer: {
        alignItems: 'center',
    },
    
    // Texto del footer
    footerText: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default Login; 