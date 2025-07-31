import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../components/Input';
import Button from '../components/Button';

/**
 * Pantalla de Registro
 * 
 * Esta pantalla permite a los usuarios registrarse en la aplicación.
 * Utiliza componentes reutilizables y conecta con el backend.
 * 
 * Funcionalidades:
 * - Validación de campos
 * - Conexión con API de registro
 * - Manejo de errores
 * - Navegación al login después del registro
 */
const Register = () => {
    const navigation = useNavigation();
    
    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    /**
     * Validar los campos del formulario
     */
    const validateForm = () => {
        const newErrors = {};

        // Validar nombre
        if (!nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (nombre.trim().length < 2) {
            newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
        }

        // Validar correo
        if (!correo) {
            newErrors.correo = 'El correo es requerido';
        } else if (!/\S+@\S+\.\S+/.test(correo)) {
            newErrors.correo = 'El correo no es válido';
        }

        // Validar contraseña
        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Validar confirmación de contraseña
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Manejar el envío del formulario
     */
    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/registroEmpleados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    correo: correo,
                    password,
                }),
            });

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('El servidor no devolvió JSON válido');
            }

            const data = await response.json();

            if (response.ok) {
                // Registro exitoso
                Alert.alert(
                    'Registro Exitoso',
                    'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]
                );
            } else {
                // Mostrar error del servidor
                Alert.alert('Error', data.message || 'Error al registrar usuario');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            
            if (error.message.includes('JSON')) {
                Alert.alert('Error', 'Error de conexión con el servidor. Verifica que el endpoint esté disponible.');
            } else {
                Alert.alert('Error', 'Error de conexión. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Manejar navegación al login
     */
    const handleGoToLogin = () => {
        navigation.navigate('Login');
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
                <Text style={styles.subtitle}>Crea tu cuenta</Text>
            </View>

            {/* Formulario de registro */}
            <View style={styles.form}>
                <Input
                    label="Nombre Completo"
                    placeholder="Ingresa tu nombre completo"
                    value={nombre}
                    onChangeText={setNombre}
                    icon="person-outline"
                    error={errors.nombre}
                />

                <Input
                    label="Correo Electrónico"
                    placeholder="Ingresa tu correo electrónico"
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

                <Input
                    label="Confirmar Contraseña"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    icon="lock-closed-outline"
                    error={errors.confirmPassword}
                />

                {/* Botón de registro */}
                <Button
                    title="Crear Cuenta"
                    onPress={handleRegister}
                    variant="primary"
                    size="large"
                    disabled={loading}
                    style={styles.registerButton}
                />

                {/* Botón para ir al login */}
                <Button
                    title="¿Ya tienes cuenta? Inicia Sesión"
                    onPress={handleGoToLogin}
                    variant="outline"
                    size="medium"
                    style={styles.loginButton}
                />
            </View>

            {/* Información adicional */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Al crear una cuenta, aceptas nuestros términos y condiciones
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
    
    // Botón de registro
    registerButton: {
        marginTop: 20,
        marginBottom: 16,
    },
    
    // Botón de login
    loginButton: {
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

export default Register; 