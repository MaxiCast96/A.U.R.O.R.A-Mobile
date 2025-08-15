import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../components/Login/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigation = useNavigation();
    const { login, isLoading } = useAuth();

    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!correo) {
            newErrors.correo = 'El correo es requerido';
        } else if (!/\S+@\S+\.\S+/.test(correo)) {
            newErrors.correo = 'El correo no es válido';
        }
        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            const result = await login(correo, password);
            if (result) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            } else {
                Alert.alert('Error', 'Credenciales incorrectas o error de conexión');
            }
        } catch (err) {
            Alert.alert('Error', 'Error al iniciar sesión. Inténtalo de nuevo.');
        }
    };

    // Manejar el botón de "¿Olvidaste tu contraseña?"
    const handleForgotPassword = () => {
        Alert.alert(
            'Recuperar contraseña',
            'Por favor contacta al administrador para restablecer tu contraseña.'
        );
        // Si tienes una pantalla de recuperación, navega así:
        // navigation.navigate('ForgotPassword');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#A4D5DD', '#FFFFFF']}
                locations={[0, 0.5]}
                style={styles.gradient}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Óptica La Inteligente</Text>
                    <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Correo"
                        placeholder="Ingresa tu correo"
                        value={correo}
                        onChangeText={setCorreo}
                        icon="mail-outline"
                        error={errors.correo}
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

                    <Button
                        title="Iniciar Sesión"
                        onPress={handleLogin}
                        variant="primary"
                        size="large"
                        disabled={isLoading}
                        style={styles.loginButton}
                    />

                    {/* Botón de olvidaste tu contraseña */}
                    <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
                        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Al iniciar sesión, aceptas nuestros términos y condiciones
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '50%',
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#009BBF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    form: {
        marginBottom: 30,
    },
    loginButton: {
        marginTop: 20,
        marginBottom: 8,
    },
    forgotButton: {
        alignSelf: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    forgotText: {
        color: '#009BBF',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default Login;